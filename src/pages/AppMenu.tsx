import { useState, useEffect } from "react";
// import "../App.css";
import { useNavigate } from "react-router-dom";
import {
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Paper,
  MenuItem,
  Menu,
  TablePagination,
  TextField,
  InputAdornment,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { getUsers, getUserById } from "../services/user.services";
import Container from "@/components/Container";
import {
  Train,
  DirectionsRailway,
  Settings,
  Money,
  PeopleAlt,
  Warning,
} from "@mui/icons-material";
import TraineeDetail from "../components/TraineeDetail";
import { getSubmissionList } from "../services/submission.services";
import { currentPeserta } from "../context/auth";
import dayjs, { Dayjs } from "dayjs";
import SearchIcon from "@mui/icons-material/Search";
import { useSettings } from "../context/settings";
import { sendTextToClients } from "@/socket";

function AppMenu() {
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  const [scoringAnchorEl, setScoringAnchorEl] = useState(null);

  const navigate = useNavigate();

  const { settings, setSettings } = useSettings();

  const handlePrev = () => {
    navigate("/FirstPage");
  };
  const handleNext = () => {
    navigate("/");
  };
  const handleSimulation = () => {
    navigate("/ThirdPage");
  };
  const handleDatabase = () => {
    navigate("/FourthPage");
  };
  // const handleSettings = () => {
  //   navigate("/FifthPage");
  // };
  // const handleScoring = () => {
  //   navigate("/SixthPage");
  // };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);
    setPage(1);
    setTotalData(0);

    const data = new FormData(e.currentTarget);
    const query = data.get("query") as string;

    try {
      const res = await getUsers(1, 5, query);
      const resRows = res.results.map((data: any) => ({
        id: data.id,
        name: data.name,
        nip: data.username,
      }));

      setRows(resRows);
      setTotalData(res.total);
    } catch (e) {
      console.error(e);
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  };
  // Full page loading
  const [pageLoading, setPageLoading] = useState(false);

  const [editPrompt, setEditPrompt] = useState(false);

  const handleGetLog = async () => {
    setPageLoading(true);

    try {
      currentPeserta.id = selectedPeserta.id;
      currentPeserta.name = selectedPeserta.name;
      currentPeserta.nip = selectedPeserta.nip;
      await getSubmissionList(1, 5, selectedPeserta.id);
      console.log("getting log for user: " + selectedPeserta.id);

      navigate("/userlog");
    } catch (e) {
      console.error(e);
    } finally {
      setPageLoading(false);
    }
  };

  const handleSettingsClick = (event: any) => {
    setSettingsAnchorEl(event.currentTarget);
  };
  const handleScoringClick = (event: any) => {
    setScoringAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };

  const handleScoringClose = () => {
    setScoringAnchorEl(null);
  };

  const handleSettingsOptionClick = (type: any) => {
    navigate(`/FifthPage?type=${type}`);
    handleSettingsClose();
  };

  const handleScoringOptionClick = (type: any) => {
    navigate(`/SixthPage/${type}`);
    handleScoringClose();
  };

  // Detail peserta
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  interface RowData {
    id: string;
    name: string;
    nip: string;
  }

  const [rows, setRows] = useState<RowData[]>([
    // Local testing purposes
    // {
    //   id: "123",
    //   name: "Dummy user",
    //   nip: "123456",
    // },
  ]);

  const [selectedPeserta, setSelectedPeserta] = useState({
    id: "",
    name: "",
    nip: "",
  });

  const [totalData, setTotalData] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function getRows(page: number) {
      try {
        setIsLoading(true);
        const res = await getUsers(page, 5);
        const resRows = res.results.map((data: any) => ({
          id: data.id,
          name: data.name,
          nip: data.username,
        }));
        setRows(resRows);
        setTotalData(res.total);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }

    getRows(page);
  }, [page]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage + 1);
  };

  const [detailPeserta, setDetailPeserta] = useState({
    username: "",
    name: "",
    email: "",
    nip: "",
    born: "",
    position: "",
  });

  const [newBirthDate, setNewBirthDate] = useState<Dayjs | null>(null);

  const [hoveredBox, setHoveredBox] = useState(null);

  const handleMouseEnter = (boxId: any) => {
    setHoveredBox(boxId);
  };

  const handleMouseLeave = () => {
    setHoveredBox(null);
  };

  const [selectedValue, setSelectedValue] = useState("Default");
  const [selectedValue2, setSelectedValue2] = useState("Default");
  const [selectedValue3, setSelectedValue3] = useState("normal");
  const [selectedValue4, setSelectedValue4] = useState("normal");

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

    const storedValue3 = localStorage.getItem("valueSettingsLRT");
    if (storedValue3) {
      setSelectedValue3(storedValue3);
    }

    const storedValue4 = localStorage.getItem("valueSettingsKCIC");
    if (storedValue4) {
      setSelectedValue4(storedValue4);
    }
  }, []);

  // const [isKcicSelected, setIsKcicSelected] = useState(false);
  // const [isLrtSelected, setIsLrtSelected] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  // Handle Select button click
  const handleSelectButtonClick = () => {
    // if (selectedPeserta.id !== "") {
    //   if (selectedValue === "KCIC") {
    //     setIsKcicSelected(true);
    //   } else if (selectedValue === "LRT") {
    //     setIsLrtSelected(true);
    //   }
    // }
    setIsSelected(true);
  };

  // Effect to reset button selection state when the table data changes
  useEffect(() => {
    // setIsKcicSelected(false);
    // setIsLrtSelected(false);
    setIsSelected(false);
  }, [rows]);

  const [isConfirmationOpen, setConfirmationOpen] = useState(false);

  const [modul, setModul] = useState("Testing");

  const handleStartClick = () => {
    // Show the confirmation popup
    setConfirmationOpen(true);
  };

  const handleConfirmationClose = () => {
    // Close the confirmation popup
    setConfirmationOpen(false);
  };

  const handleConfirmationYes = async () => {
    const payload = {
      // module: modul,
      train_type: "LRT",
      train: {
        weight: "72",
        type: "12 Rangkaian Kereta",
      },
      time: "12",
      weather: [
        {
          value: "Cerah",
          location: [0, 0],
          name: "rain",
        },
        {
          value: 0,
          location: [0, 0],
          name: "fog",
        },
      ],
      route: {
        start: {
          name: "Harjamukti",
        },
        finish: {
          name: "TMII",
        },
      },
      motion_base: false,
      speed_buzzer: false,
      speed_limit: 70,
      status: "play",
      module: `${selectedValue3}`,
    };

    console.log(payload);

    try {
      setIsLoading(true);

      sendTextToClients(JSON.stringify(payload, null, 2));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
    // Handle the confirmation action, navigate or perform other actions
    navigate(`/Fifthpage/lrt?type=${selectedValue2}`);
    // Close the confirmation popup
    setConfirmationOpen(false);
  };

  const [isConfirmationOpenKcic, setConfirmationOpenKcic] = useState(false);

  const handleStartClickKcic = () => {
    // Show the confirmation popup
    setConfirmationOpenKcic(true);
  };

  const handleConfirmationCloseKcic = () => {
    // Close the confirmation popup
    setConfirmationOpenKcic(false);
  };

  const handleConfirmationYesKcic = async () => {
    const payload = {
      // module: modul,
      train_type: "KCIC",
      train: {
        weight: "72",
        type: "12 Rangkaian Kereta",
      },
      time: "12",
      weather: [
        {
          value: "Cerah",
          location: [0, 0],
          name: "rain",
        },
        {
          value: 0,
          location: [0, 0],
          name: "fog",
        },
      ],
      route: {
        start: {
          name: "Harjamukti",
        },
        finish: {
          name: "TMII",
        },
      },
      motion_base: false,
      speed_buzzer: false,
      speed_limit: 70,
      status: "play",
      module: `${selectedValue4}`,
    };

    console.log(payload);

    try {
      setIsLoading(true);

      sendTextToClients(JSON.stringify(payload, null, 2));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
    // Handle the confirmation action, navigate or perform other actions
    navigate(`/Fifthpage/kcic?type=${selectedValue2}`);
    // Close the confirmation popup
    setConfirmationOpenKcic(false);
  };

  return (
    <>
      <Container w={1500}>
        {/* Header  */}
        <header className="header ">
          <h2 className="p-4">Menu</h2>
          <nav className="flex gap-4 p-4">
            <Button
              variant="outlined"
              onClick={handleSimulation}
              sx={{
                color: "#f3f3f4",
                borderColor: "#f3f3f4",
                "&:hover": {
                  borderColor: "#00a6fb",
                  color: "#00a6fb",
                  // backgroundColor: "#00a6fb",
                },
              }}
            >
              Simulation
            </Button>
            <Button
              variant="outlined"
              onClick={handleDatabase}
              sx={{
                color: "#f3f3f4",
                borderColor: "#f3f3f4",
                "&:hover": {
                  borderColor: "#00a6fb",
                  color: "#00a6fb",
                  // backgroundColor: "#00a6fb",
                },
              }}
            >
              Database
            </Button>
            <Button
              variant="outlined"
              onClick={handleSettingsClick}
              disabled={!selectedPeserta.id || isSelected}
              sx={{
                color: "#f3f3f4",
                borderColor: "#f3f3f4",
                "&:hover": {
                  borderColor: "#00a6fb",
                  color: "#00a6fb",
                  // backgroundColor: "#00a6fb",
                },
              }}
            >
              Settings
            </Button>
            <Menu
              anchorEl={settingsAnchorEl}
              open={Boolean(settingsAnchorEl)}
              onClose={handleSettingsClose}
              PaperProps={{
                style: {
                  width: settingsAnchorEl ? settingsAnchorEl.clientWidth : null,
                },
              }}
            >
              <MenuItem onClick={() => handleSettingsOptionClick("kcic")}>
                KCIC
              </MenuItem>
              <MenuItem onClick={() => handleSettingsOptionClick("lrt")}>
                LRT
              </MenuItem>
            </Menu>

            {/* <Select
              labelId="status-settings"
              label="Status Settings"
              sx={{
                "& .MuiSelect-icon": {
                  color: "#ffffff", // Set the color of the select icon to white
                  borderColor: "#001119",
                  "&:hover": {
                    borderColor: "#001119",
                    color: "#00a6fb",
                    // backgroundColor: "#00a6fb",
                  },
                },
              }}
            >
              <MenuItem onClick={() => handleSettingsOptionClick("kcic")}>
                KCIC
              </MenuItem>
              <MenuItem onClick={() => handleSettingsOptionClick("lrt")}>
                LRT
              </MenuItem>
            </Select> */}
            <Button
              variant="outlined"
              onClick={handleScoringClick}
              sx={{
                color: "#f3f3f4",
                borderColor: "#f3f3f4",
                "&:hover": {
                  borderColor: "#00a6fb",
                  color: "#00a6fb",
                  // backgroundColor: "#00a6fb",
                },
              }}
            >
              Scoring
            </Button>
            <Menu
              anchorEl={scoringAnchorEl}
              open={Boolean(scoringAnchorEl)}
              onClose={handleScoringClose}
              PaperProps={{
                style: {
                  width: scoringAnchorEl ? scoringAnchorEl.clientWidth : null,
                },
              }}
            >
              <MenuItem onClick={() => handleScoringOptionClick("kcic")}>
                KCIC
              </MenuItem>
              <MenuItem onClick={() => handleScoringOptionClick("lrt")}>
                LRT
              </MenuItem>
            </Menu>
          </nav>
        </header>
        {/* First Box  */}
        <div className="flex gap-4 justify-center pr-8 pl-8 pt-8 w-full">
          {/* box 1 */}
          <div className="flex flex-grow">
            <div className="relative flex flex-grow">
              <div
                className="box gap-6 flex flex-col flex-grow"
                style={{ backgroundColor: "#ffffff" }}
                onMouseEnter={() => handleMouseEnter(1)}
                onMouseLeave={handleMouseLeave}
              >
                <h1>KCIC</h1>
                <Button
                  variant="outlined"
                  // onClick={() => {
                  //   navigate(`/Fifthpage/kcic?type=${selectedValue}`);
                  // }}
                  onClick={handleStartClickKcic}
                  disabled={!selectedPeserta.id || isSelected}
                  sx={{
                    color: "#00a6fb",
                    borderColor: "#00a6fb",
                    backgroundColor: "#ffffff",
                    fontSize: "1.2rem", // Adjust the font size as needed
                    "&:hover": {
                      borderColor: "#ffffff",
                      color: "#ffffff",
                      backgroundColor: "#00a6fb",
                    },
                  }}
                  startIcon={<Train className="text-3xl" />}
                  className="flex items-center"
                >
                  Start
                </Button>
                <Dialog
                  open={isConfirmationOpenKcic}
                  onClose={handleConfirmationCloseKcic}
                >
                  <DialogTitle
                    sx={{
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Warning sx={{ mr: 1 }} color="warning" /> Konfirmasi
                  </DialogTitle>
                  <DialogContent>
                    Apakah yakin untuk langsung menjalankan simulasi KCIC?
                  </DialogContent>
                  <DialogActions>
                    <Button
                      onClick={handleConfirmationCloseKcic}
                      sx={{ color: "#df2935" }}
                    >
                      No
                    </Button>
                    <Button
                      onClick={handleConfirmationYesKcic}
                      sx={{ color: "#00a6fb" }}
                    >
                      Yes
                    </Button>
                  </DialogActions>
                </Dialog>
              </div>
              {hoveredBox === 1 && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-center py-2">
                  <p className="text-white">
                    Mengoperasikan kereta KCIC secara langsung dengan setelan
                    kereta standar dan setelan penilaian {selectedValue}.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* box 2 */}
          <div className="flex flex-grow">
            <div className="relative flex flex-grow">
              <div
                className="box gap-6 flex flex-col flex-grow"
                style={{ backgroundColor: "#ffffff" }}
                onMouseEnter={() => handleMouseEnter(2)}
                onMouseLeave={handleMouseLeave}
              >
                <h1>LRT</h1>
                {/* {selectedValue2} */}
                <Button
                  variant="outlined"
                  // onClick={() => {
                  //   navigate(`/Fifthpage/lrt?type=${selectedValue2}`);
                  // }}
                  onClick={handleStartClick}
                  disabled={!selectedPeserta.id || isSelected}
                  sx={{
                    color: "#00a6fb",
                    borderColor: "#00a6fb",
                    backgroundColor: "#ffffff",
                    fontSize: "1.2rem", // Adjust the font size as needed
                    "&:hover": {
                      borderColor: "#ffffff",
                      color: "#ffffff",
                      backgroundColor: "#00a6fb",
                    },
                  }}
                  startIcon={<DirectionsRailway className="text-3xl" />}
                  className="flex items-center"
                >
                  Start
                </Button>
                <Dialog
                  open={isConfirmationOpen}
                  onClose={handleConfirmationClose}
                >
                  <DialogTitle
                    sx={{
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Warning sx={{ mr: 1 }} color="warning" /> Konfirmasi
                  </DialogTitle>
                  <DialogContent>
                    Apakah yakin untuk langsung menjalankan simulasi LRT?
                  </DialogContent>
                  <DialogActions>
                    <Button
                      onClick={handleConfirmationClose}
                      sx={{ color: "#df2935" }}
                    >
                      No
                    </Button>
                    <Button
                      onClick={handleConfirmationYes}
                      sx={{ color: "#00a6fb" }}
                    >
                      Yes
                    </Button>
                  </DialogActions>
                </Dialog>
              </div>
              {hoveredBox === 2 && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-center py-2">
                  <p className="text-white">
                    Mengoperasikan kereta LRT secara langsung dengan setelan
                    kereta standar dan setelan penilaian {selectedValue2}.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Box 3 */}
          {/* <div className="box gap-6 flex flex-col " style={{ width: "250px" }}>
            <h1 style={{ fontSize: "2rem" }}>Settings KCIC</h1>
            <div className="flex gap-4 items-center">
              <p>Presets:</p>
              <Button
                variant="outlined"
                disabled={!selectedPeserta.id || isSelected}
                onClick={() => {
                  navigate("/Fifthpage?type=kcic");
                }}
                sx={{
                  color: "#00a6fb",
                  borderColor: "#00a6fb",
                  backgroundColor: "#ffffff",
                  fontSize: "1rem", // Adjust the font size as needed
                  "&:hover": {
                    borderColor: "#ffffff",
                    color: "#ffffff",
                    backgroundColor: "#00a6fb",
                  },
                }}
                startIcon={<Settings className="text-3xl" />}
                className="flex items-center"
              >
                Default
              </Button>
            </div>
          </div> */}
          {/* Box 4 */}
          {/* <div className="box gap-6 flex flex-col " style={{ width: "250px" }}>
            <h1 style={{ fontSize: "2rem" }}>Settings LRT</h1>
            <div className="flex gap-4 items-center">
              <p>Presets:</p>
              <Button
                variant="outlined"
                disabled={!selectedPeserta.id || isSelected}
                sx={{
                  color: "#00a6fb",
                  borderColor: "#00a6fb",
                  backgroundColor: "#ffffff",
                  fontSize: "1rem", // Adjust the font size as needed
                  "&:hover": {
                    borderColor: "#ffffff",
                    color: "#ffffff",
                    backgroundColor: "#00a6fb",
                  },
                }}
                startIcon={<Settings className="text-3xl" />}
                className="flex items-center"
              >
                Default
              </Button>
            </div>
          </div> */}
        </div>

        {/* Second Box  */}
        <div className="flex gap-4 justify-center pr-8 pl-8 pt-8 w-full">
          {/* Box 1 */}
          <div className="box flex-grow gap-6 flex flex-col">
            {/* tabel preview */}
            <TableContainer component={Paper}>
              <Table stickyHeader aria-label="Tabel Peserta">
                <colgroup>
                  <col width="50%" />
                  <col width="30%" />
                  <col width="20%" />
                </colgroup>
                <TableHead>
                  <TableRow>
                    <TableCell>Nama</TableCell>
                    <TableCell>NIP</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                {isLoading ? (
                  <div className=" w-full top-1/3 left-0 flex justify-center">
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
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.nip}</TableCell>
                        <TableCell align="right">
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="text"
                              onClick={() => {
                                setDetailId(row.id), setDetailOpen(true);
                                setSelectedPeserta({
                                  id: row.id,
                                  name: row.name,
                                  nip: row.nip,
                                });
                              }}
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
                              Detail
                            </Button>
                            <Button
                              sx={{
                                color: "#00a6fb",
                                backgroundColor: "#ffffff",
                                borderColor: "#00a6fb",
                                "&:hover": {
                                  borderColor: "#00a6fb",
                                  color: "#ffffff",
                                  backgroundColor: "#00a6fb",
                                },
                                "&:active": {
                                  backgroundColor: "#00a6fb", // Change background color when clicked
                                },
                              }}
                              type="button"
                              variant={
                                selectedPeserta.nip === row.nip
                                  ? "outlined"
                                  : "text"
                              }
                              onClick={() =>
                                setSelectedPeserta({
                                  id: row.id,
                                  name: row.name,
                                  nip: row.nip,
                                })
                              }
                              className="w-20 ml-2"
                            >
                              Select
                            </Button>
                          </div>
                        </TableCell>
                        {/* <TableCell align="right">
                  </TableCell> */}
                      </TableRow>
                    ))}
                  </TableBody>
                ) : (
                  <p className=" w-full top-1/3 left-0 flex justify-center">
                    Data user tidak ditemukan
                  </p>
                )}
              </Table>
            </TableContainer>
            <div className="flex flex-wrap mb-8 gap-4 ">
              <Box
                component="form"
                onSubmit={handleSubmit}
                className="flex gap-4 items-stretch "
              >
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
                  }}
                />
                <Button
                  type="submit"
                  variant="outlined"
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
                  // className=" bg-white text-blue-600 hover:bg-blue-600 hover:text-white border-solid border-blue-600"
                >
                  Find
                </Button>
              </Box>
              <Button
                variant="outlined"
                onClick={() => {
                  navigate("/FourthPage"); // ganti type = defaultnya, ambil dari const
                }}
                sx={{
                  color: "#00a6fb",
                  borderColor: "#00a6fb",
                  backgroundColor: "#ffffff",
                  fontSize: "1rem", // Adjust the font size as needed
                  "&:hover": {
                    borderColor: "#ffffff",
                    color: "#ffffff",
                    backgroundColor: "#00a6fb",
                  },
                }}
                startIcon={<PeopleAlt className="text-3xl" />}
                className="flex items-center"
              >
                Details
              </Button>

              <TablePagination
                // rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalData}
                rowsPerPage={5}
                page={page - 1}
                onPageChange={handleChangePage}
                rowsPerPageOptions={[5]}
                className="overflow-hidden mt-auto"
                // onRowsPerPageChange={handleChangeRowsPerPage}
              />
              {/* Detail peserta */}
              <TraineeDetail
                id={detailId}
                isOpen={detailOpen}
                handleClose={() => setDetailOpen(false)}
                handleLog={() => {
                  setDetailOpen(false);
                  handleGetLog();
                }}
                handleEdit={async () => {
                  const peserta = await getUserById(detailId);
                  setDetailPeserta({
                    username: peserta.username,
                    name: peserta.name,
                    email: peserta.email,
                    nip: peserta.bio === null ? "" : peserta.bio.officialCode,
                    born: peserta.bio === null ? "" : peserta.bio.born,
                    position: peserta.bio === null ? "" : peserta.bio.position,
                  });
                  setNewBirthDate(
                    peserta.bio === null ? null : dayjs(peserta.bio.born)
                  );
                  setEditPrompt(true);
                }}
                // handleHapus={() => {
                //   setDetailOpen(false);
                //   handleHapusUser();
                // }}
              />
            </div>
          </div>

          {/* box 2 */}
          {/*<div className="flex " style={{ width: "300px" }}>
            <div className="relative flex flex-grow">
              <div
                className="box gap-6 flex flex-col flex-grow"
                style={{ backgroundColor: "#ffffff" }}
                onMouseEnter={() => handleMouseEnter(3)}
                onMouseLeave={handleMouseLeave}
              >
                <h1 style={{ fontSize: "2rem" }}>Scoring KCIC</h1>
                <div className="flex gap-4 items-center">
                  <p>Presets:</p>

                  <Button
                    variant="outlined"
                    onClick={() => {
                      navigate("/Sixthpage/kcic?type=default"); // ganti type = defaultnya, ambil dari const
                    }}
                    sx={{
                      color: "#00a6fb",
                      borderColor: "#00a6fb",
                      backgroundColor: "#ffffff",
                      fontSize: "1rem", // Adjust the font size as needed
                      "&:hover": {
                        borderColor: "#ffffff",
                        color: "#ffffff",
                        backgroundColor: "#00a6fb",
                      },
                    }}
                    startIcon={<Settings className="text-3xl" />}
                    className="flex items-center"
                  >
                    {selectedValue}
                  </Button>
                </div>
              </div>
              {hoveredBox === 3 && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-center py-2">
                  <p className="text-white">
                    Menggunakan setelan {selectedValue} untuk penilaian KCIC
                  </p>
                </div>
              )}
            </div>
          </div>*/}

          {/* box 3 */}
          {/* <div className="flex " style={{ width: "300px" }}>
            <div className="relative flex flex-grow">
              <div
                className="box gap-6 flex flex-col flex-grow"
                style={{ backgroundColor: "#ffffff" }}
                onMouseEnter={() => handleMouseEnter(4)}
                onMouseLeave={handleMouseLeave}
              >
                <h1 style={{ fontSize: "2rem" }}>Scoring LRT</h1>
                <div className="flex gap-4 items-center">
                  <p>Presets:</p>

                  <Button
                    variant="outlined"
                    onClick={() => {
                      navigate("/Sixthpage/lrt?type=default"); // ganti type = defaultnya, ambil dari const
                    }}
                    sx={{
                      color: "#00a6fb",
                      borderColor: "#00a6fb",
                      backgroundColor: "#ffffff",
                      fontSize: "1rem", // Adjust the font size as needed
                      "&:hover": {
                        borderColor: "#ffffff",
                        color: "#ffffff",
                        backgroundColor: "#00a6fb",
                      },
                    }}
                    startIcon={<Settings className="text-3xl" />}
                    className="flex items-center"
                  >
                    {selectedValue2}
                  </Button>
                </div>
              </div>
              {hoveredBox === 4 && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-center py-2">
                  <p className="text-white">
                    Menggunakan setelan {selectedValue2} untuk penilaian LRT
                  </p>
                </div>
              )}
            </div>
          </div>*/}
        </div>

        {/* Third Box  */}
        <div className="flex gap-4 justify-center pr-8 pl-8 pt-8 w-full">
          {/* box 1 */}
          <div className="flex flex-grow">
            <div className="relative flex flex-grow">
              <div
                className="box gap-6 flex flex-col flex-grow"
                style={{ backgroundColor: "#ffffff" }}
                onMouseEnter={() => handleMouseEnter(5)}
                onMouseLeave={handleMouseLeave}
              >
                <h1 style={{ fontSize: "2rem" }}>Settings KCIC</h1>
                <div className="flex gap-4 items-center">
                  <p>Presets:</p>

                  <Button
                    variant="outlined"
                    // disabled={!selectedPeserta.id || isSelected}
                    onClick={() => {
                      // navigate("/Fifthpage?type=kcic");
                      navigate("/FifthPage/modul/edit?type=kcic");
                    }}
                    sx={{
                      color: "#00a6fb",
                      borderColor: "#00a6fb",
                      backgroundColor: "#ffffff",
                      fontSize: "1rem", // Adjust the font size as needed
                      "&:hover": {
                        borderColor: "#ffffff",
                        color: "#ffffff",
                        backgroundColor: "#00a6fb",
                      },
                    }}
                    startIcon={<Settings className="text-3xl" />}
                    className="flex items-center"
                  >
                    {selectedValue4}
                  </Button>
                </div>
              </div>
              {hoveredBox === 5 && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-center py-2">
                  <p className="text-white pr-2 pl-2">
                    Menggunakan setelan {selectedValue4} untuk pengaturan KCIC
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* box 2 */}
          <div className="flex flex-grow">
            <div className="relative flex flex-grow">
              <div
                className="box gap-6 flex flex-col flex-grow"
                style={{ backgroundColor: "#ffffff" }}
                onMouseEnter={() => handleMouseEnter(6)}
                onMouseLeave={handleMouseLeave}
              >
                <h1 style={{ fontSize: "2rem" }}>Settings LRT</h1>
                <div className="flex gap-4 items-center">
                  <p>Presets:</p>

                  <Button
                    variant="outlined"
                    // disabled={!selectedPeserta.id || isSelected}
                    onClick={() => {
                      navigate("/FifthPage/modul/edit?type=lrt");
                    }}
                    sx={{
                      color: "#00a6fb",
                      borderColor: "#00a6fb",
                      backgroundColor: "#ffffff",
                      fontSize: "1rem", // Adjust the font size as needed
                      "&:hover": {
                        borderColor: "#ffffff",
                        color: "#ffffff",
                        backgroundColor: "#00a6fb",
                      },
                    }}
                    startIcon={<Settings className="text-3xl" />}
                    className="flex items-center"
                  >
                    {selectedValue3}
                  </Button>
                </div>
              </div>
              {hoveredBox === 6 && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-center py-2">
                  <p className="text-white pr-2 pl-2">
                    Menggunakan setelan {selectedValue3} untuk pengaturan LRT
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* box 3 */}
          <div className="flex flex-grow">
            <div className="relative flex flex-grow">
              <div
                className="box gap-6 flex flex-col flex-grow"
                style={{ backgroundColor: "#ffffff" }}
                onMouseEnter={() => handleMouseEnter(3)}
                onMouseLeave={handleMouseLeave}
              >
                <h1 style={{ fontSize: "2rem" }}>Scoring KCIC</h1>
                <div className="flex gap-4 items-center">
                  <p>Presets:</p>

                  <Button
                    variant="outlined"
                    onClick={() => {
                      navigate("/Sixthpage/kcic?type=default"); // ganti type = defaultnya, ambil dari const
                    }}
                    sx={{
                      color: "#00a6fb",
                      borderColor: "#00a6fb",
                      backgroundColor: "#ffffff",
                      fontSize: "1rem", // Adjust the font size as needed
                      "&:hover": {
                        borderColor: "#ffffff",
                        color: "#ffffff",
                        backgroundColor: "#00a6fb",
                      },
                    }}
                    startIcon={<Settings className="text-3xl" />}
                    className="flex items-center"
                  >
                    {/*Default ganti default,  ambil dari const  */}
                    {selectedValue}
                  </Button>
                </div>
              </div>
              {hoveredBox === 3 && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-center py-2">
                  <p className="text-white">
                    Menggunakan setelan {selectedValue} untuk penilaian KCIC
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* box 4 */}
          <div className="flex flex-grow">
            <div className="relative flex flex-grow">
              <div
                className="box gap-6 flex flex-col flex-grow"
                style={{ backgroundColor: "#ffffff" }}
                onMouseEnter={() => handleMouseEnter(4)}
                onMouseLeave={handleMouseLeave}
              >
                <h1 style={{ fontSize: "2rem" }}>Scoring LRT</h1>
                <div className="flex gap-4 items-center">
                  <p>Presets:</p>

                  <Button
                    variant="outlined"
                    onClick={() => {
                      navigate("/Sixthpage/lrt?type=default"); // ganti type = defaultnya, ambil dari const
                    }}
                    sx={{
                      color: "#00a6fb",
                      borderColor: "#00a6fb",
                      backgroundColor: "#ffffff",
                      fontSize: "1rem", // Adjust the font size as needed
                      "&:hover": {
                        borderColor: "#ffffff",
                        color: "#ffffff",
                        backgroundColor: "#00a6fb",
                      },
                    }}
                    startIcon={<Settings className="text-3xl" />}
                    className="flex items-center"
                  >
                    {selectedValue2}
                  </Button>
                </div>
              </div>
              {hoveredBox === 4 && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-center py-2">
                  <p className="text-white">
                    {/* Menggunakan setelan {settings.score} untuk penilaian LRT */}
                    Menggunakan setelan {selectedValue2} untuk penilaian LRT
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* nav */}
        <div className="flex gap-4 justify-start p-8 w-full">
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
                // backgroundColor: "rgba(223, 41, 53, 0.4)", // Lower opacity red color
                color: "#ffffff",
              },
            }}
            onClick={() => {
              handlePrev();
            }}
          >
            Log Out
          </Button>
        </div>
      </Container>
    </>
  );
}

export default AppMenu;
