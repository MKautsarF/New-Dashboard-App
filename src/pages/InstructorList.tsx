import {
  Delete,
  LockReset,
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
} from "@mui/material";
import React, { useEffect, useState, useRef } from "react";
import Logo from "@/components/Logo";
import { useNavigate, useLocation } from "react-router-dom";
import { useMemo } from "react";
import Container from "@/components/Container";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import { useAuth, currentPeserta, currentInstructor } from "@/context/auth";
import {
  createUserAsAdmin,
  deactivateUserById,
  getInstructorList,
  getUserByIdAsAdmin,
  updateUserByIdAsAdmin,
  updateUserPasswordById,
} from "@/services/user.services";
import { useSettings } from "@/context/settings";
import FullPageLoading from "@/components/FullPageLoading";
import TraineeDetail from "@/components/TraineeDetail";
import dayjs, { Dayjs } from "dayjs";
import { DatePicker } from "@mui/x-date-pickers";
import { toast } from "react-toastify";
import { PasswordDialog } from "@/components/PasswordDIalog";

interface RowData {
  id: string;
  name: string;
  nip: string;
}

function useQuery() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}


const InstructorList = () => {
  const navigate = useNavigate();

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

  const [rows, setRows] = useState<RowData[]>([]);
  const [totalData, setTotalData] = useState(0);
  const [page, setPage] = useState(1);

  const [deletePrompt, setDeletePrompt] = useState(false);
  const [passwordPrompt, setPasswordPrompt] = useState(false);
  const [reload, setReload] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
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
  const [nameError, setNameError] = useState(false);
  const [nipError, setNipError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const query = useQuery();


  const handleClose = () => {
    setOpen(false);
  };

  const handleDaftar = () => {
    setOpen(true);
  };

  const handleKembali = () => {
    navigate("/admin");
  };

  const handleHapusUser = async () => {
    setIsLoading(true);

    try {
      const res = await deactivateUserById(selectedPeserta.id);

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

      currentPeserta.id = userData.id;
    } catch (e) {
      console.error(e);
    } finally {
      setPageLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage + 1);
  };

  const handleNIPChange = (e: any) => {
    const inputValue = e.target.value;

    if (inputValue.length > 32) {
      setNipError(true);
      setNip(inputValue.slice(0, 32));
    } else {
      setNipError(false);
      setNip(inputValue);  
    }
	};

  const handleNameChange = (e: any) => {
    const inputValue = e.target.value;

    if (inputValue.length > 48) {
      setNameError(true);
      setNama(inputValue.slice(0, 48));
    } else {
      setNameError(false);
      setNama(inputValue);
    }
  };

  const handlePasswordChange = (e: any) => {
    const inputValue = e.target.value;

    if (inputValue.length > 32) {
      setPasswordError(true);
      setPassword(inputValue.slice(0, 32));
    } else {
      setPasswordError(false);
      setPassword(inputValue);  
    }
	};

  const validateRegister = (): boolean => {
    return (
      nama !== "" &&
      email !== "" &&
      nip !== "" &&
      username !== "" &&
      password !== "" &&
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

      console.log("res", res)
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
        <TableContainer className="mt-5" component={Paper}>
          <Table stickyHeader aria-label="Tabel Peserta" sx={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col width="45%" />
              <col width="30%" />
              <col width="25%" />
            </colgroup>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', fontSize: "17px" }}>Nama Asesor</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: "17px" }}>NIP Asesor</TableCell>
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

                            size="small"
                            onClick={() => {
                              setSelectedPeserta({
                                id: row.id,
                                name: row.name,
                                nip: row.nip,
                              });
                              setPasswordPrompt(true);
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
                              // setReload(!reload); 
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
            onChange={handleNameChange}
            error={nameError}
            helperText={nameError ? "Nama maksimal berisi 48 karakter" : ""}
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
            error={nipError}
            helperText={nipError ? "NIP maksimal berisi 32 karakter" : ""}
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
              onChange={handlePasswordChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              error={passwordError}
              helperText={passwordError ? "Password maksimal berisi 32 karakter" : ""}
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
            color="primary"
          >
            Tidak
          </Button>
          <Button
            className="mx-2"
            onClick={() => handleHapusUser()}
            variant="contained"
            color="error"
          >
            Hapus
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Ubah Password */}
      {selectedPeserta && (
        <PasswordDialog
          passwordPrompt={passwordPrompt}
          setPasswordPrompt={setPasswordPrompt}
          selectedPeserta={selectedPeserta}
          handleSubmitPassword={handleSubmitPassword}
        />
      )}

      {/* Edit Peserta Prompt */}
      <Dialog open={editPrompt} onClose={() => setEditPrompt(false)} className="p-6">
        <DialogTitle className="min-w-[400px]">Edit Detail Asesor</DialogTitle>
        <DialogContent className="max-w-[400px]">
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
        <DialogActions className="mb-2 flex justify-between px-6">
          <Button
            onClick={() => setEditPrompt(false)}
            color="error"
          >
            Batal
          </Button>

          <Button
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
