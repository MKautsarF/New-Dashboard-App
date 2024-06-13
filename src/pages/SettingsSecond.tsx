import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@mui/material";
import Container from "@/components/Container";
import {
  Add,
  Delete,
  CheckBox,
  CheckBoxOutlineBlank,
  NavigateNext,
} from "@mui/icons-material";
import { useSettings } from "../context/settings";
import pullAt from "lodash/pullAt";
import { sendTextToClients } from "@/socket";

function useQuery() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}

function SettingsSecond() {
  const query = useQuery();

  const trainType = query.get("type") as "kcic" | "lrt";

  const fs = require("fs");
  const path = require("path");

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { settings, setSettings } = useSettings();

  const [selectedValue3, setSelectedValue3] = useState("normal");
  const [selectedValue4, setSelectedValue4] = useState("normal");
  const [completion, setComplition] = useState(3);

  const handlePrev = () => {
    // navigate("/FifthPage?type=lrt");
    navigate(`/Modul?type=${trainType}`);
  };

  const [checkedLRT, setCheckedLRT] = useState(
    localStorage.getItem(`valueSettingsLRT`) || null
  );
  const [checkedKCIC, setCheckedKCIC] = useState(
    localStorage.getItem("valueSettingsKCIC") || null
  );

  const handleClick = (buttonName: string) => {
    if (trainType === "lrt") {
      if (checkedLRT !== buttonName) {
        setCheckedLRT(buttonName);
        localStorage.setItem("valueSettingsLRT", buttonName);
        setSelectedValue3(buttonName);
      }
    } else if (trainType === "kcic") {
      if (checkedKCIC !== buttonName) {
        setCheckedKCIC(buttonName);
        localStorage.setItem("valueSettingsKCIC", buttonName);
        setSelectedValue4(buttonName);
      }
    }
  };

  useEffect(() => {
    const lastCheckedItemLRT = localStorage.getItem("valueSettingsLRT");
    if (lastCheckedItemLRT) {
      setCheckedLRT(lastCheckedItemLRT);
    }

    const lastCheckedItemKCIC = localStorage.getItem("valueSettingsKCIC");
    if (lastCheckedItemKCIC) {
      setCheckedKCIC(lastCheckedItemKCIC);
    }
  }, []);

  // useEffect(() => {
  //   const storedValue3 = localStorage.getItem(`valueSettingsLRT`);
  //   if (storedValue3) {
  //     setSelectedValue3(storedValue3);
  //   }
  // }, []);

  const handleMulai = async () => {
    // let startStation = "";
    // let finishStation = "";

    // // Assign start and finish stations based on the selected line
    // if (settings.line === "a Line") {
    //   startStation = "Harjamukti";
    //   finishStation = "TMII";
    // }

    const payload = {
      // module: "Learning",
      train_type: trainType.toUpperCase(),
      // train_type: "KRL",
      train: {
        weight: "30",
        // type: settings.kereta,
        type: "6 Rangkaian",
      },
      time: 12,
      weather: [
        {
          value: "Cerah",
          location: [0, 0],
          name: "rain",
        },
        {
          value: 0,
          location: [0, 0],
          name: "fog",
        },
      ],
      route: {
        start: {
          // name: settings.stasiunAsal,
          name: "Harjamukti",
        },
        finish: {
          // name: settings.stasiunTujuan,
          name: "TMII",
        },
      },
      motion_base: false,
      speed_buzzer: true,
      speed_limit: 70,
      status: "play",
      module: trainType === "kcic" ? selectedValue4 : selectedValue3,
    };

    console.log(payload);

    try {
      setIsLoading(true);

      // console.log(currentPeserta.id);

      // ganti submission, penyebab error
      // const submission = {
      //   owner: currentPeserta.id,
      //   train: payload.train_type,
      //   setting: payload,
      // };
      // const res = await createSubmission(submission);
      // currentSubmission.id = res.id;

      // setCurrentSubmission(res.id);

      sendTextToClients(JSON.stringify(payload, null, 2)); // add button name here
      // console.log(payload);

      // await loadCctv();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      // navigate(`/FifthPage/LRT?type=${selectedValue3}`);
      navigate(`/FifthPage/${trainType}?type=${settings.score}`);
    }
  };

  return (
    <>
      <Container w={900}>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col text-left gap-4 p-8 ">
            {/* {settings.score && <p>Selected Value: {settings.score}</p>} */}
            <h1 style={{ fontSize: "1.75rem", fontWeight: "bold" }}>
              Pengaturan Kereta {trainType.toUpperCase()}
            </h1>
            <p style={{ fontSize: "1.25rem" }}>
              Pilih setelan kereta yang akan digunakan:
            </p>
          </div>

          <div className="flex flex-col pl-8 gap-4 pr-8 justify-center items-center">
            {/* Buttons for LRT */}
            {trainType === "lrt" && (
              <>
                {/* normal button */}
                {/* <div>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      handleClick("Normal");
                    }}
                    sx={{
                      color: "#00a6fb",
                      backgroundColor: "#f3f3f4",
                      padding: "12px 48px",
                      fontSize: "1rem",
                      "&:hover": {
                        color: "#f3f3f4",
                        backgroundColor: "#00a6fb",
                      },
                    }}
                  >
                    Normal
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => handleClick("Normal")} // Reset checkbox state on clicking Default button
                    sx={{
                      color: "#00a6fb",
                      padding: "12px ",
                      fontSize: "1rem",
                      borderColor: "#00a6fb",
                    }}
                  >
                    {checkedLRT === "Normal" ? (
                      <CheckBox />
                    ) : (
                      <CheckBoxOutlineBlank />
                    )}
                  </Button>
                </div> */}
                {/* Turn On button */}
                <div>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      handleClick("Menyalakan Kereta");
                    }}
                    sx={{
                      color: "#00a6fb",
                      backgroundColor: "#f3f3f4",
                      padding: "12px 48px",
                      fontSize: "1rem",
                      "&:hover": {
                        color: "#f3f3f4",
                        backgroundColor: "#00a6fb",
                      },
                    }}
                  >
                    Menyalakan Kereta
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => handleClick("Menyalakan Kereta")} // Reset checkbox state on clicking Default button
                    sx={{
                      color: "#00a6fb",
                      padding: "12px ",
                      fontSize: "1rem",
                      borderColor: "#00a6fb",
                    }}
                  >
                    {checkedLRT === "Menyalakan Kereta" ? (
                      <CheckBox />
                    ) : (
                      <CheckBoxOutlineBlank />
                    )}
                  </Button>
                </div>
                {/* Run button */}
                <div>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      if (completion < 1) {
                        return;
                      }
                      handleClick("Menjalankan Kereta");
                    }}
                    sx={{
                      color: "#00a6fb",
                      backgroundColor: "#f3f3f4",
                      padding: "12px 48px",
                      fontSize: "1rem",
                      "&:hover": {
                        color: "#f3f3f4",
                        backgroundColor: "#00a6fb",
                      },
                      opacity: completion < 1 ? 0.5 : 1, // disable button if completion < 1
                      pointerEvents: completion < 1 ? "none" : "auto", // disable button if completion < 1
                    }}
                  >
                    Menjalankan Kereta
                  </Button>
                  <Button
                    variant="text"
                    onClick={() =>{ 
                      if (completion < 1) {
                        return;
                      }
                      handleClick("Menjalankan Kereta")}} // Reset checkbox state on clicking Default button
                    sx={{
                      color: "#00a6fb",
                      padding: "12px ",
                      fontSize: "1rem",
                      borderColor: "#00a6fb",
                      opacity: completion < 1 ? 0.5 : 1, // disable button if completion < 1
                      pointerEvents: completion < 1 ? "none" : "auto", // disable button if completion < 1
                    }}
                  >
                    {checkedLRT === "Menjalankan Kereta" ? (
                      <CheckBox />
                    ) : (
                      <CheckBoxOutlineBlank />
                    )}
                  </Button>
                </div>
                {/* Turn Off button */}
                <div>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      if (completion < 2) {
                        return;
                      }
                      handleClick("Mematikan Kereta");
                    }}
                    sx={{
                      color: "#00a6fb",
                      backgroundColor: "#f3f3f4",
                      padding: "12px 48px",
                      fontSize: "1rem",
                      "&:hover": {
                        color: "#f3f3f4",
                        backgroundColor: "#00a6fb",
                      },
                      opacity: completion < 2 ? 0.5 : 1, // disable button if completion < 2
                      pointerEvents: completion < 2 ? "none" : "auto", // disable button if completion < 2
                    }}
                  >
                    Mematikan Kereta
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => {
                      if (completion < 2) {
                        return;
                      }
                      handleClick("Mematikan Kereta")}} // Reset checkbox state on clicking Default button
                    sx={{
                      color: "#00a6fb",
                      padding: "12px ",
                      fontSize: "1rem",
                      borderColor: "#00a6fb",
                      opacity: completion < 2 ? 0.5 : 1, // disable button if completion < 2
                      pointerEvents: completion < 2 ? "none" : "auto", // disable button if completion < 2
                    }}
                  >
                    {checkedLRT === "Mematikan Kereta" ? (
                      <CheckBox />
                    ) : (
                      <CheckBoxOutlineBlank />
                    )}
                  </Button>
                </div>
                {/* Exiting button */}
                <div>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      if (completion < 3) {
                        return;
                      }
                      handleClick("Keluar dari Depo");
                    }}
                    sx={{
                      color: "#00a6fb",
                      backgroundColor: "#f3f3f4",
                      padding: "12px 48px",
                      fontSize: "1rem",
                      "&:hover": {
                        color: "#f3f3f4",
                        backgroundColor: "#00a6fb",
                      },
                      opacity: completion < 3 ? 0.5 : 1, // disable button if completion < 3
                      pointerEvents: completion < 3 ? "none" : "auto", // disable button if completion < 3
                    }}
                  >
                    Keluar dari Depo
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => {
                      if (completion < 3) {
                        return;
                      }
                      handleClick("Keluar dari Depo")}} // Reset checkbox state on clicking Default button
                    sx={{
                      color: "#00a6fb",
                      padding: "12px ",
                      fontSize: "1rem",
                      borderColor: "#00a6fb",
                      opacity: completion < 3 ? 0.5 : 1, // disable button if completion < 3
                      pointerEvents: completion < 3 ? "none" : "auto", // disable button if completion < 3
                    }}
                  >
                    {checkedLRT === "Keluar dari Depo" ? (
                      <CheckBox />
                    ) : (
                      <CheckBoxOutlineBlank />
                    )}
                  </Button>
                </div>
                {/* Entering button */}
                <div>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      if (completion < 4) {
                        return;
                      }
                      handleClick("Masuk ke Depo");
                    }}
                    sx={{
                      color: "#00a6fb",
                      backgroundColor: "#f3f3f4",
                      padding: "12px 48px",
                      fontSize: "1rem",
                      "&:hover": {
                        color: "#f3f3f4",
                        backgroundColor: "#00a6fb",
                      },
                      opacity: completion < 4 ? 0.5 : 1, // disable button if completion < 4
                      pointerEvents: completion < 4 ? "none" : "auto", // disable button if completion < 4
                    }}
                  >
                    Masuk ke Depo
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => handleClick("Masuk ke Depo")} // Reset checkbox state on clicking Default button
                    sx={{
                      color: "#00a6fb",
                      padding: "12px ",
                      fontSize: "1rem",
                      borderColor: "#00a6fb",
                      opacity: completion < 4 ? 0.5 : 1, // disable button if completion < 4
                      pointerEvents: completion < 4 ? "none" : "auto", // disable button if completion < 4
                    }}
                  >
                    {checkedLRT === "Masuk ke Depo" ? (
                      <CheckBox />
                    ) : (
                      <CheckBoxOutlineBlank />
                    )}
                  </Button>
                </div>
                {/* Switch button */}
                <div>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      if (completion < 5) {
                        return;
                      }
                      handleClick("Pindah Jalur");
                    }}
                    sx={{
                      color: "#00a6fb",
                      backgroundColor: "#f3f3f4",
                      padding: "12px 48px",
                      fontSize: "1rem",
                      "&:hover": {
                        color: "#f3f3f4",
                        backgroundColor: "#00a6fb",
                      },
                      opacity: completion < 5 ? 0.5 : 1, // disable button if completion < 5
                      pointerEvents: completion < 5 ? "none" : "auto", // disable button if completion < 5
                    }}
                  >
                    Pindah Jalur
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => handleClick("Pindah Jalur")} // Reset checkbox state on clicking Default button
                    sx={{
                      color: "#00a6fb",
                      padding: "12px ",
                      fontSize: "1rem",
                      borderColor: "#00a6fb",
                      opacity: completion < 5 ? 0.5 : 1, // disable button if completion < 5
                      pointerEvents: completion < 5 ? "none" : "auto", // disable button if completion < 5
                    }}
                  >
                    {checkedLRT === "Pindah Jalur" ? (
                      <CheckBox />
                    ) : (
                      <CheckBoxOutlineBlank />
                    )}
                  </Button>
                </div>
                {/* Door Problem button */}
                {/* <div>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      handleClick("Gangguan Pintu");
                    }}
                    sx={{
                      color: "#00a6fb",
                      backgroundColor: "#f3f3f4",
                      padding: "12px 48px",
                      fontSize: "1rem",
                      "&:hover": {
                        color: "#f3f3f4",
                        backgroundColor: "#00a6fb",
                      },
                    }}
                  >
                    Gangguan Pintu
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => handleClick("Gangguan Pintu")} // Reset checkbox state on clicking Default button
                    sx={{
                      color: "#00a6fb",
                      padding: "12px ",
                      fontSize: "1rem",
                      borderColor: "#00a6fb",
                    }}
                  >
                    {checkedLRT === "Gangguan Pintu" ? (
                      <CheckBox />
                    ) : (
                      <CheckBoxOutlineBlank />
                    )}
                  </Button>
                </div> */}
                {/* Anjlok button */}
                <div>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      if (completion < 6) {
                        return;
                      }
                      handleClick("Kereta Anjlok");
                    }}
                    sx={{
                      color: "#00a6fb",
                      backgroundColor: "#f3f3f4",
                      padding: "12px 48px",
                      fontSize: "1rem",
                      "&:hover": {
                        color: "#f3f3f4",
                        backgroundColor: "#00a6fb",
                      },
                      opacity: completion < 6 ? 0.5 : 1, // disable button if completion < 6
                      pointerEvents: completion < 6 ? "none" : "auto", // disable button if completion < 6
                    }}
                  >
                    Kereta Anjlok
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => handleClick("Kereta Anjlok")} // Reset checkbox state on clicking Default button
                    sx={{
                      color: "#00a6fb",
                      padding: "12px ",
                      fontSize: "1rem",
                      borderColor: "#00a6fb",
                      opacity: completion < 6 ? 0.5 : 1, // disable button if completion < 6
                      pointerEvents: completion < 6 ? "none" : "auto", // disable button if completion < 6
                    }}
                  >
                    {checkedLRT === "Kereta Anjlok" ? (
                      <CheckBox />
                    ) : (
                      <CheckBoxOutlineBlank />
                    )}
                  </Button>
                </div>
              </>
            )}

            {/* Buttons for KCIC */}
            {trainType === "kcic" && (
              <>
                {/* Add your KCIC buttons here */}

                {/* normal button */}
                {/* <div>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      handleClick("Normal");
                    }}
                    sx={{
                      color: "#00a6fb",
                      backgroundColor: "#f3f3f4",
                      padding: "12px 48px",
                      fontSize: "1rem",
                      "&:hover": {
                        color: "#f3f3f4",
                        backgroundColor: "#00a6fb",
                      },
                    }}
                  >
                    Normal
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => handleClick("Normal")} // Reset checkbox state on clicking Default button
                    sx={{
                      color: "#00a6fb",
                      padding: "12px ",
                      fontSize: "1rem",
                      borderColor: "#00a6fb",
                    }}
                  >
                    {checkedKCIC === "Normal" ? (
                      <CheckBox />
                    ) : (
                      <CheckBoxOutlineBlank />
                    )}
                  </Button>
                </div> */}
                {/* Turn On button */}
                <div>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      handleClick("Menyalakan Kereta");
                    }}
                    sx={{
                      color: "#00a6fb",
                      backgroundColor: "#f3f3f4",
                      padding: "12px 48px",
                      fontSize: "1rem",
                      "&:hover": {
                        color: "#f3f3f4",
                        backgroundColor: "#00a6fb",
                      },
                    }}
                  >
                    Menyalakan Kereta
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => handleClick("Menyalakan Kereta")} // Reset checkbox state on clicking Default button
                    sx={{
                      color: "#00a6fb",
                      padding: "12px ",
                      fontSize: "1rem",
                      borderColor: "#00a6fb",
                    }}
                  >
                    {checkedKCIC === "Menyalakan Kereta" ? (
                      <CheckBox />
                    ) : (
                      <CheckBoxOutlineBlank />
                    )}
                  </Button>
                </div>
                {/* Run button */}
                <div>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      if (completion < 1) {
                        return;
                      }
                      handleClick("Menjalankan Kereta");
                    }}
                    sx={{
                      color: "#00a6fb",
                      backgroundColor: "#f3f3f4",
                      padding: "12px 48px",
                      fontSize: "1rem",
                      "&:hover": {
                        color: "#f3f3f4",
                        backgroundColor: "#00a6fb",
                      },
                      opacity: completion < 1 ? 0.5 : 1, // disable button if completion < 1
                      pointerEvents: completion < 1 ? "none" : "auto", // disable button if completion < 1
                    }}
                  >
                    Menjalankan Kereta
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => handleClick("Menjalankan Kereta")} // Reset checkbox state on clicking Default button
                    sx={{
                      color: "#00a6fb",
                      padding: "12px ",
                      fontSize: "1rem",
                      borderColor: "#00a6fb",
                      opacity: completion < 1 ? 0.5 : 1, // disable button if completion < 1
                      pointerEvents: completion < 1 ? "none" : "auto", // disable button if completion < 1
                    }}
                  >
                    {checkedKCIC === "Menjalankan Kereta" ? (
                      <CheckBox />
                    ) : (
                      <CheckBoxOutlineBlank />
                    )}
                  </Button>
                </div>
                {/* Turn Off button */}
                <div>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      if (completion < 2) {
                        return;
                      }
                      handleClick("Mematikan Kereta");
                    }}
                    sx={{
                      color: "#00a6fb",
                      backgroundColor: "#f3f3f4",
                      padding: "12px 48px",
                      fontSize: "1rem",
                      "&:hover": {
                        color: "#f3f3f4",
                        backgroundColor: "#00a6fb",
                      },
                      opacity: completion < 2 ? 0.5 : 1, // disable button if completion < 2
                      pointerEvents: completion < 2 ? "none" : "auto", // disable button if completion < 2
                    }}
                  >
                    Mematikan Kereta
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => handleClick("Mematikan Kereta")} // Reset checkbox state on clicking Default button
                    sx={{
                      color: "#00a6fb",
                      padding: "12px ",
                      fontSize: "1rem",
                      borderColor: "#00a6fb",
                      opacity: completion < 2 ? 0.5 : 1, // disable button if completion < 2
                      pointerEvents: completion < 2 ? "none" : "auto", // disable button if completion < 2
                    }}
                  >
                    {checkedKCIC === "Mematikan Kereta" ? (
                      <CheckBox />
                    ) : (
                      <CheckBoxOutlineBlank />
                    )}
                  </Button>
                </div>
                {/* Exiting button */}
                <div>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      if (completion < 3) {
                        return;
                      }
                      handleClick("Keluar dari Depo");
                    }}
                    sx={{
                      color: "#00a6fb",
                      backgroundColor: "#f3f3f4",
                      padding: "12px 48px",
                      fontSize: "1rem",
                      "&:hover": {
                        color: "#f3f3f4",
                        backgroundColor: "#00a6fb",
                      },
                      opacity: completion < 3 ? 0.5 : 1, // disable button if completion < 3
                      pointerEvents: completion < 3 ? "none" : "auto", // disable button if completion < 3
                    }}
                  >
                    Keluar dari Depo
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => handleClick("Keluar dari Depo")} // Reset checkbox state on clicking Default button
                    sx={{
                      color: "#00a6fb",
                      padding: "12px ",
                      fontSize: "1rem",
                      borderColor: "#00a6fb",
                      opacity: completion < 3 ? 0.5 : 1, // disable button if completion < 3
                      pointerEvents: completion < 3 ? "none" : "auto", // disable button if completion < 3
                    }}
                  >
                    {checkedKCIC === "Keluar dari Depo" ? (
                      <CheckBox />
                    ) : (
                      <CheckBoxOutlineBlank />
                    )}
                  </Button>
                </div>
                {/* Entering button */}
                <div>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      if (completion < 4) {
                        return;
                      }
                      handleClick("Masuk ke Depo");
                    }}
                    sx={{
                      color: "#00a6fb",
                      backgroundColor: "#f3f3f4",
                      padding: "12px 48px",
                      fontSize: "1rem",
                      "&:hover": {
                        color: "#f3f3f4",
                        backgroundColor: "#00a6fb",
                      },
                      opacity: completion < 4 ? 0.5 : 1, // disable button if completion < 4
                      pointerEvents: completion < 4 ? "none" : "auto", // disable button if completion < 4
                    }}
                  >
                    Masuk ke Depo
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => handleClick("Masuk ke Depo")} // Reset checkbox state on clicking Default button
                    sx={{
                      color: "#00a6fb",
                      padding: "12px ",
                      fontSize: "1rem",
                      borderColor: "#00a6fb",
                      opacity: completion < 4 ? 0.5 : 1, // disable button if completion < 4
                      pointerEvents: completion < 4 ? "none" : "auto", // disable button if completion < 4
                    }}
                  >
                    {checkedKCIC === "Masuk ke Depo" ? (
                      <CheckBox />
                    ) : (
                      <CheckBoxOutlineBlank />
                    )}
                  </Button>
                </div>
                {/* Switch button */}
                <div>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      if (completion < 5) {
                        return;
                      }
                      handleClick("Pindah Jalur");
                    }}
                    sx={{
                      color: "#00a6fb",
                      backgroundColor: "#f3f3f4",
                      padding: "12px 48px",
                      fontSize: "1rem",
                      "&:hover": {
                        color: "#f3f3f4",
                        backgroundColor: "#00a6fb",
                      },
                      opacity: completion < 5 ? 0.5 : 1, // disable button if completion < 5
                      pointerEvents: completion < 5 ? "none" : "auto", // disable button if completion < 5
                    }}
                  >
                    Pindah Jalur
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => handleClick("Pindah Jalur")} // Reset checkbox state on clicking Default button
                    sx={{
                      color: "#00a6fb",
                      padding: "12px ",
                      fontSize: "1rem",
                      borderColor: "#00a6fb",
                      opacity: completion < 5 ? 0.5 : 1, // disable button if completion < 5
                      pointerEvents: completion < 5 ? "none" : "auto", // disable button if completion < 5
                    }}
                  >
                    {checkedKCIC === "Pindah Jalur" ? (
                      <CheckBox />
                    ) : (
                      <CheckBoxOutlineBlank />
                    )}
                  </Button>
                </div>
                {/* Door Problem button */}
                {/* <div>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      handleClick("Gangguan Pintu");
                    }}
                    sx={{
                      color: "#00a6fb",
                      backgroundColor: "#f3f3f4",
                      padding: "12px 48px",
                      fontSize: "1rem",
                      "&:hover": {
                        color: "#f3f3f4",
                        backgroundColor: "#00a6fb",
                      },
                    }}
                  >
                    Gangguan Pintu
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => handleClick("Gangguan Pintu")} // Reset checkbox state on clicking Default button
                    sx={{
                      color: "#00a6fb",
                      padding: "12px ",
                      fontSize: "1rem",
                      borderColor: "#00a6fb",
                    }}
                  >
                    {checkedKCIC === "Gangguan Pintu" ? (
                      <CheckBox />
                    ) : (
                      <CheckBoxOutlineBlank />
                    )}
                  </Button>
                </div> */}
                {/* Anjlok button */}
                <div>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      if (completion < 6) {
                        return;
                      }
                      handleClick("Kereta Anjlok");
                    }}
                    sx={{
                      color: "#00a6fb",
                      backgroundColor: "#f3f3f4",
                      padding: "12px 48px",
                      fontSize: "1rem",
                      "&:hover": {
                        color: "#f3f3f4",
                        backgroundColor: "#00a6fb",
                      },
                      opacity: completion < 6 ? 0.5 : 1, // disable button if completion < 6
                      pointerEvents: completion < 6 ? "none" : "auto", // disable button if completion < 6
                    }}
                  >
                    Kereta Anjlok
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => handleClick("Kereta Anjlok")} // Reset checkbox state on clicking Default button
                    sx={{
                      color: "#00a6fb",
                      padding: "12px ",
                      fontSize: "1rem",
                      borderColor: "#00a6fb",
                      opacity: completion < 6 ? 0.5 : 1, // disable button if completion < 6
                      pointerEvents: completion < 6 ? "none" : "auto", // disable button if completion < 6
                    }}
                  >
                    {checkedKCIC === "Kereta Anjlok" ? (
                      <CheckBox />
                    ) : (
                      <CheckBoxOutlineBlank />
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* nav */}
        <div className="flex gap-4 justify-between p-8 w-full">
          <Button
            type="button"
            color="error"
            variant="outlined"
            className="bottom-0 mt-4"
            sx={{
              color: "#df2935",
              borderColor: "#df2935",
              backgroundColor: "#ffffff",
              "&:hover": {
                borderColor: "#df2935",
                backgroundColor: "#df2935",
                color: "#ffffff",
              },
            }}
            onClick={() => {
              handlePrev();
            }}
          >
            Back
          </Button>
          <Button
            variant="outlined"
            endIcon={<NavigateNext />}
            onClick={() => {
              handleMulai();
              // handleNext();
            }}
            sx={{
              color: "#f3f3f4",
              backgroundColor: "#00a6fb", // Change background color based on disabled state
              borderColor: "#f3f3f4",
              fontSize: "1.1rem",
              "&:hover": {
                borderColor: "#4dc1fc", // Change border color based on disabled state
                color: "#f3f3f4",
                backgroundColor: "#4dc1fc", // Change background color based on disabled state
              },
            }}
          >
            Start
          </Button>
        </div>
      </Container>
    </>
  );
}

export default SettingsSecond;
