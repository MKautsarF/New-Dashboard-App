import { useAuth } from "@/context/auth";
import {
  Person,
  Warning,
  Train,
  Mouse,
  SensorDoor,
  SettingsPower,
  CompareArrows,
} from "@mui/icons-material";
import { Button, Dialog, DialogContent } from "@mui/material";
import React, { useEffect, useState } from "react";
import InstructorDetail from "./InstructorDetail";
import { useAtom } from "jotai";
import { HardwareStatusAtom, safetyEnabledAtom } from "@/context/atom";
import { sendTextToClients, socketClients } from "@/socket";

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

  const [safetyEnabled, setSafetyEnabled] = useAtom(safetyEnabledAtom);

  useEffect(() => {
    const payloadSafety = {
      status: "EnableSafety",
      value: safetyEnabled,
    };

    // console.log(payload);
    // sendTextToClients(JSON.stringify(payloadSafety, null, 2));

    /** reading hardware data from UE */
    socketClients.forEach((socket) => {
      socket.on("data", (data) => {
        const stringData = data.toString();
        const payload = stringData.split("|").slice(-1)[0];
        const dataUE = JSON.parse(payload);

        if (dataUE.status === "safety") {
          console.log("received hardware data: ", dataUE);

          if (dataUE.receive) {
            setHardwareStatus({
              mode: dataUE.cabin,
              pintu: dataUE.doorLock,
              bridge: dataUE.bridge,
              mouse3d: dataUE.mouse3d,
              kondisiMotion: dataUE.KondisiMotion,
            });
          }
          if (!dataUE.receive) {
            setHardwareStatus({
              mode: 99,
              pintu: 99,
              bridge: 99,
              mouse3d: 99,
              kondisiMotion: 99,
            });
          }
        }

        if (dataUE.type === "Motion Test") {
          console.log("received motion test data: ", dataUE);

          // setMotionTestStatus(dataUE.status);
        }
      });
    });
  }, [
    safetyEnabled,
    viewHardware,
    // motionTestStatus,
  ]);

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
              style={{
                color: "black",
                textDecoration: "underline",
                textDecorationThickness: "2px",
                textDecorationColor: "red",
              }}
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
          <DialogContent className="font-bold text-xl flex flex-row">
            <Warning
              style={{
                color: "red",
                fontSize: "1.75rem",
                marginRight: "15px",
              }}
            />
            Status Perangkat Keras
          </DialogContent>
          <DialogContent className="flex flex-col mb-2 ">
            <div className="flex flex-row items-center">
              <Train style={{ color: "black", marginRight: "10px" }} />
              Mode:{" "}
              {hardwareStatus.mode === 0
                ? "High Speed Train"
                : hardwareStatus.mode === 1
                ? "Light Rail Transit"
                : hardwareStatus.mode === 2
                ? "Transisi"
                : "Tidak ada data"}
            </div>
            <br />
            <div className="flex flex-row items-center">
              <CompareArrows style={{ color: "black", marginRight: "10px" }} />
              Jembatan:{" "}
              {hardwareStatus.bridge === 0
                ? "Naik"
                : hardwareStatus.bridge === 1
                ? "Transisi"
                : hardwareStatus.bridge === 2
                ? "Turun"
                : "Tidak ada data"}
            </div>
            <br />
            <div className="flex flex-row items-center">
              <Mouse style={{ color: "black", marginRight: "10px" }} />
              3D Mouse:{" "}
              {hardwareStatus.mouse3d === 0
                ? "Aktif"
                : hardwareStatus.mouse3d === 1
                ? "Tidak Aktif"
                : "Tidak ada data"}
            </div>
            <br />
            <div className="flex flex-row items-center">
              <SensorDoor style={{ color: "black", marginRight: "10px" }} />
              Pintu:{" "}
              {hardwareStatus.pintu === 0
                ? "Terbuka"
                : hardwareStatus.pintu === 1
                ? "Tertutup"
                : "Tidak ada data"}
            </div>
            <br />
            <div className="flex flex-row items-center">
              <SettingsPower style={{ color: "black", marginRight: "10px" }} />
              Motion:{" "}
              {hardwareStatus.kondisiMotion === 0
                ? "Tidak Siap Pakai"
                : hardwareStatus.kondisiMotion === 1
                ? "Motion Tidak Aktif"
                : hardwareStatus.kondisiMotion === 2
                ? "Motion Aktif"
                : "Tidak ada data"}
            </div>
          </DialogContent>
        </div>
      </Dialog>
    </>
  );
};

export default Container;
