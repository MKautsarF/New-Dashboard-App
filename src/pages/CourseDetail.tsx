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
import { CircularProgress, Paper, Table, TableBody, TableCell, TableHead, TableRow, TablePagination } from "@mui/material";
import { BookmarkAdd } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { Info } from "@mui/icons-material";
import { EditNote } from "@mui/icons-material";
import { Delete } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import { editCourseAsAdmin } from '../services/course.services';
import { getScoringByCourse } from '@/services/scoring.services';
import { getCourseListbyAdmin } from '../services/course.services';
import { deleteScoringAsAdmin } from '@/services/scoring.services';
import ModulDialog from '@/components/ModulDialog';
import dayjs from 'dayjs';


interface ScoringDetail {
	id: string,
	name: string,
}
const fs = require("fs");


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
	const role = query.get("role");
	console.log("role: " ,role)

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
	const [speedLimit, setSpeedLimit] = useState("");
	const [jarakPandang, setJarakPandang] = useState(null);
	const [startStations, setStartStations] = useState([]);
	const [finishStations, setFinishStations] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [useDefault, setUseDefault] = useState(true);
	const [isEditing, setIsEditing] = useState(false);

	const [rows, setRows] = useState<any[]>([]);
	const [page, setPage] = useState(1);
	const [totalData, setTotalData] = useState(0);

	const [open, setOpen] = useState(false);
	const [openEdit, setOpenEdit] = useState(false);
	

	const [selectedScoring, setSelectedScoring] = useState(null);
	const [deletePrompt, setDeletePrompt] = useState(false);
	const type = query.get('type')

	const [reload, setReload] = useState(false);
	const [error, setError] = useState('');
	const [isAddButtonEnabled, setIsAddButtonEnabled] = useState(false);
	
	const toogleEdit = () => {
		setIsEditing(!isEditing);
		console.log("modulename", moduleName)
		setOpenEdit(!openEdit);
	}

	const navigateBack = () => {
		if(role === "admin") {
			navigate("/admin/courselist?role=admin");
		}
		else {
			navigate(`/admin/courselist?role=instructor&type=${type}`);
		}
	}

	const handleMotionBaseChange = (event: any) => {
    setMotionBase(event.target.checked);
  };

  const handleSpeedBuzzerChange = (event: any) => {
    setSpeedBuzzer(event.target.checked);
    setSpeedLimit(""); // Reset speedLimit when speedBuzzer changes
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
    const fetchData = async () => {
      try {
        const res = await getCourseListbyAdmin(1, 100);
        console.log("Course List: ", res);
        setCourses(res.results);
      } catch (error) {
        console.error(error);
      }
    };

    const getRows = async (id: any) => {
      try {
        const res = await getCourseDetail(id);
		console.log("ress", res)
        setPayload(res);
      } catch (e) {
        console.error(e);
      }
    };

    const getModulePenilaian = async (id: any, page: any, rowsPerPage: any) => {
      try {
        setIsLoading(true);
        const res = await getScoringByCourse(id, page, rowsPerPage);
        console.log("Module Penilaian: ", res);
        setRows(res.results);
        setTotalData(res.total);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    if (courseId) {
      getRows(courseId);
      getModulePenilaian(courseId, page, 5);
    }
  	}, [courseId, page, reload]);

	const handleChangePage = (event: unknown, newPage: number) => {
		setPage(newPage + 1);
	};

	const [initialValues, setInitialValues] = useState({
		moduleName: '',
		train: '',
		trainWeight: '',
		trainLine: '',
		startStation: '',
		finishStation: '',
		rainStatus: '',
		fog: 0,
		time: null,
		motionBase: false,
		speedBuzzer: false,
		speedLimit: '',
		jarakPandang: 0,
	  });

	useEffect(() => {
		if (isEditing && payload) {
		  // Set fields from payload
		  const newInitialValues = {
			moduleName: payload.module_name || '',
			train: payload.train_type || '',
			trainWeight: payload.train?.weight || '',
			trainLine: payload.train_line || '',
			startStation: payload.route?.start?.name || '',
			finishStation: payload.route?.finish?.name || '',
			rainStatus: payload.weather?.find((item: any) => item.name === 'rain')?.value || '',
			fog: payload.weather?.find((item: any) => item.name === 'fog')?.value || 2,
			time: payload.time ? new Date(1970, 0, 1, ...payload.time.split(':').map(Number)) : null,
			motionBase: payload.motion_base || false,
			speedBuzzer: payload.speed_buzzer || false,
			speedLimit: payload.speed_limit || '',
			jarakPandang: payload.weather[1]?.value >= 0.5 ? Math.round(Math.pow(payload.weather[1]?.value / 100, -0.914) * 50.6) : 2,
		  };
		  setInitialValues(newInitialValues);
	  
		  // Set form values
		  setModuleName(newInitialValues.moduleName);
		  setTrain(newInitialValues.train);
		  setTrainWeight(newInitialValues.trainWeight);
		  setTrainLine(newInitialValues.trainLine);
		  setStartStation(newInitialValues.startStation);
		  setFinishStation(newInitialValues.finishStation);
		  setRainStatus(newInitialValues.rainStatus);
		  setFog(newInitialValues.fog);
		  setTime(newInitialValues.time);
		  setMotionBase(newInitialValues.motionBase);
		  setSpeedBuzzer(newInitialValues.speedBuzzer);
		  setSpeedLimit(newInitialValues.speedLimit);
		  setJarakPandang(newInitialValues.jarakPandang);
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
		  setTrainLines([]);
		}
	  }, [isEditing, payload]);

	useEffect(() => {
		const hasChanges = 
		  moduleName !== initialValues.moduleName ||
		  train !== initialValues.train ||
		  trainWeight !== initialValues.trainWeight ||
		  trainLine !== initialValues.trainLine ||
		  startStation !== initialValues.startStation ||
		  finishStation !== initialValues.finishStation ||
		  rainStatus !== initialValues.rainStatus ||
		  fog !== initialValues.fog ||
		  time?.getHours() !== initialValues.time?.getHours() ||
		  time?.getMinutes() !== initialValues.time?.getMinutes() ||
		  motionBase !== initialValues.motionBase ||
		  speedBuzzer !== initialValues.speedBuzzer ||
		  speedLimit !== initialValues.speedLimit ||
		  jarakPandang !== initialValues.jarakPandang;
	  
		setIsAddButtonEnabled(hasChanges);
	  }, [
		moduleName, train, trainWeight, trainLine, startStation, finishStation, 
		rainStatus, fog, time, motionBase, speedBuzzer, speedLimit, jarakPandang, 
		initialValues
	  ]);

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


	const handleSliderChange = (event: Event, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      const fogDistance =
        newValue >= 0.5 ? Math.round(Math.pow(newValue / 100, -0.914) * 50.6) : 0;
      setFog(Math.round(newValue));
      setJarakPandang(fogDistance);
    	}
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
				setReload(!reload);
			} catch (e) {
				console.error(e);
			}
		}

	return (
		<Container w={1000} h={700}>
			<div className="flex flex-col p-6 h-full gap-4">
				<h1 className='flex items-center justify-center'>Detail Modul Pembelajaran</h1>
				<div className='flex flex-row gap-4 w-full'>
					<div className='w-2/5'>
						<div className='mb-4 text-2xl'>Konfigurasi Modul:</div>
						<div className='flex flex-row gap-10'>
							<div className='flex flex-col gap-5'>
								<div className='flex flex-col gap-2'>
									<span>Nama Modul Pembelajaran</span>
									<div className='ml-2'>
											<div>
												<h3>{payload.module_name}</h3>
											</div>
									</div>
								</div>
								<div className='flex flex-col gap-2'>
									<span>Jenis Kereta</span>
									<div className='ml-2'>
											<div>
												<h3>{payload?.train_type ? payload.train_type.toUpperCase() : ''}</h3>
											</div>
									</div>
								</div>
								<div className='flex flex-col gap-2'>
									<span>Berat Kereta</span>
									<div className='ml-2'>
											<div>
												<h3>{payload.train?.weight} kg</h3>
											</div>
									</div>
								</div>
								<div className='flex flex-col gap-2'>
									<span>Line Kereta</span>
									<div className='ml-2'>
											<div>
												<h3>{payload.train_line}</h3>
											</div>
									</div>
								</div>
								<div className='flex flex-col gap-2'>
									<span>Stasiun Mulai</span>
									<div className='ml-2'>
											<div>
												<h3>{payload.route?.start?.name}</h3>
											</div>
									</div>
								</div>
								<div className='flex flex-col gap-2'>
									<span>Stasiun Akhir</span>
									<div className='ml-2'>
											<div>
												<h3>{payload.route?.finish?.name}</h3>
											</div>
									</div>
								</div>
							</div>
							<div className='flex flex-col gap-5'>
								<div className='flex flex-col gap-2'>
									<span>Status Hujan</span>
									<div className='ml-2'>
											<div>
												<h3>{payload.weather?.[0]?.value}</h3>
											</div>
									</div>
								</div>
								<div className='flex flex-col gap-2'>
									<span>Waktu</span>
									<div className='ml-2'>
											<div>
												<h3>{payload.time}:00</h3>
											</div>
									</div>
								</div>
								<div className='flex flex-col gap-2'>
									<span>Jarak Pandang</span>
									<div className='ml-2'>
											<div>
												<h3>
													{(() => {
														const value = Math.round(Math.pow(payload.weather?.[1]?.value / 100, -0.914) * 50.6);
														
														return Number.isFinite(value) ? `${value} m` : '∞ m';
													})()}
												</h3>
											</div>
									</div>
								</div>
								<div className='flex flex-col gap-2'>
									<span>Motion Base</span>
									<div className='ml-2'>
											<div>
												<h3>{payload.motion_base? "On": "Off"}</h3>
											</div>
									</div>
								</div>
								<div className='flex flex-col gap-2'>
									<span>Speed Buzzer</span>
									<div className='ml-2'>
											<div>
												<h3>{payload.speed_buzzer ? payload.speed_limit : "Off"}</h3>
											</div>
									</div>
								</div>
								<div className='flex flex-col gap-2'>
									<span>Edit Konfigurasi:</span>
									<Button
										type="button"
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
										variant="contained"
										onClick={() => toogleEdit()}
										className='ml-2'
									>
										Edit
									</Button>
								</div>
							</div>
						</div>
					</div>
					<div className='w-3/5'>
						{/* Tabel Preview */}
						<TableContainer className="mt-5" component={Paper} sx={{
							maxHeight: '420px',
							overflowY: 'hidden',
						}}>
							<Table stickyHeader aria-label="Tabel Peserta">
							<colgroup>
								<col width="60%" />
								<col width="40%" />
							</colgroup>
							<TableHead>
								<TableRow>
								<TableCell sx={{ fontWeight: "bold", fontSize: "17px" }}>
									Modul Penilaian
								</TableCell>
								<TableCell className='flex items-center justify-end'>
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
								</TableCell>
								</TableRow>
							</TableHead>
							{isLoading ? (
								<div className="absolute w-full top-1/3 left-0 flex justify-center">
								<CircularProgress />
								</div>
							) : rows.length > 0 ? (
								<>
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
										<div className="flex gap-4 justify-end">
											<Tooltip title="Detail" placement="top">
											<IconButton
												size="small"
												onClick={() => {
												setSelected({
													id: row.id,
													title: row.title,
												});
												navigate(`/Scoring?type=${row.id}&courseID=${courseId}&train=${payload.train_type}&mode=edit&role=admin`);
												}}
											>
												<Info />
											</IconButton>
											</Tooltip>
											<Tooltip title="Hapus Modul Penilaian" placement="top">
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
								<TablePagination
									component="div"
									count={totalData}
									rowsPerPage={5}
									page={page - 1}
									onPageChange={handleChangePage}
									rowsPerPageOptions={[5]}
									className="overflow-hidden"
								/>
								</>
							) : (
								<div className="absolute mt-6 w-[562px]">
									<p className='flex items-center justify-center'>
										Data modul penilaian tidak ditemukan
									</p>
								</div>
							)}
							</Table>
						</TableContainer>
						</div>

				</div>
				{/* <div className='w-2/5 flex items-center justify-end'>
					<Button
						type="button"
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
						variant="contained"
						onClick={() => toogleEdit()}
						className='mr-12'
					>
						Edit
					</Button>
				</div> */}
				<div className="flex gap-4">
					<Button
						type="button"
						color="error"
						variant="outlined"
						className="text-base absolute bottom-6 left-6"
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
						onClick={() => navigateBack()}
					>
						Kembali
					</Button>
				</div>
			</div>
			
			{/* pop up registrasi dan edit */}
			<ModulDialog
					open={openEdit}
					setOpen={toogleEdit}
					mode="edit"
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
					handleRegister={handleSave}
					isAddButtonEnabled={isAddButtonEnabled}
					sourceSettings={sourceSettings}
					trainLines={trainLines}
					startStations={startStations}
					finishStations={finishStations}
					getDisplayStationName={getDisplayStationName}
					getPayloadStationName={getPayloadStationName}
			/>

			{/* pop up add scoring*/}
			<Dialog open={open} onClose={() => setOpen(false)}>
				<DialogTitle className="px-6 pt-6">
					Tambah Modul Penilaian
				</DialogTitle>
				<DialogContent className="w-[600px] px-6">
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
						color="error"
						onClick={() => setOpen(false)}
					>
						Batal
					</Button>
					<Button
						type="button"
						variant="contained"
						onClick={() => handleCreateScoring()}
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
						Buat
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