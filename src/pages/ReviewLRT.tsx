import React, { useEffect, useMemo, useState } from "react";
// import { default as mrtjson } from '@/static/MockJSON_MRT.json';
import Container from "../components/Container";
import LangkahKerja from "../components/LangkahKerja";
// import Logo from "@/components/Logo";
import {
  Alert,
  AlertColor,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  TextField,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import {
  formatDurationToString,
  getFilenameSafeDateString,
} from "../utils/datestring";
// import {
//   processFile,
//   processFileExcel,
//   standbyCCTV,
// } from "../services/file.services";
import FullPageLoading from "../components/FullPageLoading";
import { shell } from "electron";
import {
  handleClientDisconnect,
  sendTextToClients,
  server,
  socketClients,
} from "@/socket";
import dayjs from "dayjs";
import { useSettings } from "../context/settings";
import { useAuth } from "../context/auth";
import { EditNoteRounded, EditNoteSharp, Stop } from "@mui/icons-material";
// const fs = require("fs");
// import { default as mrtjson } from "C:/Train Simulator/Data/MockJSON_KRL.json";
import fs from "fs";

interface ToastData {
  severity: AlertColor;
  msg: string;
}

function useQuery() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}

function ReviewLRT() {
  const query = useQuery();
  const navigate = useNavigate();
  const { instructor } = useAuth();
  const { settings } = useSettings();

  const [simulation, setSimulation] = useState(true);
  // const jsonPath = "C:/Train Simulator/Data/MockJSON_MRT.json";
  // const mrtjson = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

  const settingsType = query.get("type");
  const jsonPath =
    settingsType === "Default"
      ? "C:/Train Simulator/Data/MockJSON_KRL.json"
      : `C:/Train Simulator/Data/lrt_${settingsType}.json`;

  const mrtjson = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  const [realTimeNilai, setRealTimeNilai] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [toastData, setToastData] = useState<ToastData>({
    severity: "error",
    msg: "",
  });

  // Notes
  const [notes, setNotes] = useState("");
  const [notesOpen, setNotesOpen] = useState(false);

  const startTime = useMemo(() => dayjs(), []);

  // async function loadCctv() {
  //   try {
  //     await standbyCCTV("config", "standby");
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  const handleFinish = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNotesOpen(false);
    const { currentTarget } = e;

    try {
      setIsLoading(true);
      const endTime = dayjs();

      // hit API
      // await loadCctv();

      // Get input data from form
      const data = new FormData(currentTarget);
      const inputValues = data.getAll("penilaian");

      // Copy krl json mock template
      const jsonToWrite = mrtjson;

      // Write metadata
      // * Time
      jsonToWrite.waktu_mulai = startTime.format("HH.mm");
      jsonToWrite.waktu_selesai = endTime.format("HH.mm");

      const diff = endTime.diff(startTime, "second");
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      jsonToWrite.durasi = formatDurationToString(hours, minutes, seconds);
      jsonToWrite.tanggal = startTime.format("DD/MM/YYYY");

      // * Crew data
      jsonToWrite.nama_crew = settings.trainee.name;
      jsonToWrite.kedudukan =
        (settings.trainee.bio && settings.trainee.bio.position) || "";
      jsonToWrite.usia = `${
        settings.trainee.bio && settings.trainee.bio.born
          ? Math.abs(dayjs(settings.trainee.bio.born).diff(dayjs(), "years"))
          : "-"
      } tahun`;
      jsonToWrite.kode_kedinasan =
        (settings.trainee.bio && settings.trainee.bio.officialCode) || "";

      // * Train data
      jsonToWrite.train_type = "MRT";
      jsonToWrite.no_ka = "9041";
      jsonToWrite.lintas =
        settings.stasiunAsal + " - " + settings.stasiunTujuan;

      // * Instructor data
      jsonToWrite.nama_instruktur = instructor.name;

      // * Notes
      jsonToWrite.keterangan = notes === "" ? "-" : notes;

      // Write actual nilai to the copied krl json
      let jsonIdx = 0;

      jsonToWrite.penilaian.forEach((penilaian: any, i: number) => {
        // console.log('reading penilaian array');
        penilaian.data.forEach((data: any, j: number) => {
          // console.log('reading data array');
          data.poin.forEach((poin: any, k: number) => {
            // console.log('reading poin array');
            if (poin.nilai !== null) {
              poin.nilai = Number(inputValues[jsonIdx]);
              jsonIdx += 1;
            }
          });
        });
      });
      // console.log('penilaian done');

      // nilai skor akhir
      jsonToWrite.nilai_akhir = realTimeNilai < 0 ? 0 : realTimeNilai;

      // Save file to local
      const fileName = "MRT_" + getFilenameSafeDateString(new Date());

      const dir = "C:/Train Simulator/Data/penilaian";
      // if (!fs.existsSync(dir)) {
      //   await fs.mkdirSync(dir, { recursive: true });
      // }

      // fs.writeFileSync(
      //   `${dir}/${fileName}.json`,
      //   JSON.stringify(jsonToWrite, null, 2)
      // );

      // Hit C# API for score pdf result generation
      // const res = await processFile(fileName, "on");
      // const resExcel = await processFileExcel(fileName, "on");
      // setToastData({
      //   severity: "success",
      //   msg: `Successfuly saved scores as ${fileName}.pdf!`,
      // });
      // setOpen(true);

      // open pdf in dekstop
      // navigate(`/finish?filename=${fileName}`);
      // shell.openPath(`C:/Train Simulator/Data/penilaian/PDF/${fileName}.pdf`);
    } catch (e) {
      console.error(e);
      setToastData({
        severity: "error",
        msg: `Failed to save scores. Please try again later.`,
      });
      setOpen(true);
    } finally {
      setIsLoading(false);
      if (simulation) {
        setSimulation(false);
        sendTextToClients(JSON.stringify({ status: "finish" }, null, 2));
      }
    }
  };

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  // useEffect(() => {
  //   server.on("connection", (socket) => {
  //     console.log("Client connected - in start mode");

  //     // Add the new client socket to the array
  //     socketClients.push(socket);

  //     socket.on("data", (data) => {
  //       const stringData = data.toString();
  //       const payload = stringData.split("|").slice(-1)[0];
  //       const jsonData = JSON.parse(payload);

  //       console.log("received data: ", jsonData);

  //       if (jsonData.id === "M1.1.1") {
  //         setRealTimeNilai(Number(jsonData.nilai));
  //       }
  //     });

  //     socket.on("end", () => {
  //       console.log("Client disconnected");
  //       handleClientDisconnect(socket);
  //     });

  //     socket.on("error", (err) => {
  //       console.error("Socket error:", err.message);
  //       handleClientDisconnect(socket);
  //     });
  //   });

  //   socketClients.forEach((socket) => {
  //     socket.on("data", (data) => {
  //       const stringData = data.toString();
  //       const payload = stringData.split("|").slice(-1)[0];
  //       const jsonData = JSON.parse(payload);

  //       if (jsonData.id === "M1.1.1") {
  //         setRealTimeNilai(Number(jsonData.nilai));
  //       }
  //     });
  //   });

  //   return () => {
  //     socketClients.forEach((socket) => {
  //       socket.removeAllListeners("data");
  //     });
  //   };
  // }, []);

  return (
    <Container w={1000}>
      {/* <div className="w-1/3 absolute -translate-y-full py-4">
        <Logo />
      </div> */}
      <div className="p-8">
        <h1
          className="w-full text-center mb-8"
          style={{ fontSize: "2rem", fontWeight: "bold" }}
        >
          Penilaian Kereta: LRT
        </h1>

        <section className="w-full flex flex-col gap-2 items-center justify-center p-4 mb-4 bg-blue-100">
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            Nilai Simulasi
          </h2>
          <p className="text-3xl w-16 h-16 border-solid border-2 rounded-2xl border-white flex items-center justify-center">
            {realTimeNilai < 0 ? "0" : realTimeNilai}
          </p>
        </section>

        {/* Looping penilaian */}
        <Box component="form" id="penilaian-form" onSubmit={handleFinish}>
          <div>
            {mrtjson.penilaian.map((nilai: any, i: number) => (
              <section key={nilai.unit} className="pt-8 text-left ">
                <h2
                  style={{ fontSize: "1.5rem", fontWeight: "bold" }}
                  className="pb-4"
                >
                  Unit Kompetensi {nilai.unit}:
                </h2>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
                  {nilai.judul}
                </h2>
                {nilai.data.map((data: any, idx: number) => (
                  <LangkahKerja key={idx} keyVal={idx} data={data} />
                ))}
              </section>
            ))}
          </div>
        </Box>

        <div className="flex w-full justify-center items-center fixed bottom-0 left-0 shadow-lg">
          <div className="w-[600px] rounded-full flex px-4 py-3 mb-4 border-2 border-solid border-blue-400 bg-slate-50">
            {/* nav */}
            <div className="flex gap-4 justify-between w-full">
              <Button
                variant="text"
                color="error"
                onClick={() => {
                  if (simulation) {
                    setSimulation(false);
                    sendTextToClients(
                      JSON.stringify({ status: "finish" }, null, 2)
                    );
                  }
                  navigate(-1);
                }}
                sx={{
                  color: "#df2935",
                  borderColor: "#df2935",
                  // backgroundColor: "#ffffff",
                  "&:hover": {
                    borderColor: "#df2935",
                    backgroundColor: "#df2935",
                    color: "#ffffff",
                  },
                }}
              >
                Batal
              </Button>

              <Button
                className="ml-auto"
                // startIcon={<Stop />}
                variant="outlined"
                disabled={!simulation}
                onClick={() => {
                  setSimulation(false);
                  sendTextToClients(
                    JSON.stringify({ status: "finish" }, null, 2)
                  );
                }}
                sx={{
                  color: "#ffffff",
                  borderColor: "#df2935",
                  backgroundColor: "#df2935",
                  "&:hover": {
                    borderColor: "#b2212a",
                    backgroundColor: "#b2212a",
                    color: "#ffffff",
                  },
                }}
              >
                Stop Simulasi
              </Button>

              <Button
                variant="text"
                className="ml-auto"
                type="button"
                onClick={() => setNotesOpen(true)}
                // color="success"

                sx={{
                  color: "#00a6fb",
                  borderColor: "#00a6fb",
                  // backgroundColor: "#ffffff",
                  "&:hover": {
                    borderColor: "#00a6fb",
                    backgroundColor: "#00a6fb",
                    color: "#ffffff",
                  },
                }}
              >
                Selesai
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Notes dialog */}
      <Dialog open={notesOpen} onClose={() => setNotesOpen(false)}>
        <DialogContent className="w-96">
          <TextField
            autoFocus
            multiline
            id="notes"
            label="Catatan penilaian (opsional)"
            fullWidth
            value={notes}
            onChange={(e) => setNotes(e.currentTarget.value)}
            variant="standard"
            rows={4}
          />
        </DialogContent>
        <DialogActions className="mb-2 mx-2">
          <Button onClick={() => setNotesOpen(false)} color="error">
            Kembali
          </Button>
          <Button type="submit" form="penilaian-form" variant="contained">
            Selesai
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Alert
          onClose={handleClose}
          severity={toastData.severity}
          sx={{ width: "100%" }}
        >
          {toastData.msg}
        </Alert>
      </Snackbar>

      <FullPageLoading loading={isLoading} />
    </Container>
  );
}

export default ReviewLRT;
