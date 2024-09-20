import { useEffect, useMemo, useState } from "react";
// import "../App.css";
import { useLocation, useNavigate } from "react-router-dom";
import {PersonAdd } from "@mui/icons-material";
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
} from "@mui/material";
import Container from "@/components/Container";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import { useAuth, currentPeserta } from "../context/auth";
import {
  createUser,
  // deleteUserById,
  getUsersDatabase,
  getUserById,
  updateUserById,
} from "../services/user.services";
// import { useSettings } from "../context/settings";
import {
  useSettings as useLRTSettings,
  useSettingsKCIC as useKCICSettings,
} from "../context/settings";
import FullPageLoading from "../components/FullPageLoading";
import TraineeDetail from "../components/TraineeDetail";
import dayjs, { Dayjs } from "dayjs";
import { DatePicker } from "@mui/x-date-pickers";
import { toast } from "react-toastify";
import FirstPageIcon from '@mui/icons-material/FirstPage';

interface RowData {
  id: string;
  name: string;
  nip: string;
  complition: number;
}

function useQuery() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}

function Database() {
  const navigate = useNavigate();
  const query = useQuery(); 
  const location = useLocation();
  const fromAppMenu = location.state?.fromAppMenu || false;

  const trainType = query.get("type") as "kcic" | "lrt";
  const { logout } = useAuth();

  const { settings: LRTSettings, setSettings: setLRTSettings } =
    useLRTSettings();
  const { settingsKCIC: KCICSettings, setSettingsKCIC: setKCICSettings } =
    useKCICSettings();

  const [open, setOpen] = useState(false);
  const [selectedPeserta, setSelectedPeserta] = useState({
    id: "",
    name: "",
    nip: "",
    complition: 3,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Detail peserta
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState("");

  // Full page loading
  const [pageLoading, setPageLoading] = useState(false);

  // Register Purposes
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [nip, setNip] = useState("");
  const [code, setCode] = useState("");
  const [position, setPosition] = useState("");
  const [birthDate, setBirthDate] = useState<Dayjs | null>(null);

  const [rows, setRows] = useState<RowData[]>([]);
  const [totalData, setTotalData] = useState(0);
  const [page, setPage] = useState(1);

  const [editPrompt, setEditPrompt] = useState(false);
  const [detailPeserta, setDetailPeserta] = useState({
    username: "",
    name: "",
    email: "",
    nip: "",
    born: "",
    position: "",
    complition: 2,
  });
  const [newBirthDate, setNewBirthDate] = useState<Dayjs | null>(null);
  const [reload, setReload] = useState(false);

  // currentInstructor.isAdmin = false;
  // currentInstructor.isInstructor = false;

  const handleClose = () => {
    setOpen(false);
  };

  const handleDaftar = () => {
    setOpen(true);
  };


  const handlePrev = () => {
    if (fromAppMenu) {
        navigate(-1);
    } else {
        navigate("/ThirdPage");
    }
  };


  const handleGetLog = async () => {
    setPageLoading(true);

    try {
      navigate(`/FourthPage/UserLog?id=${detailId}`);
    } catch (e) {
      console.error(e);
    } finally {
      setPageLoading(false);
    }
  };

  const handleStart = async () => {
    setPageLoading(true);

    try {
      const userData = await getUserById(selectedPeserta.id);
      setKCICSettings({
        ...KCICSettings,
        trainee: {
          name: userData.name,
          nip: userData.username,
          bio: userData.bio,
          complition: 2,
        },
      });
      setLRTSettings({
        ...LRTSettings,
        trainee: {
          name: userData.name,
          nip: userData.username,
          bio: userData.bio,
          complition: 2,
        },
      });

      currentPeserta.id = userData.id;
      localStorage.setItem('selectedPesertaId', selectedPeserta.id);
      localStorage.setItem('selectedPesertaName', selectedPeserta.name);

      const nextPage =
        trainType === "kcic" ? "/Modul?type=kcic" : "/Modul?type=lrt";
      navigate(nextPage);
    } catch (e) {
      console.error(e);
    } finally {
      setPageLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage + 1);
  };

  const validateRegister = (): boolean => {
    return (
      nama.length >= 3 &&
      nip !== "" &&
      email.length >= 8 &&
      birthDate !== null &&
      position !== ""
    );
  };
  
  const handleNIPChange = (e: any) => {
		setNip(e.target.value);
	};

  const handleRegister = async () => {
    const isValid = validateRegister();

    if (!isValid) {
      toast.error(
        "Input registrasi tidak valid! Mohon gunakan nama dengan minimal 3 huruf, email yang valid, dan tidak mengosongkan input lain",
        {
          position: "top-center",
          autoClose: 7500,
        }
      );
      return;
    }

    const payload = {
      name: nama,
      username: nip,

      email: email,
      password: "P@ssword!23",
      bio: {
        identityNumber: nip,
        born: birthDate.format("YYYY-MM-DD"),
        position: position,
      },
    };

    try {
      setPageLoading(true);
      const res = await createUser(payload);
      setRows(
        [
          {
            id: res.id,
            name: res.name,
            nip: res.username,
            complition: 3,
          },
        ].concat(rows)
      );
      setPage(1);

      setPageLoading(false);
      setOpen(false);
      setNama("");
      setNip("");
      setEmail("");
      setCode("");
      setPosition("");
      setBirthDate(null);
      setReload(!reload);
    } catch (e) {
      const errMsg = e.response.data.errorMessage;
      console.error(errMsg);
      toast.error(
        "Email peserta sudah terdaftar di database, mohon gunakan email yang berbeda",
        { position: "top-center" }
      );
    } finally {
      setPageLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);
    setPage(1);
    setTotalData(0);

    const data = new FormData(e.currentTarget);
    const query = data.get("query") as string;

    try {
      const res = await getUsersDatabase(1, 5, query);
      const resRows = res.results.map((data: any) => ({
        id: data.id,
        name: data.name,
        nip: data.username,
        complition: 3,
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
      const res = await updateUserById(selectedPeserta.id, payload);

      setEditPrompt(false);
      toast.success("Data peserta berhasil diubah", { position: "top-center" });
    } catch (e) {
      const errMsg = e.response.data.errorMessage;
      toast.error(errMsg, { position: "top-center" });
    }
  };

  useEffect(() => {
    async function getRows(page: number) {
      try {
        setIsLoading(true);
        const res = await getUsersDatabase(page, 5);
        const resRows = res.results.map((data: any) => ({
          id: data.id,
          name: data.name,
          nip: data.username,
          complition: 3,
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

  return (
    <>
      <Container w={1200} h={710}>
        <div className="p-6 flex flex-wrap">
          {/* Judul */}
          <h1
            className="w-full text-center my-4"
            style={{ fontSize: "1.75rem", fontWeight: "bold" }}
          >
            List Peserta
            {/* Setting Simulasi */}
          </h1>

          {/* Tabel */}
          <div className="flex flex-col h-full w-full gap-1">
            {/* Search bar */}
            <Box
              component="form"
              onSubmit={handleSubmit}
              className="flex gap-4 w-full mb-3"
            >
              <Button
                type="button"
                variant="contained"
                className="h-[56px]"
                onClick={() => handleDaftar()}
                startIcon={<PersonAdd />}
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
                Daftar Baru
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
                className="w-20 h-[56px]"
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
            <TableContainer className="" component={Paper}>
              <Table stickyHeader aria-label="Tabel Peserta">
                <colgroup>
                  <col width="50%" />
                  <col width="20%" />
                  {
                    !fromAppMenu ? 
                    <col width="20%" /> : <col width="10%" />
                  }
                </colgroup>
                <TableHead>
                  <TableRow>
                    <TableCell>Nama</TableCell>
                    <TableCell>NIP</TableCell>
                    {/* <TableCell>Complition</TableCell> */}
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
                              type="button"
                              variant={detailId === row.id ? "outlined" : "text"}
                              onClick={() => {
                                setDetailId(row.id), setDetailOpen(true);
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
                              className="w-20 ml-2"
                            >
                              Detail
                            </Button>
                            {!fromAppMenu && (<Button
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
                              variant={selectedPeserta.nip === row.nip ? "outlined" : "text"}
                              onClick={() =>
                                setSelectedPeserta({
                                  id: row.id,
                                  name: row.name,
                                  nip: row.nip,
                                  complition: row.complition,
                                })
                              }
                              className="w-20 ml-2"
                            >
                              Pilih
                            </Button>)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                ) : (
                  <p className="absolute w-full top-1/3 left-0 flex justify-center">
                    Data user tidak ditemukan
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
          </div>

          {/* pop up registrasi */}
          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Daftar Peserta Baru</DialogTitle>
            <DialogContent className="w-[400px]">
              <DialogContentText>Pendaftaran kandidat</DialogContentText>
              <TextField
                autoFocus
                margin="normal"
                id="nama"
                label="Nama"
                type="text"
                fullWidth
                variant="standard"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
              />
              <TextField
                margin="normal"
                id="email"
                label="E-Mail"
                type="email"
                fullWidth
                variant="standard"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                margin="normal"
                id="nip"
                label="NIP"
                type="number"
                fullWidth
                variant="standard"
                value={nip}
                onChange={handleNIPChange}
              />
              <div className="flex gap-4 items-center">
                <TextField
                  className="w-1/2"
                  margin="normal"
                  id="position"
                  label="Kedudukan"
                  type="text"
                  variant="standard"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                />
                <DatePicker
                  className="w-1/2"
                  label="Tanggal Lahir"
                  value={birthDate}
                  format="DD/MM/YYYY"
                  onChange={(newValue) => setBirthDate(newValue)}
                />
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="error">
                Kembali
              </Button>
              <Button onClick={handleRegister}>Tambah</Button>
            </DialogActions>
          </Dialog>

          {/* Detail peserta */}
          <TraineeDetail
            id={detailId}
            isOpen={detailOpen}
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
                complition: 3,
              });
              setNewBirthDate(
                peserta.bio === null ? null : dayjs(peserta.bio.born)
              );
              setEditPrompt(true);
            }}
          />
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
                    // defaultValue={dayjs(detailPeserta.born)}
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
        </div>
        {/* nav */}
        <div className="flex gap-4 justify-between px-6 pb-6 w-full">
          <div className="w-1/2 flex justify-between items-end">
            {!fromAppMenu && (
              <div className="flex space-x-2"> {/* Container for buttons when not fromAppMenu */}
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
                  onClick={() => {
                    navigate("/SecondPage");
                  }}
                >
                  <FirstPageIcon className="mr-2 ml-[-2px] text-xl text-opacity-80" />
                  Kembali ke Menu
                </Button>
                <Button
                  type="button"
                  color="error"
                  variant="outlined"
                  className="text-base absolute bottom-6 left-[235px]"
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
              </div>
            )}
            {fromAppMenu && (
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
                onClick={() => {
                  handlePrev();
                }}
              >
                Kembali
              </Button>
            )}
          </div>
          <div className="w-1/2 flex items-center justify-end">
            {!fromAppMenu && selectedPeserta.nip !== "" && (
              <Button
                type="button"
                variant="outlined"
                className="text-base absolute bottom-6 right-6"
                onClick={() => handleStart()}
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
                Lanjut ({selectedPeserta.name}) {trainType}
              </Button>
            )}
          </div>
        </div>
        <FullPageLoading loading={pageLoading} />
      </Container>
    </>
  );
}

export default Database;
