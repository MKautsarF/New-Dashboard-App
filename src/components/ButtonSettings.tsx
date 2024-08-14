import React from "react";
import { Button, SxProps } from "@mui/material";

interface ButtonSettingsProps {
  buttonName: string;
  completion: number;
  // requiredCompletion: number; // Add this prop
  onClick?: (name: string) => void;
  checkedValue: string | null;
  activeButton: string | null;
  sx?: SxProps;
}

const ButtonSettings: React.FC<ButtonSettingsProps> = ({
  buttonName,
  completion,
  // requiredCompletion, // Use this prop
  onClick,
  checkedValue,
  activeButton,
  sx,
}) => {
  // const isDisabled = completion < requiredCompletion;

  const isActive = checkedValue === buttonName;

  // const handleClick = () => {
  //   if (isDisabled || !onClick) return;
  //   onClick(buttonName);
  // };

  const handleClick = () => {
    if (!onClick) return;
    onClick(buttonName);
  };

  return (
    <div>
      <Button
        variant={isActive ? "contained" : "text"}
        onClick={handleClick}
        sx={{
          color: isActive ? "#ffffff" : "#00a6fb",
          backgroundColor: isActive ? "#00a6fb" : "#f3f3f4",
          padding: "16px 36px",
          fontSize: "1rem",
          "&:hover": {
            color: onClick ? "#f3f3f4" : "inherit",
            backgroundColor: onClick ? "#00a6fb" : "inherit",
          },
          opacity: 1,
          pointerEvents: "auto",
          width: "300px",
          ...sx,
        }}
      >
        {buttonName}
      </Button>
    </div>
  );
};

export default ButtonSettings;
