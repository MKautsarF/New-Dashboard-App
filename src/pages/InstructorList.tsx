import {
  Add,
  Delete,
  LockReset,
  NavigateBefore,
  PersonAdd,
  Info,
  VisibilityOff,
  Visibility,
  EditNote,
} from "@mui/icons-material";
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
  Snackbar,
  Alert,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import { useNavigate } from "react-router-dom";
import Container from "@/components/Container";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import { useAuth, currentPeserta, currentInstructor } from "@/context/auth";
import {
  createUserAsAdmin,
  deactivateUserById,
  getInstructorList,
  getUserByIdAsAdmin,
  getUsersAsAdmin,
  updateUserByIdAsAdmin,
  updateUserPasswordById,
} from "@/services/user.services";
import { useSettings } from "@/context/settings";
import FullPageLoading from "@/components/FullPageLoading";
import TraineeDetail from "@/components/TraineeDetail";
import dayjs, { Dayjs } from "dayjs";
import { DatePicker } from "@mui/x-date-pickers";
import { toast } from "react-toastify";
import { getSubmissionList } from "@/services/submission.services";

interface RowData {
  id: string;
  name: string;
  nip: string;
}

const InstructorList = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { settings, setSettings } = useSettings();

  const [open, setOpen] = useState(false);
  const [selectedPeserta, setSelectedPeserta] = useState({
    id: "",
    name: "",
    nip: "",
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
  const [username, setUsername] = useState("");

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");

  const [position, setPosition] = useState("");
  const [birthDate, setBirthDate] = useState<Dayjs | null>(null);

  const [rows, setRows] = useState<RowData[]>([
    // Local testing purposes
    // {
    //   id: "123",
    //   name: "Dummy user",
    //   nip: "123456",
    // },
  ]);
  const [totalData, setTotalData] = useState(0);
  const [page, setPage] = useState(1);

  const [deletePrompt, setDeletePrompt] = useState(false);
  const [passwordPrompt, setPasswordPrompt] = useState(false);
  const [reload, setReload] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  // const [inputError, setInputError] = useState(false);
  // const [errorMsg, setErrorMsg] = useState('');

  const [editPrompt, setEditPrompt] = useState(false);
  const [detailPeserta, setDetailPeserta] = useState({
    username: "",
    name: "",
    email: "",
    nip: "",
    born: "",
    position: "",
  });
  const [newBirthDate, setNewBirthDate] = useState<Dayjs | null>(null);

  currentInstructor.isAdmin = true;
  // console.log(currentInstructor.isAdmin);
  currentInstructor.isInstructor = true;

  const handleClose = () => {
    setOpen(false);
  };

  const handleDaftar = () => {
    setOpen(true);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleKembali = () => {
    navigate("/admin");
  };

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

  const handleHapusUser = async () => {
    setIsLoading(true);

    try {
      const res = await deactivateUserById(selectedPeserta.id);
      // console.log("deactivated user: " + res.id);

      setRows(rows.filter((row) => row.id !== res.id));
      setReload(!reload);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      setDeletePrompt(false);
    }
  };

  const handleGetUserDetail = async () => {
    setPageLoading(true);

    try {
      const userData = await getUserByIdAsAdmin(selectedPeserta.id);

      currentPeserta.id = userData.id; // owner id for use in submission
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
      nama !== "" &&
      email !== "" &&
      nip !== "" &&
      username !== "" &&
      password !== "" &&
      // code !== '' &&
      birthDate !== null &&
      position !== ""
    );
  };

  const handleRegister = async () => {
    const isValid = validateRegister();

    if (!isValid) {
      toast.error("Input registrasi tidak boleh kosong!", {
        position: "top-center",
      });
      return;
    }

    const payload = {
      name: nama,
      username: username,
      email: email,
      scope: "instructor",
      password: password,
      bio: {
        identityNumber: nip,
        born: birthDate.format("YYYY-MM-DD"),
        position: position,
      },
    };

    try {
      setPageLoading(true);
      const res = await createUserAsAdmin(payload);
      setRows(
        [
          {
            id: res.id,
            name: res.name,
            nip: res.bio.identityNumber,
          },
        ].concat(rows)
      );
      setPage(1);

      setPageLoading(false);
      setOpen(false);
      setNama("");
      setNip("");
      setUsername("");
      setEmail("");
      setPassword("");
      setCode("");
      setPosition("");
      setBirthDate(null);
    } catch (e) {
      const errMsg = e.response.data.errorMessage;
      console.error(e);
      toast.error(
        "Username/Email sudah terdaftar di database, mohon gunakan inputan yang berbeda",
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
      const res = await getInstructorList(1, 5, query);

      const resRows: RowData[] = [];
      for (let entry of res.results) {
        const user = await getUserByIdAsAdmin(entry.id);
        const row: RowData = {
          id: user.id,
          name: user.name,
          nip: user.bio === null ? "" : user.bio.identityNumber,
        };
        // console.log(row);
        resRows.push(row);
      }

      setRows(resRows);
      setTotalData(res.total);
    } catch (e) {
      console.error(e);
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Get form data based on input names
    // const username = formData.get('username') as string;
    const password = formData.get("password") as string;

    if (password === "") {
      // setInputError(true);
      // setOpen(true);
      toast.error("Input password tidak boleh kosong!", {
        position: "top-center",
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await updateUserPasswordById(selectedPeserta.id, password);

      setIsLoading(false);
      setPasswordPrompt(false);
      console.log("Berhasil mengubah password");
      toast.success("Berhasil mengubah password", {
        position: "top-center",
      });
    } catch (e) {
      const errMsg = e.response.data.errorMessage;
      console.error(e);
      // setOpen(true);
      // setErrorMsg(errMsg);
      toast.error("Gagal mengubah password, ada masalah dari server", {
        position: "top-center",
      });
    }
  };

  const handleEditAsesor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const newName = formData.get("new-name") as string;
    const newUsername = formData.get("new-username") as string;
    const newEmail = formData.get("new-email") as string;
    const newNIP = formData.get("new-nip") as string;
    const newPosition = formData.get("new-position") as string;

    const payload = {
      name: newName,
      username: newUsername,
      email: newEmail,
      bio: {
        identityNumber: newNIP,
        born: newBirthDate.format("YYYY-MM-DD"),
        position: newPosition,
      },
    };

    console.log("payload edit:", payload)

    try {
      const res = await updateUserByIdAsAdmin(selectedPeserta.id, payload);

      setEditPrompt(false);
      toast.success("Data peserta berhasil diubah", { position: "top-center" });
      setReload(!reload);
    } catch (e) {
      const errMsg = e.response.data.errorMessage;
      toast.error(errMsg, { position: "top-center" });
    }
  };

  useEffect(() => {
    async function getRows(page: number) {
      try {
        setIsLoading(true);
        const res = await getInstructorList(page, 5);
        // console.log('tes', res.results)

        const resRows: RowData[] = [];
        for (let entry of res.results) {
          const row: RowData = {
            id: entry.id,
            name: entry.name,
            nip: entry.bio.identityNumber? entry.bio.identityNumber : " ", 
          };
          // console.log("row", row);

          resRows.push(row);
        }

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
    <Container w={1000} h={700}>

      <div className="flex flex-col p-6 h-full gap-4">
        {/* Search bar */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          className="flex gap-4 w-full "
        >
          <Button
            type="button"
            variant="contained"
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
        <TableContainer className="mb-8" component={Paper}>
          <Table stickyHeader aria-label="Tabel Peserta">
            <colgroup>
              <col width="45%" />
              <col width="30%" />
              <col width="25%" />
            </colgroup>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', fontSize: "17px" }}>Nama</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: "17px" }}>NIP</TableCell>
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
                      <div className="flex gap-4 justify-end">
                        <Tooltip title="Detail User" placement="top">
                          <IconButton
                            // color="primary"
                            size="small"
                            onClick={() => {
                              setDetailId(row.id), setDetailOpen(true);
                              setSelectedPeserta({
                                id: row.id,
                                name: row.name,
                                nip: row.nip,
                              });
                              handleGetUserDetail();
                            }}
                          >
                            <Info />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit User" placement="top">
                          <IconButton
                            // color="primary"
                            size="small"
                            onClick={async () => {
                              setSelectedPeserta({
                                id: row.id,
                                name: row.name,
                                nip: row.nip,
                              });

                              const peserta = await getUserByIdAsAdmin(row.id);
                              console.log("Peserta edit:", peserta)
                              setDetailPeserta({
                                username: peserta.username,
                                name: peserta.name,
                                email: peserta.email,
                                nip:
                                  peserta.bio === null
                                    ? ""
                                    : peserta.bio.identityNumber,
                                born:
                                  peserta.bio === null ? "" : peserta.bio.born,
                                position:
                                  peserta.bio === null
                                    ? ""
                                    : peserta.bio.position,
                              });
                              setNewBirthDate(
                                peserta.bio === null
                                  ? null
                                  : dayjs(peserta.bio.born)
                              );

                              setEditPrompt(true);

                              console.log(row.name);
                            }}
                          >
                            <EditNote />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Ubah Password" placement="top">
                          <IconButton
                            // color="primary"
                            size="small"
                            onClick={() => {
                              setSelectedPeserta({
                                id: row.id,
                                name: row.name,
                                nip: row.nip,
                              });
                              setPasswordPrompt(true);

                              console.log(row.name);
                            }}
                          >
                            <LockReset />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Hapus User" placement="top">
                          <IconButton
                            // color="error"
                            size="small"
                            onClick={() => {
                              setSelectedPeserta({
                                id: row.id,
                                name: row.name,
                                nip: row.nip,
                              });
                              setDeletePrompt(true);
                              setReload(!reload); 
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
        <DialogTitle>Daftar Asesor Baru</DialogTitle>
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
            type="text"
            fullWidth
            variant="standard"
            value={nip}
            onChange={(e) => setNip(e.target.value)}
          />
          <div className="flex gap-4">
            <TextField
              className="w-1/2"
              margin="normal"
              id="username"
              label="Username"
              type="text"
              variant="standard"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              className="w-1/2"
              margin="normal"
              id="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="standard"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>
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
        handleClose={() => setDetailOpen(false)}
        handleLog={() => {}}
        handleEdit={() => {}}
      />

      {/* Delete User prompt */}
      <Dialog open={deletePrompt} onClose={() => setDeletePrompt(false)}>
        <DialogContent className="min-w-[260px]">
          Hapus User: <b>{selectedPeserta.name}</b> ?
        </DialogContent>
        <DialogActions className="flex mb-2 justify-between">
          <Button
            className="mx-2"
            onClick={() => setDeletePrompt(false)}
            color="error"
          >
            Tidak
          </Button>
          <Button
            className="mx-2"
            onClick={() => handleHapusUser()}
            variant="contained"
          >
            Ya
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password prompt */}
      <Dialog open={passwordPrompt} onClose={() => setPasswordPrompt(false)}>
        <DialogTitle className="min-w-[360px]">Ubah Password</DialogTitle>
        <DialogContent className="m-2 justify-center max-w-[360px]">
          <DialogContentText className="mb-4">
            {selectedPeserta.name}
          </DialogContentText>
          <form id="new-password" onSubmit={handleSubmitPassword}>
            <TextField
              label="Password baru"
              name="password"
              variant="standard"
              fullWidth
              type={showPassword ? "text" : "password"}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </form>
        </DialogContent>
        <DialogActions className="mb-2 flex justify-between">
          <Button
            className="mx-2"
            onClick={() => setPasswordPrompt(false)}
            color="error"
          >
            Batal
          </Button>

          <Button
            className="mx-2"
            type="submit"
            form="new-password"
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

      {/* Edit Peserta Prompt */}
      <Dialog open={editPrompt} onClose={() => setEditPrompt(false)}>
        <DialogTitle className="min-w-[400px]">Edit Detail Asesor</DialogTitle>
        <DialogContent className="m-2 max-w-[400px]">
          <form id="edit" onSubmit={handleEditAsesor}>
            <TextField
              className="my-4"
              id="new-name"
              label="Nama"
              name="new-name"
              variant="standard"
              fullWidth
              defaultValue={selectedPeserta.name}
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
              defaultValue={selectedPeserta.nip}
            />
            <TextField
              className="my-4"
              id="new-username"
              label="Username"
              name="new-username"
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

      <FullPageLoading loading={pageLoading} />
    </Container>
  );
};

export default InstructorList;
