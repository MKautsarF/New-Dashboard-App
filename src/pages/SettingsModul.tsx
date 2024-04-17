import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@mui/material";
import Container from "@/components/Container";
import {
  Add,
  Delete,
  CheckBox,
  CheckBoxOutlineBlank,
} from "@mui/icons-material";
import { useSettings } from "../context/settings";
import pullAt from "lodash/pullAt";

function useQuery() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}

function SettingsModul() {
  const query = useQuery();

  const trainType = query.get("type") as "kcic" | "lrt";

  const fs = require("fs");
  const path = require("path");

  const navigate = useNavigate();

  const handlePrev = () => {
    // navigate("/FifthPage?type=lrt");
    navigate("/SecondPage");
  };

  const [checkedLRT, setCheckedLRT] = useState(
    localStorage.getItem("valueSettingsLRT") || null
  );
  const [checkedKCIC, setCheckedKCIC] = useState(
    localStorage.getItem("valueSettingsKCIC") || null
  );

  const handleClick = (buttonName: string) => {
    if (trainType === "lrt") {
      setCheckedLRT((prev) => (prev === buttonName ? null : buttonName));
      localStorage.setItem(
        "valueSettingsLRT",
        checkedLRT === buttonName ? null : buttonName
      );
    } else if (trainType === "kcic") {
      setCheckedKCIC((prev) => (prev === buttonName ? null : buttonName));
      localStorage.setItem(
        "valueSettingsKCIC",
        checkedKCIC === buttonName ? null : buttonName
      );
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
                <div>
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
                </div>
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
                <div>
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
                </div>
                {/* Anjlok button */}
                <div>
                  <Button
                    variant="outlined"
                    onClick={() => {
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
                <div>
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
                </div>
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
                <div>
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
                </div>
                {/* Anjlok button */}
                <div>
                  <Button
                    variant="outlined"
                    onClick={() => {
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
            Kembali
          </Button>
        </div>
      </Container>
    </>
  );
}

export default SettingsModul;
