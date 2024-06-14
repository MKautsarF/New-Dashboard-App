import React, { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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

      // reset CCTV mode
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
      jsonToWrite.train_type = "KRL";
      jsonToWrite.no_ka = "8399";
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

      //generate pdf
      generatePDF(jsonToWrite);

      // Save file to local
      const fileName = "KCIC_" + getFilenameSafeDateString(new Date());

      console.log("tes");
      const dir = "C:/Train Simulator/Data/penilaian";

      if (!fs.existsSync(dir)) {
        await fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(
        `${dir}/${fileName}.json`,
        JSON.stringify(jsonToWrite, null, 2)
      );

      // // Hit C# API for score pdf result generation
      // console.log('tes');
      // const res = await processFile(fileName, 'on');
      // const resExcel = await processFileExcel(fileName, 'on');
      // setToastData({
      //   severity: 'success',
      //   msg: `Successfuly saved scores as ${fileName}.pdf!`,
      // });
      // setOpen(true);
      // console.log('tes');

      // open pdf in dekstop
      // navigate(`/finish?filename=${fileName}`);

      navigate(`/SecondPage`);

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
      sendTextToClients(JSON.stringify({ status: "finish" }, null, 2));
    }
  };

  const generatePDF = (json: any) => {
    const doc = new jsPDF();
    let nilaiAkhir = 0;
    let nilaiUnit = 0;
    const addHeader = (doc: any, title: any) => {
      doc.setFontSize(20);
      doc.text(title, doc.internal.pageSize.getWidth() / 2, 10, { align: 'center' });
      doc.setFontSize(12);
      doc.setLineWidth(0.5);
      doc.line(10, 25, doc.internal.pageSize.getWidth() - 10, 25); // Horizontal line
      doc.text('Mulai: ' + json.waktu_mulai, 14, 30);
      doc.text('Selesai: ' + json.waktu_selesai, 60, 30);
      doc.text('Durasi: ' +json.durasi, 110, 30);
      doc.text('Tanggal: ' + json.tanggal, 160, 30);
    };

    const addUnit = (unit: any, startY: number) => {
      //find last y
      
      doc.setFontSize(16);
      doc.text('Unit Kompetensi ' + unit.unit, 14, startY);
      doc.setFontSize(12);
      doc.text(unit.judul, 14, startY + 5);
    }

    const addData = (datas: any, startY: number) => {
      const bodyData = [];

  // Add the first row with rowspan
  bodyData.push([
    { content: datas.no + ".", rowSpan: datas.poin.length },
    { content: datas.langkah_kerja, rowSpan: datas.poin.length, styles: { textDecoration: datas.disable ? "line-through" : "none" } },
    { content: datas.poin[0].observasi, styles: { textDecoration: datas.poin[0].disable ? "line-through" : "none" } },
    { content: datas.poin[0].nilai.toString(), styles: { textDecoration: datas.poin[0].disable ? "line-through" : "none" } }
  ]);

  // Add remaining rows for poin
  for (let i = 1; i < datas.poin.length; i++) {
    bodyData.push([
      // { content: "", styles: { halign: "center" } },
      // { content: "", styles: { halign: "center" } },
      {
        content: datas.poin[i].observasi,
        styles: {
          textDecoration: datas.poin[i].disable ? "line-through" : "none"
        }
      },
      {
        content: datas.poin[i].nilai.toString(),
        styles: {
          textDecoration: datas.poin[i].disable ? "line-through" : "none"
        }
      }
    ]);
  }
      // Add the main table for each data item
    (doc as any).autoTable({
      startY: startY,
      head: [["No", "Langkah Kerja", "Poin Observasi", "Penilaian"]],
      body: bodyData,
      theme: "grid",
      styles: {
        fontSize: 12,
      },
      didDrawCell: (data: any) => {
        const { row, column, cell } = data;

        const cellContent = cell.text.join(' ');
        const cellWidth = cell.width;
        const textLines = doc.splitTextToSize(cellContent, cellWidth);
        const numberOfLines = textLines.length;

        console.log(`Number of lines in cell: ${numberOfLines}`);
        
        if (data.row.section === "body") {
          // Check if the content of langkah_kerja or poin.observasi/nilai contains "line-through"
          if (column.index <= 1 && data.row.index === 0) {
            const langkahKerja = datas.disable
            if (langkahKerja) {
              console.log("langkahKerja", cell.width);
              // const textPos = cell.textPos;
              doc.setDrawColor(255, 0, 0);
              doc.setLineWidth(1);
              for (let i = 0; i < numberOfLines; i++) {
                //get content width
                const linewidth = doc.getTextWidth(textLines[i])
                doc.line(cell.x + 1, cell.y + 4 + (i * 5), cell.x + linewidth + 1, cell.y + 4 + (i * 5));
              }
            }
          } else if ((column.index === 2 || column.index === 3)) {
            const observasi = datas.poin[data.row.index].disable;
            if (observasi) {
              // const textPos = cell.textPos;
              doc.setDrawColor(255, 0, 0);
              doc.setLineWidth(1);
              for (let i = 0; i < numberOfLines; i++) {
                //get content width
                const linewidth = doc.getTextWidth(textLines[i])
                doc.line(cell.x + 1, cell.y + 4 + (i * 5), cell.x + linewidth + 1, cell.y + 4 + (i * 5));
              }
            }
          }
        }
      }
    });

    // Calculate the average nilai
    let totalNilai = 0;
    for (let i = 0; i < datas.poin.length; i++) {
      totalNilai += datas.poin[i].nilai;
    }
    const averageNilai = Math.floor( totalNilai * 10 / datas.poin.length) / 10;
    nilaiUnit += averageNilai;

    // Add the "Rata-Rata Langkah Kerja" row
    (doc as any).autoTable({
      startY: (doc as any).lastAutoTable.finalY,
      body: [
        [
          { content: "Rata-Rata Langkah Kerja " + datas.no + " :", colSpan: 3 },
          { content: averageNilai, styles: { halign: "center" } }
        ]
      ],
      theme: "grid",
      styles: {
        fontSize: 12,
        fillColor: [220, 220, 220], // Gray background color
      },
    });
    }

    const addPoin = (poin: any, startY: number) => {
      doc.setFontSize(12);
      doc.text(poin.nama, 14, startY);
      doc.text(poin.nilai, 120, startY);
    }

    // Add header to the first page
    addHeader(doc, 'Hasil Simulasi Penilaian' + json.train_type);
    let totalScore = 0;
    doc.setFontSize(16);
    doc.text('Data Diri', 14, 40);
    autoTable(doc,{
      startY: 45,
      head: [['No', 'Data Diri', 'Keterangan']],
      body: [
        [1, "Nama Crew", json.nama_crew],
        [2, "Kedudukan", json.kedudukan],
        [3, "Usia", json.usia],
        [4, "Kode Kedinasan", json.kode_kedinasan],
        [5, "No KA", json.no_ka],
        [6, "Lintas", json.lintas],
        [7, "Nama Instruktur", json.nama_instruktur],
        [8, "Keterangan", json.keterangan]
      ],
      theme: "grid",
    });
    doc.addPage();
    doc.text('Penilaian', 16, 20);
    let startY = 25;
    doc.setFontSize(14);
    json.penilaian.forEach((unit: any,index: number) => {
      nilaiUnit = 0
      if (index > 0) {
        doc.addPage();
        startY = 20;
      }
      addUnit(unit, startY);
      startY += 10;
      unit.data.forEach((data: any) => {
        addData(data, startY);
        startY = (doc as any).lastAutoTable.finalY + 5;  
      });
      nilaiAkhir += nilaiUnit;
      const averageUnit = nilaiUnit / unit.data.length;
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY,
          body: [
            [
              { content: "Rata-Rata Unit " + unit.unit + " :", colSpan: 3 },
              { content: averageUnit, styles: { halign: "center" } }
            ]
          ],
          theme: "grid",
          styles: {
            fontSize: 12,
            fillColor: [220, 220, 220], // Gray background color
          },
      })
    });
    const averageAkhir = nilaiAkhir / json.penilaian.length
    const averageTotal = (averageAkhir + json.nilai_akhir) / 2;
    doc.addPage();
    autoTable(doc,{
      startY: 20,
      body: [
        [
          { content: "Rata-Rata total penilaian manual ",colSpan: 2 },
          { content: averageAkhir, styles: { halign: "center" } }
        ],
        [
          { content: "Rata-Rata total penilaian simulasi ",colSpan: 2 },
          { content: json.nilai_akhir, styles: { halign: "center" } }
        ],
        [
          { content: "Rata-Rata total penilaian total ",colSpan: 2 },
          { content: averageTotal, styles: { halign: "center" } }
        ]
      ],
      theme: "grid",
      styles: {
        fontSize: 12,
        fillColor: [220, 220, 220], // Gray background color
      },
    })
    doc.save('data.pdf');
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

  useEffect(() => {
    server.on("connection", (socket) => {
      console.log("Client connected - in start mode");

      // Add the new client socket to the array
      socketClients.push(socket);

      socket.on("data", (data) => {
        const stringData = data.toString();
        const payload = stringData.split("|").slice(-1)[0];
        const jsonData = JSON.parse(payload);

        console.log("received data: ", jsonData);

        if (jsonData.id === "K1.1.1") {
          setRealTimeNilai(Number(jsonData.nilai));
        }
      });

      socket.on("end", () => {
        console.log("Client disconnected");
        handleClientDisconnect(socket);
      });

      socket.on("error", (err) => {
        console.error("Socket error:", err.message);
        handleClientDisconnect(socket);
      });
    });

    socketClients.forEach((socket) => {
      socket.on("data", (data) => {
        const stringData = data.toString();
        const payload = stringData.split("|").slice(-1)[0];
        const jsonData = JSON.parse(payload);

        if (jsonData.id === "M1.1.1") {
          setRealTimeNilai(Number(jsonData.nilai));
        }
      });
    });

    return () => {
      socketClients.forEach((socket) => {
        socket.removeAllListeners("data");
      });
    };
  }, []);

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
