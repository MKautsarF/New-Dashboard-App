import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TimePicker } from "@mui/x-date-pickers";
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Input,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  TextField,
} from "@mui/material";
import {
  Scale,
  Train,
  PlaceOutlined,
  PlaceRounded,
  Visibility,
  AccessTime,
  NavigateBefore,
  NavigateNext,
  CloudOutlined,
  ZoomOutMap,
  NotificationsActive,
  EditNote,
  MenuBook,
  Route,
} from "@mui/icons-material";
import Container from "@/components/Container";
import { flushSync } from "react-dom";
import fs from "fs";
import { divide } from "lodash";
import { useSettings } from "@/context/settings";
import { default as sourceSettings } from "@/config/settings_train.json";

function EditSettingsLRT() {
  const navigate = useNavigate();
  const { settings, setSettings } = useSettings();

  const trainType = "lrt";
  const bottom = useRef(null);
  const [modul, setModul] = useState("Testing");
  const trainSource = sourceSettings[trainType];

  const handlePrev = () => {
    navigate("/FifthPage/edit/lrt");
  };

  const handleSliderChange = (event: Event, newValue: number) => {
    const fogDistance =
      newValue >= 0.5 ? Math.round(Math.pow(newValue / 100, -0.914) * 50.6) : 0;
    setSettings({
      ...settings,
      fog: Math.round(newValue),
      jarakPandang: fogDistance,
    });
  };

  return (
    <>
      <Container w={1000}>
        <div className="p-8">
          <div className="p-8 flex flex-wrap">
            {/* Judul */}
            <h1
              className="w-full text-center my-4"
              style={{ fontSize: "1.75rem", fontWeight: "bold" }}
            >
              Pengaturan Simulasi LRT
              {/* Setting Simulasi */}
            </h1>

            {/* Modul */}
            <div className="w-full my-2 flex items-center p-2">
              <MenuBook className="my-[0.5px] mr-2 text-gray-600" />
              <FormControl fullWidth>
                <InputLabel id="modul-label-id">Modul</InputLabel>
                <Select
                  labelId="modul-label-id"
                  label="Modul"
                  value={modul}
                  onChange={(e) => setModul(e.target.value)}
                  // style={{ backgroundColor: "#f3f3f4" }}
                >
                  <MenuItem value="Learning">Learning</MenuItem>
                  <MenuItem value="Testing">Testing</MenuItem>
                </Select>
              </FormControl>
            </div>

            {/* Berat */}
            <div className="w-1/2 my-2 flex items-end mb-6 p-2">
              <Scale className="my-[0.5px] mr-2 text-gray-600" />
              <TextField
                label="Berat"
                type="number"
                variant="standard"
                className="w-48 mr-2 ml-1"
                value={settings.berat}
                inputProps={{
                  min: 0,
                  max: 72,
                }}
                onFocus={(e) => e.target.select()}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    berat: Number(e.target.value),
                  })
                }
                error={settings.berat > 72}
                helperText={
                  settings.berat > 72 && "Maksimum berat adalah 72 ton"
                }
              />
              <p>ton</p>
              <div></div>
            </div>

            {/* Jenis Kereta */}
            <div className="w-1/2 my-2 flex items-center p-2">
              <Train className="my-[0.5px] mr-2 text-gray-600" />
              <FormControl fullWidth>
                <InputLabel id="kereta-label-id">Jenis Kereta</InputLabel>
                <Select
                  labelId="kereta-label-id"
                  label="Jenis Kereta"
                  // style={{ backgroundColor: "#f3f3f4" }}
                  value={settings.kereta}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      kereta: e.target.value,
                    })
                  }
                >
                  {trainSource.jenis.map((type, idx) => (
                    <MenuItem
                      key={idx}
                      value={type.split(" ").slice(0, 2).join(" ")}
                    >
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            {/* Line Kereta */}
            <div className="w-full my-2 flex items-center p-2">
              <Route className="my-[0.5px] mr-2 text-gray-600" />
              <FormControl fullWidth>
                <InputLabel id="line-label-id">Line Kereta</InputLabel>
                <Select
                  labelId="line-label-id"
                  label="Line Kereta"
                  // style={{ backgroundColor: "#f3f3f4" }}
                  value={settings.line}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      line: e.target.value,
                    })
                  }
                >
                  {trainSource.line.map((type, idx) => (
                    <MenuItem
                      key={idx}
                      value={type.split(" ").slice(0, 2).join(" ")}
                    >
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            {/* Rute */}
            {/* {trainType !== "lrt" && ( */}
            <>
              <div className="w-1/2 my-2 flex items-center p-2">
                <PlaceOutlined className="my-[0.5px] mr-2 text-gray-600" />
                <FormControl fullWidth>
                  <InputLabel id="st-asal-label-id">Stasiun Asal</InputLabel>
                  <Select
                    labelId="st-asal-label-id"
                    label="Stasiun Asal"
                    // style={{ backgroundColor: "#f3f3f4" }}
                    value={settings.stasiunAsal}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        stasiunAsal: e.target.value,
                        stasiunTujuan: "",
                      })
                    }
                  >
                    {Object.entries(trainSource.rute).map((routePair, idx) => (
                      <MenuItem key={idx} value={routePair[0]}>
                        {routePair[0]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              <div className="w-1/2 my-2 flex items-center p-2">
                <PlaceRounded className="my-[0.5px] mr-2 text-gray-600" />
                <FormControl fullWidth disabled={settings.stasiunAsal === ""}>
                  <InputLabel id="st-tujuan-label-id">
                    Stasiun Tujuan
                  </InputLabel>
                  <Select
                    labelId="st-tujuan-label-id"
                    label="Stasiun Tujuan"
                    // style={{ backgroundColor: "#f3f3f4" }}
                    value={settings.stasiunTujuan}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        stasiunTujuan: e.target.value,
                      })
                    }
                  >
                    {(trainSource.rute as any)[settings.stasiunAsal]?.map(
                      (destination: string, idx: number) => (
                        <MenuItem key={idx} value={destination}>
                          {destination}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </div>
            </>
            {/* )} */}

            {/* Rain Status */}
            <div className="w-1/2 mb-2 mt-4 flex items-center p-2">
              <CloudOutlined className="my-[0.5px] mr-2 text-gray-600" />
              <FormControl fullWidth>
                <InputLabel id="status-hujan-label-id">Status Hujan</InputLabel>
                <Select
                  labelId="status-hujan-label-id"
                  label="Status Hujan"
                  // style={{ backgroundColor: "#f3f3f4" }}
                  value={settings.statusHujan}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      statusHujan: e.target.value,
                    })
                  }
                >
                  <MenuItem value="Cerah">Cerah</MenuItem>
                  <MenuItem value="Ringan">Ringan</MenuItem>
                  <MenuItem value="Sedang">Sedang</MenuItem>
                  <MenuItem value="Deras">Deras</MenuItem>
                </Select>
              </FormControl>
            </div>

            {/* Time Picker */}
            <div className="my-2 flex items-center p-2 w-1/2">
              <AccessTime className="my-[0.5px] mr-2 text-gray-600" />
              <TimePicker
                label="Waktu"
                ampm={false}
                value={settings.waktu}
                onChange={(newWaktu) =>
                  setSettings({
                    ...settings,
                    waktu: newWaktu,
                  })
                }
                className="flex-grow"
                timeSteps={{ minutes: 60 }}
              />
              {/* <div className="custom-time-picker-wrapper ">
            </div> */}
            </div>

            {/* Fog Slider */}
            <div className="w-full p-2">
              <p className="text-[#00000099] text-xs">Jarak Pandang (Kabut)</p>
              <div className="flex items-center mt-2 gap-4">
                <Visibility className="my-[0.5px] mr-2 text-gray-600" />
                <div className="flex-grow">
                  <Slider
                    className="flex-grow"
                    min={0}
                    max={100}
                    step={0.25}
                    value={settings.fog}
                    onChange={handleSliderChange}
                  />
                </div>

                <Input
                  value={settings.jarakPandang}
                  readOnly
                  className="w-28"
                  size="small"
                  onFocus={(e) => e.target.select()}
                  endAdornment={
                    <InputAdornment
                      position="start"
                      className={`${
                        settings.jarakPandang !== 0 ? "text-base" : "text-xs"
                      }`}
                    >
                      {settings.jarakPandang !== 0 ? "meter" : "Tidak berkabut"}
                    </InputAdornment>
                  }
                />
              </div>
            </div>

            {/* Motion */}
            <div className="flex items-center p-2">
              <ZoomOutMap className="my-[0.5px] mr-2 text-gray-600" />
              <FormControlLabel
                className="text-[#00000099]"
                control={
                  <Checkbox
                    checked={settings.useMotionBase}
                    onChange={() =>
                      setSettings({
                        ...settings,
                        useMotionBase: !settings.useMotionBase,
                      })
                    }
                  />
                }
                label="Motion Base"
              />
            </div>

            {/* buzzer speed */}
            <div className="flex items-center p-2">
              <NotificationsActive className="my-[0.5px] mr-2 text-gray-600" />
              <FormControlLabel
                className="text-[#00000099] min-w-[180px]"
                control={
                  <Checkbox
                    defaultChecked
                    checked={settings.useSpeedBuzzer}
                    onChange={() =>
                      setSettings({
                        ...settings,
                        useSpeedBuzzer: !settings.useSpeedBuzzer,
                      })
                    }
                  />
                }
                label="Buzzer Kecepatan"
              />
              <Input
                className="max-w-[50px]"
                value={settings.speedLimit}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  let limit = Number(e.target.value);
                  if (limit > 100) limit = 100;
                  if (limit < 0) limit = 0;

                  setSettings({
                    ...settings,
                    speedLimit: limit,
                  });
                }}
                inputProps={{
                  step: 5,
                  min: 0,
                  max: 100,
                  type: "number",
                }}
                disabled={!settings.useSpeedBuzzer}
              />
              <span className="text-[#00000099]">km/jam</span>
            </div>
          </div>

          <div className="flex w-full justify-center items-center fixed bottom-0 left-0 shadow-lg">
            <div className="w-[600px] rounded-full flex px-4 py-3 mb-4 border-2 border-solid border-blue-400 bg-slate-50">
              {/* nav */}
              <div className="flex gap-4 justify-between w-full">
                <Button
                  type="button"
                  color="error"
                  variant="text"
                  // className="bottom-0 mt-4"
                  sx={{
                    color: "#df2935",
                    "&:hover": {
                      // backgroundColor: "rgba(223, 41, 53, 0.4)", // Lower opacity red color
                      color: "#ec625e",
                    },
                  }}
                  onClick={() => {
                    handlePrev();
                  }}
                >
                  Batal
                </Button>
                <Button
                  variant="text"
                  type="submit"
                  form="penilaian-form"
                  onClick={() => {
                    // handleSubmit;
                  }}
                  sx={{
                    color: "#00a6fb",
                    "&:hover": {
                      color: "#00a6fb",
                    },
                  }}
                >
                  Simpan
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* <footer ref={bottom}></footer> */}
      </Container>
    </>
  );
}

export default EditSettingsLRT;
