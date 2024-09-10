import {
  Delete,
  Info,
  BookmarkAdd,
} from "@mui/icons-material";
import "pickerjs/dist/picker.css";
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "@/components/Container";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import {currentInstructor } from "@/context/auth";
import {
  getCourseListbyAdmin,
  getCourseDetail
} from "@/services/course.services";
import FullPageLoading from "@/components/FullPageLoading";
import { createCourseAsAdmin, publishCourseAsAdmin, deleteCourseAsAdmin, createCourseAsInstructor } from "@/services/course.services";
import { getCourseByInstructor } from "@/services/course.services";
import fs from "fs";
import { toast } from 'react-toastify';
import { useLocation } from "react-router-dom";
import { useMemo } from "react";
import ModulDialog  from "@/components/ModulDialog";
import dayjs from 'dayjs';

interface RowData {
  id: string;
  title: string;
  description: string;
  filename: string;
  published: boolean;
}

function useQuery() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}
const CourseList = () => {
  const navigate = useNavigate();

  // const sourceSettingsPath = "src/config/settings_train.json";
	const sourceSettingsPath = "C:/Train Simulator/Data/settings_train.json";
  const sourceSettingsRead = fs.readFileSync(sourceSettingsPath, "utf-8");
  const sourceSettings = JSON.parse(sourceSettingsRead);

  const query = useQuery();
  const trainType = query.get("type") as "kcic" | "lrt";

  type StationMapping = {
    [key: string]: string;
  };
  
  const stationMapping: StationMapping = {
    "Tegalluar": "Tegal Luar",
    "Joint Workshop Tegalluar": "Tegal Luar Depot",
    "Karawang": "Karawang",
    "Padalarang": "Padalarang",
    "Halim": "Halim",
  };

  const getDisplayStationName = (station: any) => stationMapping[station] || station;
  const getPayloadStationName = (displayName: any) => Object.keys(stationMapping).find(key => stationMapping[key] === displayName) || displayName;

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'add' | 'edit'>('add');

  const handleClose = () => {
    setOpen(false);
  };

  const [isLoading, setIsLoading] = useState(false);
  const [selectedModul, setSelectedModul] = useState<{ id: string | null; title: string | null }>({
    id: null,
    title: null,
  });

  // Full page loading
  const [pageLoading, setPageLoading] = useState(false);

  const [rows, setRows] = useState<RowData[]>([]);
  const [totalData, setTotalData] = useState(0);
  const [page, setPage] = useState(1);
  const [payload, setPayload] = useState<any>({});
  
  const [moduleName, setModuleName] = useState("");
  const [train, setTrain] = useState("");
  const [trainLine, setTrainLine] = useState("");
  const [trainLines, setTrainLines] = useState([]);
  const [trainWeight, setTrainWeight] = useState("");
  // const [trainType, setTrainType] = useState("");
  const [time, setTime] = useState<dayjs.Dayjs | null>(null);
  const [startStation, setStartStation] = useState("");
  const [finishStation, setFinishStation] = useState("");
  const [startStations, setStartStations] = useState([]);
  const [finishStations, setFinishStations] = useState([]);
  const [rainStatus, setRainStatus] = useState("");
  const [fog, setFog] = useState(0);
  const [jarakPandang, setJarakPandang] = useState(0);
  const [motionBase, setMotionBase] = useState(false);
  const [speedBuzzer, setSpeedBuzzer] = useState(false);
  const [speedLimit, setSpeedLimit] = useState("");
  const [error, setError] = useState('');
  const [isAddButtonEnabled, setIsAddButtonEnabled] = useState(false);

  const resetForm = () => {
    setModuleName('');
    setTrain('');
    setTrainWeight('');
    setTrainLine('');
    setStartStation('');
    setFinishStation('');
    setRainStatus('');
    setTime(null);
    setMotionBase(false);
    setSpeedBuzzer(false);
    setSpeedLimit('');
    setFog(0);
  };

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      const fogDistance =
        newValue >= 0.5 ? Math.round(Math.pow(newValue / 100, -0.914) * 50.6) : 0;
      setFog(Math.round(newValue));
      setJarakPandang(fogDistance);
    }
  };
  

  const validateForm = () => {
    if (!moduleName || !train || !trainWeight || !trainLine || !startStation || !finishStation || !rainStatus || !time || (speedBuzzer && !speedLimit)) {
      setIsAddButtonEnabled(false);
    } else {
      setIsAddButtonEnabled(true);
    }
  };

  useEffect(() => {
    validateForm();
  }, [moduleName, train, trainWeight, trainLine, startStation, finishStation, rainStatus, time, speedLimit, speedBuzzer]);

  const handleMotionBaseChange = (event: any) => {
    setMotionBase(event.target.checked);
    validateForm();
  };

  const handleSpeedBuzzerChange = (event: any) => {
    setSpeedBuzzer(event.target.checked);
    setSpeedLimit(''); // Reset speedLimit when speedBuzzer changes
    validateForm();
  };

  const handleSpeedLimitChange = (event: any) => {
    setSpeedLimit(event.target.value);
    // Validate speed limit if speed buzzer is checked
    if (speedBuzzer && event.target.value.trim() === '') {
      setError('Speed limit perlu diisi ketika speed buzzer terceklis');
    } else {
      setError('');
    }
  };

  const handleWeightChange = (event: any) => {
		setTrainWeight(event.target.value);
	};

  useEffect(() => {
    if (!speedBuzzer) {
      // Hapus pesan error jika speedBuzzer tidak diceklis
      setError('');
    }
  }, [speedBuzzer]);


  const [deletePrompt, setDeletePrompt] = useState(false);
  const [configPrompt, setConfigPrompt] = useState(false);
  const [passwordPrompt, setPasswordPrompt] = useState(false);
  const [reload, setReload] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [editPrompt, setEditPrompt] = useState(false);


  const toggleEdit = () => {
    setOpen(!open)
  }
  
  const formatTimeToHour = (time: dayjs.Dayjs | null) => {
    if (time && typeof time.format === 'function') {
      return time.format('HH'); // Extract the hour in 'HH' format
    }
    return ''; // Return an empty string or a default value if time is null
  };

  const collectDataAndPrepareFormData = async () => {
    // Determine the description
    const description = train.toUpperCase();
  
    // Prepare the data object
    const data = {
      module_name: moduleName,
      train_type: train,
      train: {
        weight: trainWeight,
        type: "6 Rangkaian"
      },
      time: formatTimeToHour(time),
      weather: [
        {
          value: rainStatus,
          location: [0, 0],
          name: "rain"
        },
        {
          value: fog,
          location: [0, 0],
          name: "fog"
        }
      ],
      train_line: trainLine,
      route: {
        start: {
          name: getPayloadStationName(startStation)
        },
        finish: {
          name: getPayloadStationName(finishStation)
        }
      },
      motion_base: motionBase,
      speed_buzzer: speedBuzzer,
      speed_limit: speedLimit,
      status: "play"
    };
  
    // Prepare the form data
    const formData = new FormData();
    formData.append('file', new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), 'data.json');
    formData.append('title', moduleName);
    formData.append('description', description);
  
    return formData;
  };  


  const handleDaftar = () => {
    setMode('add');
    setOpen(true);
  };

  const handleKembali = () => {
    if (currentInstructor.isAdmin) navigate("/admin");
    else
      navigate("/SecondPage");
    };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage + 1);
  };  
  
  const handleRegister = async () => {
    try {
      const formData = await collectDataAndPrepareFormData();
      
      let response;
      if (currentInstructor.isAdmin) {
        const response = await createCourseAsAdmin(formData);
      } else {
        const response = await createCourseAsInstructor(formData);
      }
      console.log("Upload successful", response);
      handleClose();
      resetForm();
      setReload(!reload);
    } catch (error) {
      console.error("Upload failed", error);
    }
  };
  const [pageExclusions, setPageExclusions] = useState<{ [page: number]: Set<number> }>({0: new Set()});

  useEffect(() => {
    async function getRows(page: number) {
      try {
        setIsLoading(true);
        let res = {
          results: [] as any,
          total: 0,
        };
        
        if (currentInstructor.isAdmin) {
          const response = await getCourseListbyAdmin(page, 5, '', '', pageExclusions);
          res.results = response.results;
          res.total = response.total;
          setPageExclusions(response.pageExclusion);
        } else {
          console.log("trainType", trainType)
          const response = await getCourseByInstructor(page, 5, '', trainType);
          res.results = response.results;
          res.total = response.total;
        }
        console.log("API Response:", res);
        const resRows: RowData[] = res.results.map((entry: any) => ({
          id: entry.id,
          title: entry.title,
          description: entry.description,
          published: entry.published,
        }));
        setRows(resRows);
        setTotalData(res.total);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    console.log("now", currentInstructor)
    getRows(page);
  }, [page, reload, trainType]);
  

  useEffect(() => {
    const fetchPayload = async () => {
      if (selectedModul.id) {
        try {
          const payloadData = await getCourseDetail(selectedModul.id);
          setPayload(payloadData);
        } catch (error) {
          console.error("Failed to fetch payload data:", error);
        }
      }
    };

    fetchPayload();
  }, [selectedModul]);

  useEffect(() => {
    console.log("Payload updated:", payload);
  }, [payload]);

  const handlePublish = async (id: string) => {
    try {
      await publishCourseAsAdmin(id);
      setReload(!reload);
    } catch (error) {
      console.error("Failed to publish the course:", error);
    }
  };


  const handleDelete = async (id: string) => {
    try {
      await deleteCourseAsAdmin(id);
      setReload(!reload);
    } catch (error) {
      console.error("Failed to publish the course:", error);
      toast.error("Gagal menghapus modul karena modul ini memiliki modul penilaian", { position: 'top-center' });
    }
  };

  const handleSearch = async (e: any) => {
    e.preventDefault();
    const query = e.target.query.value;
    try {
      setIsLoading(true);
      let res = {
        results: [] as any,
        total: 0,
      };
      setPageExclusions({0: new Set()});
      
      if (currentInstructor.isAdmin) {
        const response = await getCourseListbyAdmin(1, 5, query, '', pageExclusions);
        res.results = response.results;
        res.total = response.total;
        setPageExclusions(response.pageExclusion);
      } else {
        const response = await getCourseByInstructor(1, 5, query, trainType);
        res.results = response.results;
        res.total = response.total;
      }
      console.log("API Response:", res);
      const resRows: RowData[] = res.results.map((entry: any) => ({
        id: entry.id,
        title: entry.title,
        description: entry.description,
        published: entry.published,
      }));
      setRows(resRows);
      setTotalData(res.total);
    } catch (error) {
      console.error("Failed to search course:", error);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    if (mode === 'edit' && payload) {
      setModuleName(payload.module_name || '');
      
      // Set train-related states
      setTrain(payload.train_type || '');
      setTrainWeight(payload.train?.weight || '');
      setTrainLine(payload.train_line || '');
      
      // Set start and finish stations based on the rute structure
      setStartStation(payload.route?.start?.name || '');
      setFinishStation(payload.route?.finish?.name || '');
      
      // Other settings
      setRainStatus(payload.weather?.find((item: { name: string, value: string | number }) => item.name === 'rain')?.value || '');
      setFog(payload.weather?.find((item: { name: string, value: string | number }) => item.name === 'fog')?.value || 0);
      
      setTime(payload.time || null);
      setMotionBase(payload.motion_base || false);
      setSpeedBuzzer(payload.speed_buzzer || false);
      setSpeedLimit(payload.speed_limit || '');
      setJarakPandang(payload.jarak_pandang || 0);
    } else {
      // Reset fields for adding new module
      setModuleName('');
      setTrain('');
      setTrainWeight('');
      setTrainLine('');
      setStartStation('');
      setFinishStation('');
      setRainStatus('');
      setFog(0);
      setTime(null);
      setMotionBase(false);
      setSpeedBuzzer(false);
      setSpeedLimit('');
      setJarakPandang(0);
    }
  }, [mode, payload]);

  useEffect(() => {
    if (train) {
      setTrainLines(Object.keys(sourceSettings[train]?.rute || {}));
    } else {
      setTrainLines([]);
    }
  }, [train]);
  
  useEffect(() => {
    if (train && trainLine) {
      setStartStations(Object.keys(sourceSettings[train]?.rute[trainLine] || {}));
    } else {
      setStartStations([]);
    }
  }, [train, trainLine]);
  
  useEffect(() => {
    if (train && trainLine && startStation) {
      setFinishStations(sourceSettings[train]?.rute[trainLine]?.[startStation] || []);
    } else {
      setFinishStations([]);
    }
  }, [train, trainLine, startStation]);

  return (
    <Container w={1000} h={700}>
      <div className="flex flex-col p-6 h-full gap-4">
        {/* Search bar */}
        <Box component="form" onSubmit={handleSearch} className="flex gap-4 w-full ">
          {currentInstructor.isAdmin && ( <Button
            type="button"
            variant="contained"
            onClick={handleDaftar}
            startIcon={<BookmarkAdd className="text-2xl" />}
            sx={{
              color: "#ffffff",
              backgroundColor: "#00a6fb",
              borderColor: "#00a6fb",
              "&:hover": {
                borderColor: "#1aaffb",
                color: "#ffffff",
                backgroundColor: "#1aaffb",
              },
            }}
          >
            Tambah Baru
          </Button> )}
          <TextField
            id="input-with-icon-textfield"
            fullWidth
            name="query"
            placeholder="Cari berdasarkan judul modul"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              sx: {
                backgroundColor: "#ffffff", // Change background color to #ffffff
              },
            }}
          />
          <Button
            type="submit"
            variant="outlined"
            className="w-20 "
            sx={{
              color: "#00a6fb",
              backgroundColor: "#ffffff",
              borderColor: "#00a6fb",
              "&:hover": {
                borderColor: "#00a6fb",
                color: "#ffffff",
                backgroundColor: "#00a6fb",
              },
            }}
          >
            Cari
          </Button>
        </Box>

        {/* tabel preview */}
        <TableContainer className="mt-5" component={Paper}>
          <Table stickyHeader aria-label="Tabel Peserta">
            <colgroup>
              <col width="40%" />
              <col width="20%" />
              <col width="20%" />
              <col width="20%" />
            </colgroup>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", fontSize: "17px" }}>
                  Judul Modul Pembelajaran
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", fontSize: "17px" }}>
                  Tipe Kereta
                </TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            {isLoading ? (
              <div className="absolute w-full top-1/3 left-0 flex justify-center">
                <CircularProgress />
              </div>
            ) : rows.length > 0 ? (
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                    }}
                  >
                    <TableCell>{row.title}</TableCell>
                    <TableCell>
                      {row.description === "KCIC" ? "Kereta Cepat" : row.description}
                    </TableCell>
                    <TableCell>
                      {!row.published && (
                        <Button
                          variant="contained"
                          className="w-28"
                          onClick={() => handlePublish(row.id)}
                          sx={{
                            color: "#ffffff",
                            backgroundColor: "#00a6fb",
                            borderColor: "#00a6fb",
                            "&:hover": {
                              borderColor: "#1aaffb",
                              color: "#ffffff",
                              backgroundColor: "#1aaffb",
                            },
                          }}
                        >
                          Publish
                        </Button>
                      )}
                      {row.published && (
                        <Button
                          variant="contained"
                          disabled
                          className="w-28"
                        >
                          Published
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-4 justify-end">
                        <Tooltip title="Konfigurasi Modul Pembelajaran" placement="top">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedModul({
                                id: row.id,
                                title: row.title,
                              });
                              // setConfigPrompt(true);
                              
                              navigate(`/scoringlist/coursedetail?id=${row.id}&type=${trainType}`);
                            }}
                          >
                            <Info />
                          </IconButton>
                        </Tooltip>
                        {currentInstructor.isAdmin && (
                          <Tooltip title="Hapus Modul Pembelajaran" placement="top">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedModul({
                                  id: row.id,
                                  title: row.title,
                                });
                                setDeletePrompt(true);
                              }}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            ) : (
              <p className="absolute w-full top-1/3 left-0 flex justify-center">
                Data modul pembelajaran tidak ditemukan
              </p>
            )}
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalData}
          rowsPerPage={5}
          page={page - 1}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5]}
          className="overflow-hidden mt-auto"
        />

        {/* Navigation */}
        <div className="flex gap-4">
          <Button
            type="button"
            color="error"
            variant="outlined"
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
            onClick={() => handleKembali()}
          >
            Kembali
          </Button>
        </div>
      </div>

      {/* pop up registrasi dan edit */}
      <ModulDialog
        open={open}
        setOpen={toggleEdit}
        mode="add"
        moduleName={moduleName}
        setModuleName={setModuleName}
        train={train}
        setTrain={setTrain}
        trainWeight={trainWeight}
        setTrainWeight={setTrainWeight}
        trainLine={trainLine}
        setTrainLine={setTrainLine}
        startStation={startStation}
        setStartStation={setStartStation}
        finishStation={finishStation}
        setFinishStation={setFinishStation}
        rainStatus={rainStatus}
        setRainStatus={setRainStatus}
        time={time}
        setTime={setTime}
        motionBase={motionBase}
        handleMotionBaseChange={handleMotionBaseChange}
        speedBuzzer={speedBuzzer}
        handleSpeedBuzzerChange={handleSpeedBuzzerChange}
        fog={fog}
        handleSliderChange={handleSliderChange}
        jarakPandang={jarakPandang}
        speedLimit={speedLimit}
        setSpeedLimit={setSpeedLimit}
        error={error}
        handleSpeedLimitChange={handleSpeedLimitChange}
        handletWeightChange={handleWeightChange}
        handleRegister={handleRegister}
        isAddButtonEnabled={isAddButtonEnabled}
        sourceSettings={sourceSettings}
        trainLines={trainLines}
        startStations={startStations}
        finishStations={finishStations}
        getDisplayStationName={getDisplayStationName}
        getPayloadStationName={getPayloadStationName}
      />

      {/* Delete Modul prompt */}
      <Dialog open={deletePrompt} onClose={() => setDeletePrompt(false)}>
        <DialogContent className="min-w-[260px]">
          Hapus Modul: <b>{selectedModul.title}</b>?
        </DialogContent>
        <DialogActions className="flex mb-2 justify-between">
          <Button
            className="mx-2"
            onClick={() => setDeletePrompt(false)}
            
          >
            Batal
          </Button>
          <Button
            className="mx-2"
            onClick={async () => {
              if (selectedModul.id) {
                await handleDelete(selectedModul.id);
              }
              setDeletePrompt(false);
            }}
            color="error"
            variant="contained"
          >
            Hapus
          </Button>
        </DialogActions>
      </Dialog>


      <FullPageLoading loading={pageLoading} />
    </Container>
  );
};

export default CourseList;
