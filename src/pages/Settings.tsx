import { useState, useEffect, useMemo } from "react";
import { Location } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { TimePicker } from "@mui/x-date-pickers";
import Container from "@/components/Container";
import {
  Scale,
  PlaceOutlined,
  PlaceRounded,
  Visibility,
  AccessTime,
  NavigateNext,
  CloudOutlined,
  ZoomOutMap,
  NotificationsActive,
  EditNote,
  Route,
} from "@mui/icons-material";
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
import { useSettings } from "@/context/settings";
import { sendTextToClients } from "@/socket";
import FullPageLoading from "@/components/FullPageLoading";
import { useAuth } from "@/context/auth";
import fs from "fs";
import { getCourseByInstructor } from "@/services/course.services";
import { set } from "lodash";
import { useAtom } from "jotai";
import { HardwareStatusAtom } from "@/context/atom";

function useQuery() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}

interface CustomLocationState {
  from?: string;
}

interface CustomLocation extends Location {
  state: CustomLocationState;
}

function Settings() {
  const sourceSettingsPath = "src/config/settings_train.json";
  // const sourceSettingsPath = "C:/Train Simulator/Data/settings_train.json";
  const sourceSettingsRead = fs.readFileSync(sourceSettingsPath, "utf-8");
  const sourceSettings = JSON.parse(sourceSettingsRead);

  const navigate = useNavigate();
  const { settings, setSettings } = useSettings();
  const query = useQuery();
  const trainType = query.get("type") as "kcic" | "lrt";
  const trainSource = sourceSettings[trainType];
  const location = useLocation() as CustomLocation;
  const [courseId, setCourseId] = useState("");
  const [hardwareStatus, setHardwareStatus] = useAtom(HardwareStatusAtom);

  type StationMapping = {
    [key: string]: string;
  };

  const stationMapping: StationMapping = {
    Tegalluar: "Tegal Luar",
    "Joint Workshop Tegalluar": "Tegal Luar Depot",
    Karawang: "Karawang",
    Padalarang: "Padalarang",
    Halim: "Halim",
  };

  const getDisplayStationName = (station: any) =>
    stationMapping[station] || station;
  const getPayloadStationName = (displayName: any) =>
    Object.keys(stationMapping).find(
      (key) => stationMapping[key] === displayName
    ) || displayName;

  const handleSliderChange = (event: Event, newValue: number) => {
    const fogDistance =
      newValue >= 0.5 ? Math.round(Math.pow(newValue / 100, -0.914) * 50.6) : 0;
    setSettings({
      ...settings,
      fog: Math.round(newValue),
      jarakPandang: fogDistance,
    });
  };

  const canContinue =
    trainType === "kcic"
      ? settings.stasiunAsal &&
        settings.stasiunTujuan &&
        settings.line &&
        (!settings.useMotionBase || hardwareStatus.kondisiMotion === 2)
      : trainType === "lrt"
      ? settings.line &&
        settings.stasiunAsal &&
        settings.stasiunTujuan &&
        (!settings.useMotionBase || hardwareStatus.kondisiMotion === 2)
      : false;

  const handlePrev = () => {
    if (location.state?.from === "startClickKcic") {
      navigate(`/SecondPage`);
    } else if (location.state?.from === "startClickLrt") {
      navigate(`/SecondPage`);
    } else {
      navigate(`/Modul?type=${trainType}`);
    }
  };

  const [modul, setModul] = useState("Testing");
  const rangkaianKereta = "6 Rangkaian";
  const [isLoading, setIsLoading] = useState(false);

  const handleLanjut = () => {
    navigate(`/scoringStart?type=${trainType}&id=65`, {
      state: { fromEksplorasi: true },
    });
  };

  const handleMulai = async () => {
    let startStation = "";
    let finishStation = "";
    const selectedPesertaId = localStorage.getItem("selectedPesertaId");

    const payload = {
      id_user: selectedPesertaId,
      train_type: trainType.toUpperCase(),
      train: {
        weight: settings.berat.toString(),
        type: rangkaianKereta,
      },
      time: Number(settings.waktu.format("HH")),
      weather: [
        {
          value: settings.statusHujan,
          location: [0, 0],
          name: "rain",
        },
        {
          value: settings.fog,
          location: [0, 0],
          name: "fog",
        },
      ],
      route: {
        start: {
          name: getPayloadStationName(settings.stasiunAsal),
        },
        finish: {
          name: getPayloadStationName(settings.stasiunTujuan),
        },
      },
      motion_base: settings.useMotionBase,
      speed_buzzer: settings.useSpeedBuzzer,
      speed_limit: settings.speedLimit,
      status: "play",
      module: "Eksplorasi",
    };

    console.log("payload", payload);

    try {
      setIsLoading(true);
      sendTextToClients(JSON.stringify(payload, null, 2));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      navigate(`/FifthPage/${trainType}?type=${settings.score}`);
    }
  };

  useEffect(() => {
    setSettings(settings);
    const fetchDefaultID = async () => {
      try {
        const res = await getCourseByInstructor(1, 1, "", "Default");
        setCourseId(res.result[0].id);
      } catch (error) {
        console.error("Error fetching course list:", error);
      }
    };
    fetchDefaultID();
    // assign module
    if (trainType === "lrt") {
      localStorage.setItem("valueSettingsLRT", "Eksplorasi");
    } else if (trainType === "kcic") {
      localStorage.setItem("valueSettingsKCIC", "Eksplorasi");
    }
  }, [settings]);

  const [isHovered, setIsHovered] = useState(false);

  // scoring kcic:1 and lrt:2
  const [selectedValue, setSelectedValue] = useState("Default");
  const [selectedValue2, setSelectedValue2] = useState("Default");

  useEffect(() => {
    // Retrieve the last selected value from localStorage
    const storedValue = localStorage.getItem("selectedValue");
    if (storedValue) {
      setSelectedValue(storedValue);
    }
    // Retrieve the last selected value from localStorage
    const storedValue2 = localStorage.getItem("selectedValue2");
    if (storedValue2) {
      setSelectedValue2(storedValue2);
    }
  }, []);

  return (
    <>
      <Container w={1500}>
        <div className="p-6 flex flex-wrap">
          {/* Judul */}
          <h1
            className="w-full text-center my-4"
            style={{ fontSize: "1.75rem", fontWeight: "bold" }}
          >
            {/* Pengaturan Simulasi {trainType === "kcic" ? "Kereta Cepat" : trainType.toUpperCase()} */}
            Pengaturan Simulasi{" "}
            {trainType === "kcic"
              ? "High Speed Train"
              : trainType === "lrt"
              ? "Light Rail Transit"
              : trainType}
          </h1>

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
              helperText={settings.berat > 72 && "Maksimum berat adalah 72 ton"}
            />
            <p>ton</p>
            <div></div>
          </div>

          {/* Line Kereta */}
          <div className="w-1/2 my-2 flex items-center p-2">
            <Route className="my-[0.5px] mr-2 text-gray-600" />
            <FormControl fullWidth>
              <InputLabel id="line-label-id">Line Kereta</InputLabel>
              <Select
                labelId="line-label-id"
                label="Line Kereta"
                value={settings.line}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    line: e.target.value,
                    stasiunAsal: "",
                    stasiunTujuan: "",
                  })
                }
              >
                {trainSource &&
                  trainSource.rute &&
                  Object.keys(trainSource.rute).map((line, idx) => (
                    <MenuItem key={idx} value={line}>
                      {line}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </div>

          {/* Stasiun Asal */}
          <div className="w-1/2 my-2 flex items-center p-2">
            <PlaceOutlined className="my-[0.5px] mr-2 text-gray-600" />
            <FormControl
              fullWidth
              disabled={!settings.line || !trainSource.rute[settings.line]}
            >
              <InputLabel id="st-asal-label-id">Stasiun Asal</InputLabel>
              <Select
                labelId="st-asal-label-id"
                label="Stasiun Asal"
                value={settings.stasiunAsal}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    stasiunAsal: e.target.value,
                    stasiunTujuan: "",
                  })
                }
              >
                {settings.line &&
                  trainSource.rute[settings.line] &&
                  Object.keys(trainSource.rute[settings.line]).map(
                    (station, idx) => (
                      <MenuItem key={idx} value={station}>
                        {getDisplayStationName(station)}
                      </MenuItem>
                    )
                  )}
              </Select>
            </FormControl>
          </div>

          {/* Stasiun Tujuan */}
          <div className="w-1/2 my-2 flex items-center p-2">
            <PlaceRounded className="my-[0.5px] mr-2 text-gray-600" />
            <FormControl
              fullWidth
              disabled={
                !settings.stasiunAsal ||
                !trainSource.rute[settings.line]?.[settings.stasiunAsal]
              }
            >
              <InputLabel id="st-tujuan-label-id">Stasiun Tujuan</InputLabel>
              <Select
                labelId="st-tujuan-label-id"
                label="Stasiun Tujuan"
                value={settings.stasiunTujuan}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    stasiunTujuan: e.target.value,
                  })
                }
              >
                {settings.stasiunAsal &&
                  trainSource.rute[settings.line]?.[settings.stasiunAsal] &&
                  trainSource.rute[settings.line][settings.stasiunAsal].map(
                    (destination: any, idx: any) => (
                      <MenuItem key={idx} value={destination}>
                        {getDisplayStationName(destination)}
                      </MenuItem>
                    )
                  )}
              </Select>
            </FormControl>
          </div>

          {/* Rain Status */}
          <div className="w-1/2 mb-2 mt-4 flex items-center p-2">
            <CloudOutlined className="my-[0.5px] mr-2 text-gray-600" />
            <FormControl fullWidth>
              <InputLabel id="status-hujan-label-id">Status Hujan</InputLabel>
              <Select
                labelId="status-hujan-label-id"
                label="Status Hujan"
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
        {/* Back Button */}
        <div className="flex justify-between pl-6 pb-6 w-full">
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
          <div className="flex gap-4 pr-6">
            <Button
              variant="outlined"
              className="bottom-0 mt-4"
              endIcon={<NavigateNext />}
              onClick={handleLanjut}
              disabled={!canContinue} // Disable the button if canContinue is false
              sx={{
                color: canContinue ? "#f3f3f4" : "#a1a1a1", // Lighter color when disabled
                backgroundColor: canContinue ? "#00a6fb" : "#d3d3d3", // Grey background when disabled
                borderColor: canContinue ? "#f3f3f4" : "#a1a1a1", // Lighter border when disabled
                "&:hover": {
                  borderColor: canContinue ? "#4dc1fc" : "#a1a1a1",
                  color: canContinue ? "#f3f3f4" : "#a1a1a1",
                  backgroundColor: canContinue ? "#4dc1fc" : "#d3d3d3", // Disable hover effect if canContinue is false
                },
              }}
            >
              Lanjut
            </Button>
          </div>
        </div>
        <FullPageLoading loading={isLoading} />
      </Container>
    </>
  );
}

export default Settings;
