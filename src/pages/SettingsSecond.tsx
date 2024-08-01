import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@mui/material";
import Container from "@/components/Container";
import { NavigateNext } from "@mui/icons-material";
import { useSettings } from "../context/settings";
import { sendTextToClients } from "@/socket";
import ButtonSettings from "@/components/ButtonSettings";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function SettingsSecond() {
  const query = useQuery();
  const trainType = query.get("type") as "kcic" | "lrt";
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { settings } = useSettings();

  const [selectedValue3, setSelectedValue3] = useState<string>("");
  const [selectedValue4, setSelectedValue4] = useState<string>("");
  const [completion, setCompletion] = useState(3);
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const [checkedLRT, setCheckedLRT] = useState<string | null>(null);
  const [checkedKCIC, setCheckedKCIC] = useState<string | null>(null);

  const handlePrev = () => {
    navigate(`/Modul?type=${trainType}`);
  };

  const handleClick = (buttonName: string) => {
    console.log(`Currently pressed: ${buttonName}`);
    if (trainType === "lrt") {
      if (checkedLRT === buttonName) {
        setCheckedLRT(null);
        localStorage.removeItem("valueSettingsLRT");
        setSelectedValue3("");
        setActiveButton(null);
      } else {
        setCheckedLRT(buttonName);
        localStorage.setItem("valueSettingsLRT", buttonName);
        setSelectedValue3(buttonName);
        setCheckedKCIC(null); // Ensure KCIC buttons are not selected
      }
    } else if (trainType === "kcic") {
      if (checkedKCIC === buttonName) {
        setCheckedKCIC(null);
        localStorage.removeItem("valueSettingsKCIC");
        setSelectedValue4("");
        setActiveButton(null);
      } else {
        setCheckedKCIC(buttonName);
        localStorage.setItem("valueSettingsKCIC", buttonName);
        setSelectedValue4(buttonName);
        setCheckedLRT(null); // Ensure LRT buttons are not selected
      }
    }
  };

  useEffect(() => {
    const lastCheckedItemLRT = localStorage.getItem("valueSettingsLRT");
    if (lastCheckedItemLRT) {
      setCheckedLRT(lastCheckedItemLRT);
      setSelectedValue3(lastCheckedItemLRT);
    }

    const lastCheckedItemKCIC = localStorage.getItem("valueSettingsKCIC");
    if (lastCheckedItemKCIC) {
      setCheckedKCIC(lastCheckedItemKCIC);
      setSelectedValue4(lastCheckedItemKCIC);
    }
  }, []);

  const payload = useMemo(() => {
    return {
      train_type: trainType.toUpperCase(),
      train: {
        weight: "30",
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
          name: "Harjamukti",
        },
        finish: {
          name: "TMII",
        },
      },
      motion_base: false,
      speed_buzzer: true,
      speed_limit: 70,
      status: "play",
      module: trainType === "kcic" ? selectedValue4 : selectedValue3,
    };
  }, [selectedValue3, selectedValue4, trainType]);

  useEffect(() => {
    console.log("Payload updated:", payload);
  }, [payload]);

  const handleMulai = async () => {
    try {
      console.log("sent payload:", payload);
      setIsLoading(true);
      sendTextToClients(JSON.stringify(payload, null, 2));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      navigate(`/FifthPage/${trainType}?type=${settings.score}`);
    }
  };

  const lrtButtons = [
    "Menyalakan Kereta",
    "Menjalankan Kereta",
    "Mematikan Kereta",
    "Keluar dari Depo",
    "Masuk ke Depo",
    "Pindah Jalur",
    "Kereta Anjlok",
  ];

  const kcicButtons = [
    "Menyalakan Kereta",
    "Menjalankan Kereta",
    "Mematikan Kereta",
    "Keluar dari Depo",
    "Masuk ke Depo",
    "Pindah Jalur",
    "Kereta Anjlok",
  ];

  return (
    <>
      <Container w={900}>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col text-left gap-4 p-8 ">
            <h1 style={{ fontSize: "1.75rem", fontWeight: "bold" }}>
              Pengaturan Kereta {trainType.toUpperCase()}
            </h1>
            <p style={{ fontSize: "1.25rem" }}>
              Pilih setelan kereta yang akan digunakan:
            </p>
          </div>

          <div className="flex flex-col pl-8 gap-4 pr-8 justify-center items-center">
            {/* Buttons for LRT */}
            {trainType === "lrt" &&
              lrtButtons.map((buttonName) => (
                <ButtonSettings
                  key={buttonName}
                  buttonName={buttonName}
                  completion={completion}
                  onClick={handleClick}
                  checkedValue={checkedLRT}
                  activeButton={activeButton}
                  setActiveButton={setActiveButton}
                />
              ))}

            {/* Buttons for KCIC */}
            {trainType === "kcic" &&
              kcicButtons.map((buttonName) => (
                <ButtonSettings
                  key={buttonName}
                  buttonName={buttonName}
                  completion={completion}
                  onClick={handleClick}
                  checkedValue={checkedKCIC}
                  activeButton={activeButton}
                  setActiveButton={setActiveButton}
                />
              ))}
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
            onClick={handlePrev}
          >
            Back
          </Button>
          {payload.module ? (
            <Button
              type="button"
              variant="outlined"
              endIcon={<NavigateNext />}
              onClick={handleMulai}
              sx={{
                color: "#f3f3f4",
                backgroundColor: "#00a6fb",
                borderColor: "#f3f3f4",
                fontSize: "1.1rem",
                "&:hover": {
                  borderColor: "#4dc1fc",
                  color: "#f3f3f4",
                  backgroundColor: "#4dc1fc",
                },
              }}
            >
              Start
            </Button>
          ) : null}
        </div>
      </Container>
    </>
  );
}

export default SettingsSecond;