import React from "react";
import { Button } from "@mui/material";

interface ButtonSettingsProps {
  buttonName: string;
  completion: number;
  onClick: (name: string) => void;
  checkedValue: string | null;
  activeButton: string | null;
  setActiveButton: (name: string) => void;
}

const ButtonSettings: React.FC<ButtonSettingsProps> = ({
  buttonName,
  completion,
  onClick,
  checkedValue,
  activeButton,
  setActiveButton,
}) => {
  const isDisabled = completion < (
    buttonName === "Menyalakan Kereta" ? 1 :
    buttonName === "Menjalankan Kereta" ? 1 :
    buttonName === "Mematikan Kereta" ? 2 :
    buttonName === "Keluar dari Depo" ? 3 :
    buttonName === "Masuk ke Depo" ? 4 :
    buttonName === "Pindah Jalur" ? 5 :
    buttonName === "Kereta Anjlok" ? 6 :
    7
  );

  const isActive = checkedValue === buttonName;

  const handleClick = () => {
    if (isDisabled) return;
    if (activeButton === buttonName) {
      setActiveButton(null); // Unset the button if it is already active
    } else {
      onClick(buttonName);
      setActiveButton(buttonName);
    }
  };

  return (
    <div>
      <Button
        variant={isActive ? "contained" : "text"}
        onClick={handleClick}
        sx={{
          color: isDisabled ? "#747875" : (isActive ? "#ffffff" : "#00a6fb"),
          backgroundColor: isActive ? "#00a6fb" : "#f3f3f4",
          padding: "16px 36px",
          fontSize: "1rem",
          "&:hover": {
            color: "#f3f3f4",
            backgroundColor: "#00a6fb",
          },
          opacity: isDisabled ? 0.5 : 1,
          pointerEvents: isDisabled ? "none" : "auto",
          width: "300px",
        }}
      >
        {buttonName}
      </Button>
    </div>
  );
};

export default ButtonSettings;
