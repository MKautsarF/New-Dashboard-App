import { useState, useEffect, useMemo } from "react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useNavigate, useLocation } from "react-router-dom";
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
  DialogContentText,
} from "@mui/material";
import {
  getUsers,
  getUserById,
  updateUserById,
} from "../services/user.services";
import { currentInstructor, useAuth } from "@/context/auth";
import Container from "@/components/Container";
import { Train, DirectionsRailway, PeopleAlt } from "@mui/icons-material";
import TraineeDetail from "../components/TraineeDetail";
import dayjs, { Dayjs } from "dayjs";
import SearchIcon from "@mui/icons-material/Search";
import { DatePicker } from "@mui/x-date-pickers";
import lrtPng from "@/static/lrt.png";
import kcicPng from "@/static/kcic.png";
import { toast } from "react-toastify";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

function useQuery() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}

function AppMenu() {
  const [scoringAnchorEl, setScoringAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const isScoringMenuOpen = Boolean(scoringAnchorEl);

  const [learningAnchorEl, setLearningAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const isLearningMenuOpen = Boolean(learningAnchorEl);

  const [reload, setReload] = useState(false);

  const navigate = useNavigate();

  const handlePrev = () => {
    navigate("/FirstPage");
  };

  const handleNext = () => {
    navigate("/");
  };

  const query = useQuery();

  const { instructor, logout } = useAuth();
  localStorage.setItem("instructorName", instructor.name);

  const handleSimulation = () => {
    navigate("/ThirdPage");
  };
  const handleDatabase = () => {
    navigate("/FourthPage", { state: { fromAppMenu: true } });
  };
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
      console.log("detailId", detailId);
      navigate(`/FourthPage/UserLog?id=${detailId}`);
    } catch (e) {
      console.error(e);
    } finally {
      setPageLoading(false);
    }
  };

  const handleEditPeserta = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const newName = formData.get("new-name") as string;
    const newEmail = formData.get("new-email") as string;
    const newNIP = formData.get("new-nip") as string;
    const newPosition = formData.get("new-position") as string;

    const payload = {
      name: newName,
      username: newNIP,
      email: newEmail,
      bio: {
        identityNumber: newNIP,
        born: newBirthDate.format("YYYY-MM-DD"),
        position: newPosition,
      },
    };

    try {
      const res = await updateUserById(detailId, payload);

      setEditPrompt(false);
      toast.success("Data peserta berhasil diubah", { position: "top-center" });
      setDetailOpen(false);
      setDetailId("");
    } catch (e) {
      const errMsg = e.response.data.errorMessage;
      toast.error(errMsg, { position: "top-center" });
    }
  };

  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogoutOpen = () => setLogoutOpen(true);
  const handleLogoutClose = () => setLogoutOpen(false);

  const handleScoringClose = () => {
    setScoringAnchorEl(null);
  };

  const handleLearningClick = (event: React.MouseEvent<HTMLElement>) => {
    if (isLearningMenuOpen) {
      setLearningAnchorEl(null);
    } else {
      setLearningAnchorEl(event.currentTarget);
    }
  };

  const handleLearningClose = () => {
    setLearningAnchorEl(null);
  };

  const handleLearningOptionClick = (type: any) => {
    navigate(`/courselist?&type=${type}`);
    handleLearningClose();
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

  const [rows, setRows] = useState<RowData[]>([]);

  const [selectedPeserta, setSelectedPeserta] = useState({
    id: "",
    name: "",
    nip: "",
  });

  localStorage.setItem("selectedPesertaName", selectedPeserta.name);

  const [totalData, setTotalData] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function getRows(page: number) {
      try {
        setIsLoading(true);
        const res = await getUsers(page, 4);
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
  }, [page, reload]);

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
  const [selectedValue3, setSelectedValue3] = useState("Eksplorasi");
  const [selectedValue4, setSelectedValue4] = useState("Eksplorasi");

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

  const [isSelected, setIsSelected] = useState(false);

  // Handle Select button click
  const handleSelectButtonClick = () => {
    setIsSelected(true);
  };

  // Effect to reset button selection state when the table data changes
  useEffect(() => {
    setIsSelected(false);
  }, [rows]);

  const handleStartClick = () => {
    const trainType = "lrt"; // Define your trainType here
    navigate(`/FifthPage?type=${trainType}`, {
      state: { from: "startClickLrt" },
    });
  };

  const handleStartClickKcic = () => {
    const trainType = "kcic"; // Define your trainType here
    navigate(`/FifthPage?type=${trainType}`, {
      state: { from: "startClickKcic" },
    });
  };

  const handleConfirmLogout = () => {
    logout();
    navigate("/");
  };

  const handleRiwayatClick = () => {
    navigate("/SubmissionList");
  };

  useEffect(() => {
    console.log("detailId", detailId);
  }, [detailId]);

  return (
    <>
      <Container w={1500} h={950}>
        {/* Header  */}
        <header className="header">
          <div className="pl-6 font-bold text-2xl">Menu</div>
          <nav className="flex gap-4 pr-6">
            <Button
              variant="outlined"
              onClick={handleSimulation}
              sx={{
                color: "#f3f3f4",
                borderColor: "#f3f3f4",
                "&:hover": {
                  borderColor: "#00a6fb",
                  color: "#00a6fb",
                },
              }}
            >
              <PlayArrowIcon className="mr-2 ml-[-6px] text-[17px]" /> Mulai
              Simulasi
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
                },
              }}
            >
              <PeopleAlt className=" flex mr-2 ml-[-3px] text-[17px]" /> Peserta
            </Button>
            <Button
              variant="outlined"
              onClick={handleLearningClick}
              sx={{
                color: "#f3f3f4",
                borderColor: "#f3f3f4",
                "&:hover": {
                  borderColor: "#00a6fb",
                  color: "#00a6fb",
                },
              }}
            >
              Pembelajaran{" "}
              {isLearningMenuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Button>
            <Menu
              anchorEl={learningAnchorEl}
              open={Boolean(learningAnchorEl)}
              onClose={handleLearningClose}
              PaperProps={{
                style: {
                  width: learningAnchorEl ? learningAnchorEl.clientWidth : null,
                },
              }}
            >
              <MenuItem onClick={() => handleLearningOptionClick("kcic")}>
                High Speed Train
              </MenuItem>
              <MenuItem onClick={() => handleLearningOptionClick("lrt")}>
                Light Rail Transit
              </MenuItem>
            </Menu>
            <Button
              variant="outlined"
              onClick={handleRiwayatClick}
              sx={{
                color: "#f3f3f4",
                borderColor: "#f3f3f4",
                "&:hover": {
                  borderColor: "#00a6fb",
                  color: "#00a6fb",
                },
              }}
            >
              Riwayat
            </Button>
          </nav>
        </header>
        {/* First Box  */}
        <div className="flex gap-4 justify-center px-6 pt-4 w-full">
          {/* box 1 */}
          <div className="flex flex-grow">
            <div className="relative flex flex-grow">
              <div
                className="box gap-6 flex flex-col flex-grow"
                style={{
                  backgroundImage: `url(${kcicPng})`, // Use the lrtPng variable as the background image URL
                  backgroundColor: "#ffffff",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                onMouseEnter={() => handleMouseEnter(1)}
                onMouseLeave={handleMouseLeave}
              >
                <h1
                  className="text-white "
                  style={{
                    textShadow: "2px 2px 0px black",
                  }}
                >
                  High Speed Train
                </h1>
                <Button
                  variant={
                    !selectedPeserta.id || isSelected ? "outlined" : "contained"
                  }
                  onClick={handleStartClickKcic}
                  disabled={!selectedPeserta.id || isSelected}
                  sx={{
                    color:
                      !selectedPeserta.id || isSelected ? "#00a6fb" : "#ffffff",
                    borderColor: "#00a6fb",
                    backgroundColor:
                      !selectedPeserta.id || isSelected ? "#ffffff" : "#00a6fb",
                    fontSize: "1.2rem",
                    "&:hover": {
                      borderColor: "#ffffff",
                      color: "#ffffff",
                      backgroundColor: "#00a6fb",
                    },
                  }}
                  startIcon={<Train className="text-3xl" />}
                  className="flex items-center"
                >
                  Mulai
                </Button>
              </div>
              {hoveredBox === 1 && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-center py-2">
                  <p className="text-white">
                    Mengoperasikan eksplorasi High Speed Train.
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
                style={{
                  backgroundImage: `url(${lrtPng})`,
                  backgroundColor: "#ffffff",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                onMouseEnter={() => handleMouseEnter(2)}
                onMouseLeave={handleMouseLeave}
              >
                <h1
                  className="text-white "
                  style={{
                    textShadow: "2px 2px 0px black",
                  }}
                >
                  Light Rail Transit
                </h1>
                {/* {selectedValue2} */}
                <Button
                  variant={
                    !selectedPeserta.id || isSelected ? "outlined" : "contained"
                  }
                  onClick={handleStartClick}
                  disabled={!selectedPeserta.id || isSelected}
                  sx={{
                    color:
                      !selectedPeserta.id || isSelected ? "#00a6fb" : "#ffffff",
                    borderColor: "#00a6fb",
                    backgroundColor:
                      !selectedPeserta.id || isSelected ? "#ffffff" : "#00a6fb",
                    fontSize: "1.2rem",
                    "&:hover": {
                      borderColor: "#ffffff",
                      color: "#ffffff",
                      backgroundColor: "#00a6fb",
                    },
                  }}
                  startIcon={<DirectionsRailway className="text-3xl" />}
                  className="flex items-center"
                >
                  Mulai
                </Button>
              </div>
              {hoveredBox === 2 && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-center py-2">
                  <p className="text-white">
                    Mengoperasikan eksplorasi Light Rail Transit.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Second Box  */}
        <div className="flex px-6 pt-4 pb-1 w-full">
          {/* Box 1 */}
          <div className="flex-grow flex flex-col">
            <div className="flex items-center justify-center p-2">
              <Box
                component="form"
                onSubmit={handleSubmit}
                className="flex gap-4 items-stretch"
              >
                <TextField
                  id="input-with-icon-textfield"
                  className="w-[450px]"
                  name="query"
                  placeholder="Cari Peserta untuk Eksplorasi berdasarkan NIP"
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
                >
                  Cari
                </Button>
              </Box>
            </div>
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
                    <TableCell sx={{ fontWeight: "bold", fontSize: "17px" }}>
                      Nama Peserta
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "17px" }}>
                      NIP Peserta
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
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.nip}</TableCell>
                        <TableCell align="right">
                          <div className="flex gap-2">
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
                                  backgroundColor: "#1aaffb",
                                },
                              }}
                              type="button"
                              variant={
                                detailId === row.id ? "outlined" : "text"
                              }
                              onClick={() => {
                                setDetailId(row.id), setDetailOpen(true);
                              }}
                              className="w-20 ml-2"
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
                                  backgroundColor: "#1aaffb",
                                },
                              }}
                              type="button"
                              variant={
                                selectedPeserta.nip === row.nip
                                  ? "outlined"
                                  : "text"
                              }
                              onClick={() =>
                                setSelectedPeserta((prevState) =>
                                  prevState.nip === row.nip
                                    ? { id: "", name: "", nip: "" }
                                    : {
                                        id: row.id,
                                        name: row.name,
                                        nip: row.nip,
                                      }
                                )
                              }
                              className="w-20 ml-2"
                            >
                              Pilih
                            </Button>
                          </div>
                        </TableCell>
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
            <TablePagination
              component="div"
              count={totalData}
              rowsPerPage={4}
              page={page - 1}
              onPageChange={handleChangePage}
              rowsPerPageOptions={[4]}
              className="overflow-hidden"
            />
            {/* Detail peserta */}
            <TraineeDetail
              id={detailId}
              isOpen={detailOpen}
              detail="Peserta"
              handleClose={() => {
                setDetailOpen(false);
                setDetailId("");
              }}
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
                  nip: peserta.bio === null ? "" : peserta.bio.identityNumber,
                  born: peserta.bio === null ? "" : peserta.bio.born,
                  position: peserta.bio === null ? "" : peserta.bio.position,
                });
                setNewBirthDate(
                  peserta.bio === null ? null : dayjs(peserta.bio.born)
                );
                setEditPrompt(true);
              }}
            />
          </div>
        </div>

        {/* nav */}
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
          onClick={handleLogoutOpen}
        >
          Logout
        </Button>

        {/* Edit Peserta Prompt */}
        <Dialog open={editPrompt} onClose={() => setEditPrompt(false)}>
          <DialogTitle className="min-w-[400px]">
            Edit Detail Peserta
          </DialogTitle>
          <DialogContent className="m-2 max-w-[400px]">
            <form id="edit" onSubmit={handleEditPeserta}>
              <TextField
                className="my-4"
                id="new-name"
                label="Nama"
                name="new-name"
                variant="standard"
                fullWidth
                defaultValue={detailPeserta.name}
              />
              <TextField
                className="my-4"
                id="new-email"
                label="Email"
                name="new-email"
                variant="standard"
                fullWidth
                defaultValue={detailPeserta.email}
              />
              <TextField
                className="my-4"
                id="new-nip"
                label="NIP"
                name="new-nip"
                variant="standard"
                fullWidth
                defaultValue={detailPeserta.username}
              />
              <div className="my-4 flex gap-4 items-center">
                <TextField
                  className="w-1/2"
                  id="new-position"
                  label="Kedudukan"
                  name="new-position"
                  variant="standard"
                  fullWidth
                  defaultValue={detailPeserta.position}
                />
                <DatePicker
                  className="w-1/2"
                  label="Tanggal Lahir"
                  value={newBirthDate}
                  format="DD/MM/YYYY"
                  onChange={(date) => setNewBirthDate(date)}
                />
              </div>
            </form>
          </DialogContent>
          <DialogActions className="mb-2 flex justify-between">
            <Button
              className="mx-2"
              onClick={() => setEditPrompt(false)}
              color="error"
            >
              Batal
            </Button>

            <Button
              className="mx-2"
              type="submit"
              form="edit"
              variant="contained"
              sx={{
                color: "#ffffff",
                backgroundColor: "#1aaffb",
                "&:hover": {
                  borderColor: "#00a6fb",
                  color: "#ffffff",
                },
              }}
            >
              Simpan
            </Button>
          </DialogActions>
        </Dialog>

        {/* Logout Confirmation Dialog */}
        <Dialog
          open={logoutOpen}
          onClose={handleLogoutClose}
          aria-labelledby="logout-dialog-title"
          aria-describedby="logout-dialog-description"
          className="p-6"
        >
          <DialogTitle id="logout-dialog-title">Konfirmasi Logout</DialogTitle>
          <DialogContent>
            <DialogContentText id="logout-dialog-description">
              Apakah Anda yakin ingin logout?
            </DialogContentText>
          </DialogContent>
          <DialogActions className="flex p-6 justify-between w-full">
            <Button onClick={handleLogoutClose} color="primary">
              Batal
            </Button>
            <Button
              onClick={handleConfirmLogout}
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
            >
              Logout
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}

export default AppMenu;
