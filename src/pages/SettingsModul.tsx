import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";  
import { Button } from "@mui/material";
import Container from "@/components/Container";
import ButtonSettings from "@/components/ButtonSettings";
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

const lrtButtons = [
  "Eksplorasi",
  "Menyalakan Kereta",
  "Menjalankan Kereta",
  "Mematikan Kereta",
  "Keluar dari Depo",
  "Masuk ke Depo",
  "Pindah Jalur",
  "Kereta Anjlok",
];

const kcicButtons = [
  "Eksplorasi",
  "Menyalakan Kereta",
  "Menjalankan Kereta",
  "Mematikan Kereta",
  "Keluar dari Depo",
  "Masuk ke Depo",
  "Pindah Jalur",
  "Kereta Anjlok",
];

function SettingsModul() {
  const [completion, setCompletion] = useState(7); // Pindahkan state ke dalam komponen
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const query = useQuery();
  const trainType = query.get("type") as "kcic" | "lrt";
  const navigate = useNavigate();

  const handlePrev = () => {
    navigate("/SecondPage");
  };

  const [checkedLRT, setCheckedLRT] = useState<string | null>(
    localStorage.getItem("valueSettingsLRT") || null
  );
  const [checkedKCIC, setCheckedKCIC] = useState<string | null>(
    localStorage.getItem("valueSettingsKCIC") || null
  );

  const handleClick = (buttonName: string) => {
    if (trainType === "lrt") {
      if (checkedLRT !== buttonName) {
        setCheckedLRT(buttonName);
        localStorage.setItem("valueSettingsLRT", buttonName);
      }
    } else if (trainType === "kcic") {
      if (checkedKCIC !== buttonName) {
        setCheckedKCIC(buttonName);
        localStorage.setItem("valueSettingsKCIC", buttonName);
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
            {trainType === "lrt" && lrtButtons.map((buttonName) => (
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

            {trainType === "kcic" && kcicButtons.map((buttonName) => (
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
            Kembali
          </Button>
        </div>
      </Container>
    </>
  );
}

export default SettingsModul;
