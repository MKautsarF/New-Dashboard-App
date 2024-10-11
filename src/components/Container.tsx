import { useAuth } from "@/context/auth";
import { Person, Warning } from "@mui/icons-material";
import { Button, Dialog, DialogContent } from "@mui/material";
import React, { useState } from "react";
import InstructorDetail from "./InstructorDetail";
import { useAtom } from "jotai";
import { HardwareStatusAtom } from "@/context/atom";

interface ContainerProps {
  children: React.ReactNode;
  h?: number;
  w?: number;
}

const Container: React.FC<ContainerProps> = ({ children, h, w }) => {
  const { instructor } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [viewHardware, setviewHardware] = useState(false);

  const [hardwareStatus, setHardwareStatus] = useAtom(HardwareStatusAtom);

  return (
    <>
      <div
        className="bg-white rounded-xl shadow-lg relative m-16 "
        style={{
          height: h ? h : "auto",
          width: w ? w : "auto",
          borderColor: "#00a6fb",
          borderWidth: "1px",
          borderStyle: "solid",
        }}
      >
        <div>
          {instructor.name !== "" && (
            <Button
              className="absolute top-0 right-2 -translate-y-full flex "
              variant="text"
              startIcon={
                <Warning style={{ color: "red", fontSize: "1.75rem" }} />
              }
              type="button"
              onClick={() => setviewHardware(true)}
              style={{ color: "black" }}
            >
              Status Perangkat Keras
            </Button>
          )}
          {instructor.name !== "" && (
            <Button
              className="absolute top-0 right-100 -translate-y-full flex"
              variant="text"
              startIcon={<Person />}
              type="button"
              onClick={() => setIsOpen(true)}
            >
              {instructor.name}
            </Button>
          )}
        </div>
        <InstructorDetail
          isOpen={isOpen}
          handleClose={() => setIsOpen(false)}
        />
        {children}
      </div>
      <Dialog open={viewHardware} onClose={() => setviewHardware(false)}>
        <div className="flex flex-col justify-center items-center min-w-[260px]">
          <DialogContent className="font-bold text-xl">
            Status Perangkat Keras
          </DialogContent>
          <DialogContent className="flex mb-2 justify-between">
            Mode:{" "}
            {hardwareStatus.mode === 0
              ? "High Speed Train"
              : hardwareStatus.mode === 1
              ? "Light Rail Transit"
              : hardwareStatus.mode === 2
              ? "Transisi"
              : "Tidak ada data"}
            <br />
            <br />
            Bridge:{" "}
            {hardwareStatus.bridge === 0
              ? "Naik"
              : hardwareStatus.bridge === 1
              ? "Transisi"
              : hardwareStatus.bridge === 2
              ? "Turun"
              : "Tidak ada data"}
            <br />
            <br />
            3D Mouse:{" "}
            {hardwareStatus.mouse3d === 0
              ? "Aktif"
              : hardwareStatus.mouse3d === 1
              ? "Tidak Aktif"
              : "Tidak ada data"}
            <br />
            <br />
            Pintu:{" "}
            {hardwareStatus.pintu === 0
              ? "Terbuka"
              : hardwareStatus.pintu === 1
              ? "Tertutup"
              : "Tidak ada data"}
            <br />
            <br />
            Motion:{" "}
            {hardwareStatus.kondisiMotion === 0
              ? "Tidak Siap Pakai"
              : hardwareStatus.kondisiMotion === 1
              ? "Motion Tidak Aktif"
              : hardwareStatus.kondisiMotion === 2
              ? "Motion Aktif"
              : "Tidak ada data"}
          </DialogContent>
        </div>
      </Dialog>
    </>
  );
};

export default Container;
