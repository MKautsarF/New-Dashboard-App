import React, { useEffect, useState } from 'react';
import { useMemo } from "react";
import Container from '../components/Container';
import {Button, DialogContentText, TableContainer} from "@mui/material";
import { useNavigate, useLocation, Form } from "react-router-dom";
import {getCourseDetail} from "../services/course.services";
import {TextField, FormControl, Select, MenuItem} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { Slider, Input, InputAdornment } from "@mui/material";
import { Checkbox, FormControlLabel, Dialog, DialogContent, DialogTitle, DialogActions } from "@mui/material";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import TimePicker from "../components/TimePicker";
import { CircularProgress, Paper, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { BookmarkAdd } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { Info } from "@mui/icons-material";
import { EditNote } from "@mui/icons-material";
import { Delete } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
const fs = require("fs");

import { editCourseAsAdmin } from '../services/course.services';
import { getScoringByCourse } from '@/services/scoring.services';
import { getCourseListbyAdmin } from '../services/course.services';
import { deleteScoringAsAdmin } from '@/services/scoring.services';

interface ScoringDetail {
	id: string,
	name: string,
}



function useQuery() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}

const CourseDetail = () => {
	const sourceSettingsPath =
    "C:/Train Simulator/Data/settings_train - Copy.json";
  const sourceSettingsRead = fs.readFileSync(sourceSettingsPath, "utf-8");
  const sourceSettings = JSON.parse(sourceSettingsRead);
	const navigate = useNavigate();
	//get query params
	const query = useQuery();
	const courseId = query.get("id");
	console.log("id: " ,courseId)

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
  const getMappedStationName = (stationName: any) => {
    return stationMapping[stationName] || stationName;
  };

	const [payload, setPayload] = useState<any>([]);
	const [moduleName, setModuleName] = useState("");
	const [train, setTrain] = useState("");
	const [trainLine, setTrainLine] = useState("");
	const [trainWeight, setTrainWeight] = useState("");
	const [trainLines, setTrainLines] = useState<string[]>([]);
	const [startStation, setStartStation] = useState("");
	const [finishStation, setFinishStation] = useState("");
	const [rainStatus, setRainStatus] = useState("");
	const [fog, setFog] = useState(null);
	const [time, setTime] = useState(null);
	const [motionBase, setMotionBase] = useState(false);
	const [speedBuzzer, setSpeedBuzzer] = useState(false);
	const [speedLimit, setSpeedLimit] = useState(0);
	const [jarakPandang, setJarakPandang] = useState(null);
	const [startStations, setStartStations] = useState([]);
	const [finishStations, setFinishStations] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [useDefault, setUseDefault] = useState(true);
	const [isEditing, setIsEditing] = useState(false);

	const [rows, setRows] = useState<any[]>([]);
	const [open, setOpen] = useState(false);
	const role = query.get("role");

	const [selectedScoring, setSelectedScoring] = useState(null);
	const [deletePrompt, setDeletePrompt] = useState(false);
	
	const toogleEdit = () => {
		setIsEditing(!isEditing);
	}

	const navigateBack = () => {
		if(role === "admin") {
			navigate("/admin/courselist?role=admin");
		}
		else {
			navigate("/admin/courselist?role=instruktur");
		}
	}

	const handleMotionBaseChange = (event: any) => {
    setMotionBase(event.target.checked);
  };

  const handleSpeedBuzzerChange = (event: any) => {
    setSpeedBuzzer(event.target.checked);
    setSpeedLimit(0); // Reset speedLimit when speedBuzzer changes
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
    // formData.append('level', 1);
  
    return formData;
  };  

	const handleSave = async () => {
    try {
      const formData = await collectDataAndPrepareFormData();
      
      // const response = await editCourseAsAdmin(courseId, formData);
      // console.log("Upload successful", response);
			async function getRows(id: any) {
				try {
					const res = await getCourseDetail(courseId);
					setPayload(res);
					console.log("res: ", res);
				} catch (e) {
					console.error(e);
				} finally {
				}
			}
			getRows(courseId);
			toogleEdit();
			
    } catch (error) {
      console.error("Upload failed", error);
    }
  };



	useEffect(() => {
    async function getRows(id: any) {
      try {
        const res = await getCourseDetail(courseId);
        setPayload(res);
				console.log("res: ", res);
      } catch (e) {
        console.error(e);
      } finally {
      }
    }
	async function getModulePenilaian(id: any) {
		try{
			const res = await getScoringByCourse(id, 1, 100);
			console.log("ress", res)
			setRows(res.results);
		} catch (e) {
		}
	}
	async function fetchData()  {
		try {
				const res = await getCourseListbyAdmin(1, 100);
				console.log("aku", res);
				setCourses(res.results);
		} catch (error) {
		}
};
fetchData();
	getRows(courseId);
	getModulePenilaian(courseId);
  }, [courseId]);
	

  useEffect(() => {
    if (isEditing && payload) {
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
      setFog(payload.weather?.find((item: { name: string, value: string | number }) => item.name === 'fog')?.value || 2);
      
      setTime(payload.time || null);
      setMotionBase(payload.motion_base || false);
      setSpeedBuzzer(payload.speed_buzzer || false);
      setSpeedLimit(payload.speed_limit || '');
	  const fogDistance =
        payload.weather[1]?.value >= 0.5 ? Math.round(Math.pow(payload.weather[1]?.value / 100, -0.914) * 50.6) : 2;
      setJarakPandang(fogDistance);
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
      setSpeedLimit(0);
      setJarakPandang(0);
			setTrainLines([]);
    }
  }, [isEditing, payload]);

	useEffect(() => {
		if (train) {
			setTrainLines(Object.keys(sourceSettings[train].rute));
		}
		if (trainLine) {
			setStartStations(Object.keys(sourceSettings[train]?.rute[trainLine] || {}));
		}
		if (startStation) {
			setFinishStations(sourceSettings[train]?.rute[trainLine]?.[startStation] || []);
		}
	}, [train, startStation]);


	const handleSliderChange = (event: Event, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      const fogDistance =
        newValue >= 0.5 ? Math.round(Math.pow(newValue / 100, -0.914) * 50.6) : 0;
      setFog(Math.round(newValue));
      setJarakPandang(fogDistance);
    }
  };

	const handleSpeedLimitChange = (event: Event, newValue: number | number[]) => {
		if (typeof newValue === 'number') {
      setSpeedLimit(newValue);
    }
	}

	const [openCreateScoring, setOpenCreateScoring] = useState(false);
	const handleDaftar = () => {
		setOpen(true);
	}

	const [selectedCourse, setSelectedCourse] = useState("Default");
	const handleSelectedCourse = (course: any) => {
		if (course === "Default") {
			setUseDefault(true);
		}
		else {
			setUseDefault(false);
		}
		setSelectedCourse(course);
	}
    const [selected, setSelected] = useState<{ id: string | null; title: string | null }>({
			id: null,
			title: null,
		});
    const [courses, setCourses] = useState<[]>([]);
    const [scoring, setScoring] = useState();

    const handleTemplateChange = (template: any) => {
        setSelectedCourse(template);
        setSelectedScoring(null);
    };

    const handleScoringOptionChange = (option: string) => {
        setSelectedScoring(option);
    };

		const handleCreateScoring = () => {
			setOpen(false);
			if (useDefault) {
				navigate(`/Scoring?type=default&courseID=${courseId}&train=${payload.train_type}&mode=new&role=admin`);
			}
			else {
				navigate(`/Scoring?type=${selectedScoring}&courseID=${courseId}&train=${payload.train_type}&mode=new&role=admin`);
			}
		};

    useEffect(() => {
        async function fetchData(courseId: any) {
						try {
							const res = await getScoringByCourse(courseId, 1, 100);
							console.log("ress", res)
							setScoring(res);
						}
						catch (e) {
							console.error(e);
						}
				}
				if (!useDefault) {
        	fetchData(courseId);
				}
    }
    , [selectedCourse]);

		const handleDelete = async (id: string) => {
			try {
				const res = await deleteScoringAsAdmin(id);
				console.log("res", res);
				const res2 = await getScoringByCourse(courseId, 1, 100);
				setRows(res2.results);
			} catch (e) {
				console.error(e);
			}
		}

	return (
		<Container w={1000} h={700}>
			<div className="flex flex-col gap-4 justify-center items-center p-5">
				<h1>Course Detail</h1>
				<div className='flex flex-row gap-4 w-full'>
					<div className='flex flex-row gap-5 w-1/2'>
						<div className='flex flex-col gap-5'>
							<div className='flex flex-col gap-2'>
								<span>Nama Modul Pembelajaran</span>
								<div className='ml-2'>
									{isEditing ? (
										<TextField
										autoFocus
										margin="none"
										id="modulName"
										type="text"
										style={isEditing ? { display: "block" } : { display: "none" }}
										fullWidth
										variant="standard"
										value={payload.module_name}
										onChange={(e) => setModuleName(e.target.value)}
										/>
										
									) : (
										<div>
											<h3>{payload.module_name}</h3>
										</div>
									)}
								</div>
							</div>
							<div className='flex flex-col gap-2'>
								<span>Jenis Kereta</span>
								<div className='ml-2'>
									{isEditing ? (
										<FormControl fullWidth variant="standard" margin="none">
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
											<MenuItem value="lrt">LRT</MenuItem>
											<MenuItem value="kcic">Kereta Cepat</MenuItem>
										</Select>
										</FormControl>
										
									) : (
										<div>
											<h3>{payload?.train_type ? payload.train_type.toUpperCase() : ''}</h3>
										</div>
									)}
								</div>
							</div>
							<div className='flex flex-col gap-2'>
								<span>Berat Kereta</span>
								<div className='ml-2'>
									{isEditing ? (
										<TextField
										margin="none"
										id="Spesifikasi Kereta"
										type="text"
										fullWidth
										variant="standard"
										value={trainWeight}
										onChange={(e) => setTrainWeight(e.target.value)}
										/>
										
									) : (
										<div>
											<h3>{payload.train?.weight} kg</h3>
										</div>
									)}
								</div>
							</div>
							<div className='flex flex-col gap-2'>
								<span>Line Kereta</span>
								<div className='ml-2'>
									{isEditing ? (
									<FormControl fullWidth variant="standard" margin="none" disabled={!train}>
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
										</FormControl>
									) : (
										<div>
											<h3>{payload.train_line}</h3>
										</div>
									)}
								</div>
							</div>
							<div className='flex flex-col gap-2'>
								<span>Stasiun Mulai</span>
								<div className='ml-2'>
									{isEditing ? (
									<FormControl fullWidth variant="standard" margin="none" disabled={!trainLine}>
									<Select
										labelId="start-station-label"
										id="start-station"
										value={startStation}
										onChange={(e) => {
											setStartStation(e.target.value);
											setFinishStation(''); // Reset finishStation when startStation changes
										}}
										label="Stasiun Awal"
									>
										{startStations.map((station) => (
											<MenuItem key={station} value={station}>{station}</MenuItem>
										))}
									</Select>
									{/* <FormHelperText>{errors.startStation}</FormHelperText> */}
								</FormControl>
									) : (
										<div>
											<h3>{payload.route?.start?.name}</h3>
										</div>
									)}
								</div>
							</div>
							<div className='flex flex-col gap-2'>
								<span>Stasiun Akhir</span>
								<div className='ml-2'>
									{isEditing ? (
									<FormControl fullWidth variant="standard" margin="none" disabled={!startStation}>
									<Select
										labelId="finish-station-label"
										id="finish-station"
										value={finishStation}
										onChange={(e) => setFinishStation(e.target.value)}
										label="Stasiun Akhir"
									>
										{finishStations.map((station) => (
											<MenuItem key={station} value={station}>{station}</MenuItem>
										))}
									</Select>
									{/* <FormHelperText>{errors.finishStation}</FormHelperText> */}
								</FormControl>
									) : (
										<div>
											<h3>{payload.route?.finish?.name}</h3>
										</div>
									)}
								</div>
							</div>
						</div>
						<div className='flex flex-col gap-5'>
							<div className='flex flex-col gap-2'>
								<span>Status Hujan</span>
								<div className='ml-2'>
									{isEditing ? (
									<FormControl fullWidth variant="standard" margin="none">
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
									) : (
										<div>
											<h3>{payload.weather?.[0]?.value}</h3>
										</div>
									)}
								</div>
							</div>
							<div className='flex flex-col gap-2'>
								<span>Waktu</span>
								<div className='ml-2'>
									{isEditing ? (
										//use flatpickr
										<TimePicker value={time} onChange={setTime} mode='edit' />
									) : (
										<div>
											<h3>{payload.time}</h3>
										</div>
									)}
								</div>
							</div>
							<div className='flex flex-col gap-2'>
								<span>Jarak Pandang</span>
								<div className='ml-2'>
									{isEditing ? (
										//use flatpickr
										<div className="flex items-center mt-3 gap-3">
											{/* <Visibility className="my-[0.5px] mr-2 text-gray-600" /> */}
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
											className="w-20"
											size="small"
											onFocus={(e) => e.target.select()}
											endAdornment={
												<InputAdornment
												position="start"
												className={`${
													jarakPandang !== 0 ? "text-base" : "text-xs"
												}`}
											>
												{jarakPandang !== 0 ? "m" : "None"}
												{
													}
												</InputAdornment>
											}
											/>
										</div>
									) : (
										<div>
											<h3>{Math.round(Math.pow(payload.weather?.[1]?.value / 100, -0.914) * 50.6)} m</h3>
										</div>
									)}
								</div>
							</div>
							<div className='flex flex-col gap-2'>
								<span>Motion Base</span>
								<div className='ml-2'>
									{isEditing ? (
										//use flatpickr
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
									) : (
										<div>
											<h3>{payload.motion_base? "On": "Off"}</h3>
										</div>
									)}
								</div>
							</div>
							<div className='flex flex-col gap-2'>
								<span>Speed Buzzer</span>
								<div className='ml-2'>
									{isEditing ? (
										//use flatpickr
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
									) : (
										<div>
											<h3>{payload.speed_buzzer ? payload.speed_limit : "Off"}</h3>
										</div>
									)}
								</div>
							</div>
							{
								speedBuzzer && (
									<div className="flex items-center mt-3 gap-3">
											{/* <Visibility className="my-[0.5px] mr-2 text-gray-600" /> */}
											<div className="flex-grow">
											<Slider
												className="flex-grow"
												min={0}
												max={100}
												step={1}
												value={speedLimit}
												onChange={handleSpeedLimitChange}
											/>
											</div>
											<Input
											value={speedLimit}
											readOnly
											className="w-20"
											size="small"
											onFocus={(e) => e.target.select()}
											endAdornment={
												<InputAdornment
												position="start"
												
												>
												{
													}
												</InputAdornment>
											}
											/>
										</div>
								)
							}
						</div>
					</div>
					<div>
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
						{/* tabel preview */}
						<TableContainer className="mt-5" component={Paper}sx={{
    maxHeight: '400px', // Adjust this value to your desired max width
    overflowY: 'auto',
  }}>
          <Table stickyHeader aria-label="Tabel Peserta" >
            <colgroup>
              <col width="80%" />
              <col width="20%" />
            </colgroup>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", fontSize: "17px" }}>
                  Judul Modul Pembelajaran
                </TableCell>
                {/* <TableCell sx={{ fontWeight: "bold", fontSize: "17px" }}>
                  Tipe Kereta
                </TableCell> */}
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            {isLoading ? (
              <div className="absolute w-full top-1/3 left-0 flex justify-center">
                <CircularProgress />
              </div>
            ) : rows?.length > 0 ? (
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                    }}
                  >
                    <TableCell>{row.title}</TableCell>
                    {/* <TableCell>
                      {row.description === "KCIC" ? "Kereta Cepat" : row.description}
                    </TableCell> */}
                    {/* <TableCell>
                      {!row.published && (
                        <Button
                          variant="contained"
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
                    </TableCell> */}
                    <TableCell>
                      <div className="flex gap-4 justify-end">
                        <Tooltip title="Detail" placement="top">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelected({
                                id: row.id,
                                title: row.title,
                              });
                              // setConfigPrompt(true);
                              navigate(`/Scoring?type=${row.id}&courseID=${courseId}&train=${payload.train_type}&mode=edit&role=admin`);
                            }}
                          >
                            <Info />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Hapus Modul Pembelajaran" placement="top">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelected({
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
              <p className="absolute w-full top-1/3 right-4/5">
                Data modul pembelajaran tidak ditemukan
              </p>
            )}
          </Table>
        </TableContainer>
				
					</div>
				</div>
			</div>
			{
				isEditing ? (
					<div className="absolute left-1/3">
						<Button
							type="button"
							color="primary"
							variant="contained"
							className='mr-4'
							onClick={() => handleSave()}
						>
							Simpan
						</Button>
						<Button
							type="button"
							color="error"
							variant="contained"
							onClick={() => toogleEdit()}
						>
							Batal
						</Button>
					</div>
				) :
				<div className="absolute left-1/3">
				<Button
					type="button"
					color="primary"
					variant="contained"
					onClick={() => toogleEdit()}
				>
					Edit
				</Button>
				</div>
			}
			
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
				className='absolute bottom-8 left-4'
				onClick={() => navigateBack()}
			>
				Kembali
			</Button>
			<Dialog open={open} onClose={() => setOpen(false)}>
			<DialogTitle className="px-8 pt-8">
          Tambah Modul Penilaian
        </DialogTitle>
				<DialogContent className="w-[600px] px-8">
					<DialogContentText> Template </DialogContentText>
					<FormControl fullWidth variant="standard" margin="none">
							<Select
									labelId="rain-status"
									id="rainStatus"
									value={selectedCourse}
									onChange={(e) => {
											handleSelectedCourse(e.target.value);
									}}
									label="Status Hujan"
							>		<MenuItem value={"Default"}>Default</MenuItem>
									{courses.map((course: any) => (
											<MenuItem value={course.id}>{course.title} - {course.description}</MenuItem>
									))}
							</Select>
					</FormControl>
					{ !useDefault && scoring?.total > 0 && (
						<FormControl fullWidth variant="standard" margin="normal">
							<Select
							value={selectedScoring}
							onChange={(e) => {setSelectedScoring(e.target.value)}}>
								{scoring?.results.map((score: any) => (
									<MenuItem value={score.id}>{score.title}</MenuItem>
								))}
							</Select>
						</FormControl>
					)
					}
				</DialogContent>
				<DialogContent className="flex justify-center items-center gap-4">
					<Button
						type="button"
						color="primary"
						variant="contained"
						onClick={() => handleCreateScoring()}
					>
						Buat
					</Button>
					<Button
						type="button"
						color="error"
						variant="contained"
						onClick={() => setOpen(false)}
					>
						Batal
					</Button>
				</DialogContent>
			</Dialog>
			{/* Delete Modul prompt */}
      <Dialog open={deletePrompt} onClose={() => setDeletePrompt(false)}>
        <DialogContent className="min-w-[260px]">
          Hapus Modul: <b>{selected.title}</b>?
        </DialogContent>
        <DialogActions className="flex mb-2 justify-between">
          <Button
            className="mx-2"
            onClick={async () => {
              if (selected.id) {
                await handleDelete(selected.id);
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
		</Container>
	);
}

export default CourseDetail;