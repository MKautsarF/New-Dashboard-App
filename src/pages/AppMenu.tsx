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
} from "@mui/material";
import { getUsers, getUserById } from "../services/user.services";
import Container from "@/components/Container";
import {
  Train,
  DirectionsRailway,
  Settings,
  Money,
  PeopleAlt,
} from "@mui/icons-material";
import TraineeDetail from "../components/TraineeDetail";
import { getSubmissionList } from "../services/submission.services";
import { currentPeserta } from "../context/auth";
import dayjs, { Dayjs } from "dayjs";
import SearchIcon from "@mui/icons-material/Search";

function AppMenu() {
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  const [scoringAnchorEl, setScoringAnchorEl] = useState(null);

  const navigate = useNavigate();

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
                  onClick={() => {
                    navigate("/Fifthpage/kcic");
                  }}
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
              </div>
              {hoveredBox === 1 && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-center py-2">
                  <p className="text-white">
                    Mengoperasikan kereta KCIC secara langsung
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
                <Button
                  variant="outlined"
                  onClick={() => {
                    navigate("/Fifthpage/lrt");
                  }}
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
              </div>
              {hoveredBox === 2 && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-center py-2">
                  <p className="text-white">
                    Mengoperasikan kereta LRT secara langsung
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Box 3 */}
          {/* <div className="box gap-6 flex flex-col " style={{ width: "300px" }}>
            <h1 style={{ fontSize: "2.5rem" }}>Settings KCIC</h1>
            <div className="flex gap-4 items-center">
              <p>Presets:</p>
              <Button
                variant="outlined"
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
          {/* <div className="box gap-6 flex flex-col " style={{ width: "300px" }}>
            <h1 style={{ fontSize: "2.5rem" }}>Settings LRT</h1>
            <div className="flex gap-4 items-center">
              <p>Presets:</p>
              <Button
                variant="outlined"
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
        <div className="flex gap-4 justify-center p-8 w-full">
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
          <div className="flex " style={{ width: "300px" }}>
            <div className="relative flex flex-grow">
              <div
                className="box gap-6 flex flex-col flex-grow"
                style={{ backgroundColor: "#ffffff" }}
                onMouseEnter={() => handleMouseEnter(3)}
                onMouseLeave={handleMouseLeave}
              >
                <h1 style={{ fontSize: "2.5rem" }}>Scoring KCIC</h1>
                <div className="flex gap-4 items-center">
                  <p>Presets:</p>

                  <Button
                    variant="outlined"
                    onClick={() => {
                      navigate("/Sixthpage/kcic/edit?type=default"); // ganti type = defaultnya, ambil dari const
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
                    Default{/* ganti default,  ambil dari const  */}
                  </Button>
                </div>
              </div>
              {hoveredBox === 3 && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-center py-2">
                  <p className="text-white">
                    Menggunakan setelan "Default" untuk penilaian KCIC
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* box 3 */}
          <div className="flex " style={{ width: "300px" }}>
            <div className="relative flex flex-grow">
              <div
                className="box gap-6 flex flex-col flex-grow"
                style={{ backgroundColor: "#ffffff" }}
                onMouseEnter={() => handleMouseEnter(4)}
                onMouseLeave={handleMouseLeave}
              >
                <h1 style={{ fontSize: "2.5rem" }}>Scoring LRT</h1>
                <div className="flex gap-4 items-center">
                  <p>Presets:</p>

                  <Button
                    variant="outlined"
                    onClick={() => {
                      navigate("/Sixthpage/lrt/edit?type=default"); // ganti type = defaultnya, ambil dari const
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
                    Default{/* ganti default,  ambil dari const  */}
                  </Button>
                </div>
              </div>
              {hoveredBox === 4 && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-center py-2">
                  <p className="text-white">
                    Menggunakan setelan "Default" untuk penilaian LRT
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-4 justify-start pl-8 pb-8 w-full">
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
