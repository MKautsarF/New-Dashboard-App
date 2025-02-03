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
import {
  Button,
  Dialog,
  DialogContent,
  FormControl,
  MenuItem,
  Select,
  CircularProgress,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import InstructorDetail from "./InstructorDetail";
import { useAtom } from "jotai";
import { HardwareStatusAtom, safetyEnabledAtom } from "@/context/atom";
import { getCourseData } from "@/services/course.services";
import { useLocation } from "react-router-dom";
import { getHardwareStatus, getHardwareStatusByHighestId } from "@/services/hardware.services";

import * as fs from "fs";

interface ContainerProps {
  children: React.ReactNode;
  h?: number;
  w?: number;
  motion?: number;
  handleMotionChange?: any;
}

const Container: React.FC<ContainerProps> = ({
  children,
  h,
  w,
  motion,
  handleMotionChange,
}) => {
  const { instructor } = useAuth();
  // const { motion, setMotion } = useMotion();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [viewHardware, setviewHardware] = useState(false);

  // const [hardwareStatus2, setHardwareStatus2] = useAtom(HardwareStatusAtom);
  const [hardwareStatus, setHardwareStatus] = useState<HardwareStatus>();
  const [isLoading, setIsLoading] = useState(false);

  const [safetyEnabled, setSafetyEnabled] = useAtom(safetyEnabledAtom);

  const [json, setJson] = useState<any>();
  

  interface HardwareStatus {
    mode: number;
    pintu: number;
    bridge: number;
    mouse3d: number;
    kondisiMotion: number;
  }
  //   const [value, setValue] = useState(0);

  //   const fetchValue = async () => {
  //     try {
  //         const response = await fetch('http://localhost:8003/Bridge');
  //         const data = await response.json();
  //         setValue(data.value);
  //     } catch (error) {
  //         console.error('Error fetching value:', error);
  //     }
  // };

  // useEffect(() => {
  //   async function getData() {
  //     try {
  //       setIsLoading(true);

  //       const res = await getCourseData();
  //       console.log("Course DATAAAAAA", res);

  //       // Mencari id terbesar
  //       const maxId = res.reduce((max: any, item: any) => {
  //         return item.id > max ? item.id : max;
  //       }, 0);
  //       console.log("ID Terbesar:", maxId);

  //       // Mengekstrak filename
  //       const filenames = res.map((item: any) => item.filename);
  //       console.log("Filenames:", filenames);
  //     } catch (e) {
  //       console.error(e);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   }

  //   getData();
  // }, []);

  useEffect(() => {
    async function getData() {
      try {
        setIsLoading(true);

        const fileList = await getHardwareStatus();

        if (fileList.length === 0) {
          console.log("Tidak ada data hardware.");
          return;
        }

        const highestIdItem = fileList.reduce((prev: any, current: any) => 
          prev.id > current.id ? prev : current
        );

        const highestFileName = highestIdItem.filename;
        console.log(`Menggunakan file dengan ID tertinggi: ${highestIdItem.id}, filename: ${highestFileName}`);

        const jsonData = await getHardwareStatusByHighestId(highestFileName);
        setJson(jsonData);

        setHardwareStatus({
          mode: jsonData.mode,
          pintu: jsonData.pintu,
          bridge: jsonData.bridge,
          mouse3d: jsonData.mouse3d,
          kondisiMotion: jsonData.kondisiMotion,
        });
        
        console.log("hardware: ", json);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }

    getData();
  }, [viewHardware]);

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
          {/* <FormControl
            sx={{
              "& .MuiInputBase-root": {
                fontSize: "1.4rem",
              },
              "& .MuiFormLabel-root": {
                fontSize: "1.4rem",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
            }}
            className="absolute top-2 right-64 -translate-y-full flex flex-row items-center"
          >
            {(location.pathname === "/FifthPage" ||
              location.pathname === "/Modul/learning" ||
              location.pathname === "/scoringStart" ||
              location.pathname === "/FifthPage/review") && (
              <>
                <p className="text-lg font-semibold text-black">Motion : </p>
                <Select
                  value={hardwareStatus.kondisiMotion}
                  defaultValue={hardwareStatus.kondisiMotion}
                  className="font-normal text-lg"
                  onChange={(e) => handleMotionChange(e.target.value)}
                >
                  <MenuItem value={2}>2</MenuItem>
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={0}>0</MenuItem>
                </Select>
              </>
            )}
          </FormControl> */}
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
          <DialogContent className="font-bold text-xl flex ">
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
            {isLoading ? (
              <div>
                <CircularProgress />
              </div>
            ) : (
              <>
                <div className="flex flex-row items-center">
                  <Train style={{ color: "black", marginRight: "10px" }} />
                  Mode:{" "}
                  {hardwareStatus?.mode === 0
                    ? "High Speed Train"
                    : hardwareStatus?.mode === 1
                    ? "Light Rapid Transit"
                    : hardwareStatus?.mode === 2
                    ? "Transisi"
                    : "Tidak ada data"}
                </div>
                <br />
                <div className="flex flex-row items-center">
                  <CompareArrows
                    style={{ color: "black", marginRight: "10px" }}
                  />
                  Jembatan:{" "}
                  {hardwareStatus?.bridge === 0
                    ? "Naik"
                    : hardwareStatus?.bridge === 1
                    ? "Transisi"
                    : hardwareStatus?.bridge === 2
                    ? "Turun"
                    : "Tidak ada data"}
                </div>
                <br />
                <div className="flex flex-row items-center">
                  <Mouse style={{ color: "black", marginRight: "10px" }} />
                  3D Mouse:{" "}
                  {hardwareStatus?.mouse3d === 0
                    ? "Aktif"
                    : hardwareStatus?.mouse3d === 1
                    ? "Tidak Aktif"
                    : "Tidak ada data"}
                </div>
                <br />
                <div className="flex flex-row items-center">
                  <SensorDoor style={{ color: "black", marginRight: "10px" }} />
                  Pintu:{" "}
                  {hardwareStatus?.pintu === 0
                    ? "Terbuka"
                    : hardwareStatus?.pintu === 1
                    ? "Tertutup"
                    : "Tidak ada data"}
                </div>
                <br />
                <div className="flex flex-row items-center">
                  <SettingsPower
                    style={{ color: "black", marginRight: "10px" }}
                  />
                  Motion:{" "}
                  {hardwareStatus?.kondisiMotion === 0
                    ? "Tidak Siap Pakai"
                    : hardwareStatus?.kondisiMotion === 1
                    ? "Motion Tidak Aktif"
                    : hardwareStatus?.kondisiMotion === 2
                    ? "Motion Aktif"
                    : "Tidak ada data"}
                </div>
              </>
            )}
          </DialogContent>
        </div>
      </Dialog>
    </>
  );
};

export default Container;
