import {
    Add,
    Delete,
    EditNote,
    Info,
    BookmarkAdd,
    Visibility,
  } from "@mui/icons-material";
  import PublishIcon from '@mui/icons-material/Publish';
  import { TimePicker } from "@mui/x-date-pickers";
  import {
    Box,
    Button,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
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
    Select, 
    MenuItem, 
    FormControl, 
    FormHelperText,
    InputLabel,
    Slider,
    Input
  } from "@mui/material";
  import React, { useEffect, useState } from "react";
  import Logo from "@/components/Logo";
  import { useNavigate } from "react-router-dom";
  import Container from "@/components/Container";
  import SearchIcon from "@mui/icons-material/Search";
  import InputAdornment from "@mui/material/InputAdornment";
  import { useAuth, currentPeserta, currentInstructor } from "@/context/auth";
  import {
    getScoringListbyAdmin,
    deleteScoringAsAdmin,
  } from "@/services/scoring.services";
  import { getCourseListbyAdmin, createCourseAsAdmin } from "@/services/course.services";
  import { useSettings } from "@/context/settings";
  import FullPageLoading from "@/components/FullPageLoading";
  import Checkbox from '@mui/material/Checkbox';
  import FormControlLabel from '@mui/material/FormControlLabel';
  import fs from "fs";
  
  interface RowData {
    id: string;
    title: string;
    description: string;
    filename: string;
    published: boolean;
    courseTitle: string;
  }
  
  const ScoringList = () => {
    const navigate = useNavigate();
  
    const sourceSettingsPath =
      "C:/Train Simulator/Data/settings_train - Copy.json";
    const sourceSettingsRead = fs.readFileSync(sourceSettingsPath, "utf-8");
    const sourceSettings = JSON.parse(sourceSettingsRead);
  
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
    const [trainType, setTrainType] = useState("");
    const [time, setTime] = useState(null);
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
  
    useEffect(() => {
      // Update the train lines based on the selected train type
      if (train) {
        setTrainLines(Object.keys(sourceSettings[train].rute));
      } else {
        setTrainLines([]);
      }
    }, [train]);
  
    useEffect(() => {
      if (train && trainLine) {
        setStartStations(Object.keys(sourceSettings[train].rute[trainLine]));
      } else {
        setStartStations([]);
      }
    }, [train, trainLine]);
  
    useEffect(() => {
      if (train && trainLine && startStation) {
        setFinishStations(sourceSettings[train].rute[trainLine][startStation]);
      } else {
        setFinishStations([]);
      }
    }, [train, trainLine, startStation]);
  
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
  
  
    const [deletePrompt, setDeletePrompt] = useState(false);
    const [passwordPrompt, setPasswordPrompt] = useState(false);
    const [reload, setReload] = useState(false);
  
    const [showPassword, setShowPassword] = useState(false);
    // const [inputError, setInputError] = useState(false);
    // const [errorMsg, setErrorMsg] = useState('');
  
    const [editPrompt, setEditPrompt] = useState(false);
  
    currentInstructor.isAdmin = true;
    // console.log(currentInstructor.isAdmin);
    currentInstructor.isInstructor = true;
  
  
    
  
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
        time: time,
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
      // formData.append('level', 1);
    
      return formData;
    };  
  
    const handleDaftar = () => {
      setOpen(true);
    };
  
    const handleKembali = () => {
      navigate("/admin");
    };
  
    const handleChangePage = (event: unknown, newPage: number) => {
      setPage(newPage + 1);
      // setPage(newPage);
    };  
    
    const handleRegister = async () => {
      try {
        const formData = await collectDataAndPrepareFormData();
        
        const response = await createCourseAsAdmin(formData);
        console.log("Upload successful", response);
        handleClose();
        resetForm();
        setReload(!reload);
      } catch (error) {
        console.error("Upload failed", error);
      }
    };
    
    useEffect(() => {
        async function getRows(page: number) {
          try {
            setIsLoading(true);
      
            // Fetch both course list and course exam list
            const [courseRes, scoringRes] = await Promise.all([
              getCourseListbyAdmin(1, 1000), // Adjust the size if needed
              getScoringListbyAdmin(page, 5),
            ]);
      
            // Create a map of courseId to course title
            const courseMap: Record<string, string> = courseRes.results.reduce(
              (acc: any, course: any) => {
                acc[course.id] = course.title;
                return acc;
              },
              {}
            );
      
            // Map the scoring list to include the course title
            const resRows: RowData[] = scoringRes.results.map((entry: any) => ({
              id: entry.id,
              title: entry.title, // This is the title from course_exam
              description: entry.description,
              filename: entry.filename,
              published: entry.published,
              courseTitle: courseMap[entry.courseId] || 'Unknown', // Title from course, mapped by courseId
            }));
      
            setRows(resRows);
            setTotalData(scoringRes.total);
        } catch (e) {
            console.error(e);
          } finally {
            setIsLoading(false);
          }
        }
      
        getRows(page);
      }, [page, reload]);
      
  
    const handleDelete = async (id: string) => {
      try {
        await deleteScoringAsAdmin(id);
        setReload(!reload);
      } catch (error) {
        console.error("Failed to publish the course:", error);
      }
    };
  
    // useEffect(() => {
    //   const fetchPayload = async () => {
    //     if (row.id) {
    //       try {
    //         const payloadData = await getPayloadFromCourse(row.id);
    //         setPayload(payloadData);
    //       } catch (error) {
    //         console.error("Failed to fetch payload data:", error);
    //       }
    //     }
    //   };
  
    //   fetchPayload();
    // }, [row.id]);
  
  
    return (
      <Container w={1000} h={700}>
        <div className="flex flex-col p-6 h-full gap-4">
          {/* Search bar */}
          <Box component="form" className="flex gap-4 w-full ">
            <Button
              type="button"
              variant="contained"
              onClick={() => handleDaftar()}
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
            </Button>
            <TextField
              id="input-with-icon-textfield"
              fullWidth
              name="query"
              placeholder="Cari berdasarkan NIP"
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
                <col width="30%" />
                <col width="20%" />
                <col width="30%" />
                <col width="20%" />
              </colgroup>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "17px" }}>
                    Judul Modul Penilaian
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "17px" }}>
                    Jenis Kereta
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "17px" }}>
                    Modul Pembelajaran
                  </TableCell>
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
                      <TableCell>{row.courseTitle}</TableCell>
                      <TableCell>
                        <div className="flex gap-4 justify-end">
                          <Tooltip title="Konfigurasi Modul Penilaian" placement="top">
                            <IconButton
                              size="small"
                              // onClick={() => {
                              //   setDetailId(row.id), setDetailOpen(true);
                              //   setSelectedPeserta({
                              //     id: row.id,
                              //     name: row.name,
                              //     nip: row.nip,
                              //   });
                              //   handleGetUserDetail();
                              // }}
                            >
                              <Info />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Modul Penilaian" placement="top">
                            <IconButton
                              size="small"
                              // onClick={async () => {
                              //   setSelectedPeserta({
                              //     id: row.id,
                              //     name: row.name,
                              //     nip: row.nip,
                              //   });
  
                              //   const peserta = await getUserByIdAsAdmin(row.id);
                              //   setDetailPeserta({
                              //     username: peserta.username,
                              //     name: peserta.name,
                              //     email: peserta.email,
                              //     nip:
                              //       peserta.bio === null
                              //         ? ""
                              //         : peserta.bio.officialCode,
                              //     born:
                              //       peserta.bio === null ? "" : peserta.bio.born,
                              //     position:
                              //       peserta.bio === null
                              //         ? ""
                              //         : peserta.bio.position,
                              //   });
                              //   setNewBirthDate(
                              //     peserta.bio === null
                              //       ? null
                              //       : dayjs(peserta.bio.born)
                              //   );
  
                              //   setEditPrompt(true);
  
                              //   console.log(row.name);
                              // }}
                            >
                              <EditNote />
                            </IconButton>
                          </Tooltip>
                          {/* <Tooltip title="Hapus Modul Pembelajaran" placement="top">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(row.id)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip> */}
                          <Tooltip title="Hapus Modul Penilaian" placement="top">
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
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              ) : (
                <p className="absolute w-full top-1/3 left-0 flex justify-center">
                  Data modul penilaian tidak ditemukan
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
  
        {/* pop up registrasi */}
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle className="px-6 pt-8">Tambah Modul Pembelajaran Baru</DialogTitle>
          <DialogContent className="w-[600px] px-6">
            <DialogContentText>Penambahan Modul Pembelajaran</DialogContentText>
            <TextField
              autoFocus
              margin="normal"
              id="modulName"
              label={<span>Nama Modul Pembelajaran <span style={{ color: 'red' }}>*</span></span>}
              type="text"
              fullWidth
              variant="standard"
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
              // error={!!errors.moduleName}
              // helperText={errors.moduleName}
            />
            <FormControl fullWidth variant="standard" margin="normal">
              <InputLabel id="train-label">Jenis Kereta <span style={{ color: 'red' }}>*</span></InputLabel>
              <Select
                labelId="train-label"
                id="train"
                value={train}
                onChange={(e) => {
                  setTrain(e.target.value);
                  setTrainLine(''); // Reset trainLine when train changes
                  setStartStation(''); // Reset startStation when train changes
                  setFinishStation(''); // Reset finishStation when train changes
                }}
              >
                {Object.keys(sourceSettings).map((key) => (
                  <MenuItem key={key} value={key}>{key.toUpperCase()}</MenuItem>
                ))}
              </Select>
              {/* <FormHelperText>{errors.train}</FormHelperText> */}
            </FormControl>
            <TextField
              margin="normal"
              id="Spesifikasi Kereta"
              label={<span>Berat Kereta <span style={{ color: 'red' }}>*</span></span>}
              type="text"
              fullWidth
              variant="standard"
              value={trainWeight}
              onChange={(e) => setTrainWeight(e.target.value)}
              // error={!!errors.trainWeight}
              // helperText={errors.trainWeight}
            />
            
            <FormControl fullWidth variant="standard" margin="normal" disabled={!train}>
              <InputLabel id="train-label">Line Kereta <span style={{ color: 'red' }}>*</span></InputLabel>
              <Select
                labelId="train-line-label"
                id="train-line"
                value={trainLine}
                onChange={(e) => {
                  setTrainLine(e.target.value);
                  setStartStation(''); // Reset startStation when trainLine changes
                  setFinishStation(''); // Reset finishStation when trainLine changes
                }}
                label="Line Kereta"
              >
                {trainLines.map((line) => (
                  <MenuItem key={line} value={line}>{line}</MenuItem>
                ))}
              </Select>
              {/* <FormHelperText>{errors.trainLine}</FormHelperText> */}
            </FormControl>
            <FormControl fullWidth variant="standard" margin="normal" disabled={!trainLine}>
              <InputLabel id="train-label">Stasiun Awal <span style={{ color: 'red' }}>*</span></InputLabel>
              <Select
                labelId="start-station-label"
                id="start-station"
                value={getDisplayStationName(startStation)}
                onChange={(e) => {
                  setStartStation(getPayloadStationName(e.target.value));
                  setFinishStation(''); // Reset finishStation when startStation changes
                }}
                label="Stasiun Awal"
              >
                {startStations.map((station) => (
                  <MenuItem key={station} value={getDisplayStationName(station)}>{getDisplayStationName(station)}</MenuItem>
                ))}
              </Select>
              {/* <FormHelperText>{errors.startStation}</FormHelperText> */}
            </FormControl>
            <FormControl fullWidth variant="standard" margin="normal" disabled={!startStation}>
              <InputLabel id="train-label">Stasiun Akhir <span style={{ color: 'red' }}>*</span></InputLabel>
              <Select
                labelId="finish-station-label"
                id="finish-station"
                value={getDisplayStationName(finishStation)}
                onChange={(e) => setFinishStation(getPayloadStationName(e.target.value))}
                label="Stasiun Akhir"
              >
                {finishStations.map((station) => (
                  <MenuItem key={station} value={getDisplayStationName(station)}>{getDisplayStationName(station)}</MenuItem>
                ))}
              </Select>
              {/* <FormHelperText>{errors.finishStation}</FormHelperText> */}
            </FormControl>
            <FormControl fullWidth variant="standard" margin="normal">
              <InputLabel id="train-label">Status Hujan <span style={{ color: 'red' }}>*</span></InputLabel>
              <Select
                labelId="rain-status"
                id="rainStatus"
                value={rainStatus}
                onChange={(e) => {
                  setRainStatus(e.target.value);
                }}
                label="Status Hujan"
              >
                  <MenuItem value="Cerah">Cerah</MenuItem>
                  <MenuItem value="Ringan">Ringan</MenuItem>
                  <MenuItem value="Sedang">Sedang</MenuItem>
                  <MenuItem value="Deras">Deras</MenuItem>
              </Select>
            </FormControl>
            <div className="mb-2 mt-8 flex items-center w-full">
              <TimePicker
                label={<span>Waktu <span style={{ color: 'red' }}>*</span></span>}
                ampm={false}
                value={time}
                onChange={(newWaktu) => setTime(newWaktu)}
                className="flex-grow"
                timeSteps={{ minutes: 60 }}
              />
            </div>
            <div className="flex items-center justify-center mt-4 space-x-4">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={motionBase}
                    onChange={handleMotionBaseChange}
                    name="motionBase"
                  />
                }
                label="Motion Base"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={speedBuzzer}
                    onChange={handleSpeedBuzzerChange}
                    name="speedBuzzer"
                  />
                }
                label="Speed Buzzer"
              />
            </div>
            <div className="flex items-center mt-5">Jarak Pandang</div>
            <div className="flex items-center mt-3 gap-3">
              <Visibility className="my-[0.5px] mr-2 text-gray-600" />
              <div className="flex-grow">
                <Slider
                  className="flex-grow"
                  min={0}
                  max={100}
                  step={0.25}
                  value={fog}
                  onChange={handleSliderChange}
                />
              </div>
              <Input
                value={jarakPandang}
                readOnly
                className="w-28"
                size="small"
                onFocus={(e) => e.target.select()}
                endAdornment={
                  <InputAdornment
                    position="start"
                    className={`${
                      jarakPandang !== 0 ? "text-base" : "text-xs"
                    }`}
                  >
                    {jarakPandang !== 0 ? "meter" : "Tidak berkabut"}
                  </InputAdornment>
                }
              />
            </div>
            <TextField
              margin="normal"
              id="Speed Limit"
              label={
                <span>
                  Speed Limit (km/h) {speedBuzzer && <span style={{ color: 'red' }}>*</span>}
                </span>
              }
              type="text"
              fullWidth
              variant="standard"
              value={speedLimit}
              onChange={handleSpeedLimitChange}
              error={!!error}
              helperText={error}
              disabled={!speedBuzzer}
              // error={!!errors.speedLimit}
              // helperText={errors.speedLimit}
            />
          </DialogContent>
          <DialogActions className="px-6 pb-4">
            <Button onClick={handleClose} color="error">
              Kembali
            </Button>
            <Button onClick={handleRegister} disabled={!isAddButtonEnabled}>Tambah</Button>
          </DialogActions>
        </Dialog>
  
        {/* Delete Modul prompt */}
        <Dialog open={deletePrompt} onClose={() => setDeletePrompt(false)}>
          <DialogContent className="min-w-[260px]">
            Hapus Modul: <b>{selectedModul.title}</b>?
          </DialogContent>
          <DialogActions className="flex mb-2 justify-between">
            <Button
              className="mx-2"
              onClick={() => {
                if (selectedModul.id) {
                  handleDelete(selectedModul.id);
                }
                setDeletePrompt(false);
              }}
              color="error"
            >
              Hapus
            </Button>
            <Button
              className="mx-2"
              
              onClick={() => setDeletePrompt(false)}
              variant="contained"
            >
              Batal
            </Button>
          </DialogActions>
        </Dialog>
  
        <FullPageLoading loading={pageLoading} />
      </Container>
    );
  };
  
  export default ScoringList;
  