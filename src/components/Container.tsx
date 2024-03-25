import { useAuth } from "@/context/auth";
import { Person } from "@mui/icons-material";
import { Button } from "@mui/material";
import React, { useState } from "react";
import InstructorDetail from "./InstructorDetail";

interface ContainerProps {
  children: React.ReactNode;
  h?: number;
  w?: number;
}

const Container: React.FC<ContainerProps> = ({ children, h, w }) => {
  const { instructor } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  // mx-16 mt-32 mb-32k

  return (
    <div
      className="bg-white rounded-xl shadow-lg relative m-16"
      style={{
        height: h ? h : "auto",
        width: w ? w : "auto",
        borderColor: "#00a6fb",
        borderWidth: "1px",
        borderStyle: "solid",
      }}
    >
      {instructor.name !== "" && (
        <Button
          className="absolute top-0 right-2 -translate-y-full"
          variant="text"
          startIcon={<Person />}
          type="button"
          onClick={() => setIsOpen(true)}
        >
          {instructor.name}
        </Button>
      )}
      <InstructorDetail isOpen={isOpen} handleClose={() => setIsOpen(false)} />
      {children}
    </div>
  );
};

export default Container;
