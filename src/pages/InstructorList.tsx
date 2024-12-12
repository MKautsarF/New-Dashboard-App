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
  username: string;
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
  const [instansi, setInstansi] = useState("");

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
  const [usernameError, setUsernameError] = useState(false);
  const [positionError, setPositionError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [instansiError, setInstansiError] = useState(false);
  const [nipError, setNipError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [newNameError, setNewNameError] = useState(false);
  const [newUsernameError, setNewUsernameError] = useState(false);
  const [newPositionError, setNewPositionError] = useState(false);
  const [newEmailError, setNewEmailError] = useState(false);
  const [newInstansiError, setNewInstansiError] = useState(false);
  const [newNipError, setNewNipError] = useState(false);

  const query = useQuery();

  const handleClose = () => {
    setOpen(false);
    setNameError(false);
    setEmailError(false);
    setInstansiError(false);
    setNipError(false);
    setUsernameError(false);
    setPasswordError(false);
    setPositionError(false);
  };

  const handleCloseEditPrompt = () => {
    setEditPrompt(false);
    setNewNameError(false);
    setNewEmailError(false);
    setNewInstansiError(false);
    setNewNipError(false);
    setNewUsernameError(false);
    setNewPositionError(false);
  };

  const handleDaftar = () => {
    setNama("");
    setEmail("");
    setInstansi("");
    setNip("");
    setUsername("");
    setPassword("");
    setPosition("");
    setBirthDate(null);
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
      toast.success("Instruktur berhasil dihapus", { position: "top-center" });
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

  useEffect(() => {
    setNama(selectedPeserta.name || "");
    setEmail(detailPeserta.email || "");
    setNip(selectedPeserta.nip || "");
    setUsername(detailPeserta.username || "");
    setPosition(detailPeserta.position || "");
  }, [editPrompt]);

  const handleNIPChange = (e: any, isEditing = false) => {
    const inputValue = e.target.value;

    if (inputValue.length > 32) {
      if (isEditing) {
        setNewNipError(true);
      } else {
        setNipError(true);
      }
      setNip(inputValue.slice(0, 32));
    } else {
      if (isEditing) {
        setNewNipError(false);
      } else {
        setNipError(false);
      }
      setNip(inputValue);
    }
  };

  const handleEmailChange = (e: any, isEditing = false) => {
    const inputValue = e.target.value;

    if (inputValue.length > 72 || inputValue.length < 8) {
      if (isEditing) {
        setNewEmailError(true);
      } else {
        setEmailError(true);
      }
      setEmail(inputValue.slice(0, 72));
    } else {
      if (isEditing) {
        setNewEmailError(false);
      } else {
        setEmailError(false);
      }
      setEmail(inputValue);
    }
  };

  const handleInstansiChange = (e: any, isEditing = false) => {
    const inputValue = e.target.value;

    if (inputValue.length > 72 || inputValue.length < 8) {
      if (isEditing) {
        setNewInstansiError(true);
      } else {
        setInstansiError(true);
      }
      setInstansi(inputValue.slice(0, 72));
    } else {
      if (isEditing) {
        setNewInstansiError(false);
      } else {
        setInstansiError(false);
      }
      setEmail(inputValue);
      setInstansi(inputValue);
    }
  };

  const handleNameChange = (e: any, isEditing = false) => {
    const inputValue = e.target.value;

    if (inputValue.length > 48 || inputValue.length < 3) {
      if (isEditing) {
        setNewNameError(true);
      } else {
        setNameError(true);
      }
      setNama(inputValue.slice(0, 48));
    } else {
      if (isEditing) {
        setNewNameError(false);
      } else {
        setNameError(false);
      }
      setNama(inputValue);
    }
  };

  const handleUsernameChange = (e: any, isEditing = false) => {
    const inputValue = e.target.value;

    if (inputValue.length > 32) {
      if (isEditing) {
        setNewUsernameError(true);
      } else {
        setUsernameError(true);
      }
      setUsername(inputValue.slice(0, 32));
    } else {
      if (isEditing) {
        setNewUsernameError(false);
      } else {
        setUsernameError(false);
      }
      setUsername(inputValue);
    }
  };

  const handlePasswordChange = (e: any, isEditing = false) => {
    const inputValue = e.target.value;

    if (inputValue.length > 32) {
      setPasswordError(true);
      setPassword(inputValue.slice(0, 32));
    } else {
      setPasswordError(false);
      setPassword(inputValue);
    }
  };

  const handlePositionChange = (e: any, isEditing = false) => {
    const inputValue = e.target.value;

    if (inputValue.length > 48) {
      if (isEditing) {
        setNewPositionError(true);
      } else {
        setPositionError(true);
      }
      setPosition(inputValue.slice(0, 48));
    } else {
      if (isEditing) {
        setNewPositionError(false);
      } else {
        setPositionError(false);
      }
      setPosition(inputValue);
    }
  };

  const validateRegister = (): boolean => {
    return (
      nama !== "" &&
      // email !== "" &&
      instansi !== "" &&
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
      // email: email,
      email: instansi,
      scope: "instructor",
      password: password,
      bio: {
        identityNumber: nip,
        born: birthDate.format("YYYY-MM-DD"),
        position: position,
      },
    };
    // console.log("masuk");

    try {
      setPageLoading(true);
      console.log("masuk");
      const res = await createUserAsAdmin(payload);
      console.log("masuk 2");

      console.log("res", res);
      setRows(
        [
          {
            id: res.id,
            name: res.name,
            nip: res.bio.identityNumber,
            username: res.username,
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
          username: user.username,
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
    // const newEmail = formData.get("new-email") as string;
    const newInstansi = formData.get("new-instansi") as string;
    const newNIP = formData.get("new-nip") as string;
    const newPosition = formData.get("new-position") as string;

    const payload = {
      name: newName,
      username: newUsername,
      email: newInstansi,
      bio: {
        identityNumber: newNIP,
        born: newBirthDate.format("YYYY-MM-DD"),
        position: newPosition,
      },
    };

    console.log("payload edit:", payload);

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

  // useEffect(() => {
  //   async function getRows(page: number) {
  //     try {
  //       setIsLoading(true);
  //       const res = await getInstructorList(page, 5);
  //       console.log('tes', res.results);
  //       // console.log('cek isi ', res.results[0].bio);

  //       const resRows: RowData[] = [];
  //       // console.log('tes 2', resRows);
  //       let count = 0;
  //       for (let entry of res.results) {
  //         const row: RowData = {
  //           id: entry.id,
  //           name: entry.name,
  //           nip: res.results[count].bio.identityNumber? entry.bio.identityNumber : " ",
  //           // nip: "test",
  //           username: entry.username,
  //         };
  //         // console.log("row", row);
  //         count++;
  //         resRows.push(row);
  //       }

  //       setRows(resRows);
  //       setTotalData(res.total);
  //     } catch (e) {
  //       console.error(e);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   }

  //   getRows(page);
  // }, [page, reload]);

  useEffect(() => {
    async function getRows(page: number) {
      try {
        setIsLoading(true);
        const res = await getInstructorList(page, 5);
        console.log("tes", res.results);

        const resRows: RowData[] = [];
        let count = 0;

        for (let entry of res.results) {
          if (entry.bio && entry.bio.identityNumber !== null) {
            const row: RowData = {
              id: entry.id,
              name: entry.name,
              nip: entry.bio.identityNumber,
              username: entry.username,
            };
            resRows.push(row);
          }
          count++;
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
          <Table
            stickyHeader
            aria-label="Tabel Peserta"
            sx={{ tableLayout: "fixed" }}
          >
            <colgroup>
              <col width="30%" />
              <col width="20%" />
              <col width="25%" />
              <col width="25%" />
            </colgroup>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", fontSize: "17px" }}>
                  Nama Instruktur
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", fontSize: "17px" }}>
                  NIP Instruktur
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", fontSize: "17px" }}>
                  Username Instruktur
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
                    <TableCell>{row.username}</TableCell>
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
                              console.log("Peserta edit:", peserta);
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
        <DialogTitle>Daftar Instruktur Baru</DialogTitle>
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
            // onChange={handleNameChange}
            onChange={(e) => handleNameChange(e, false)}
            error={nameError}
            helperText={
              nameError
                ? "Nama harus berisi setidaknya 8 karakter dan maksimal berisi 48 karakter"
                : ""
            }
          />
          <TextField
            margin="normal"
            id="instansi"
            label="Instansi"
            type="instansi"
            fullWidth
            variant="standard"
            value={instansi}
            // onChange={(e) => handleEmailChange(e, false)}
            onChange={(e) => handleInstansiChange(e, false)}
            error={newInstansiError}
            helperText={
              newInstansiError
                ? "Instansi harus berisi setidaknya 8 karakter dan maksimal berisi 72 karakter"
                : ""
            }
          />
          <TextField
            margin="normal"
            id="nip"
            label="NIP"
            type="number"
            fullWidth
            variant="standard"
            value={nip}
            onChange={(e) => handleNIPChange(e, false)}
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
              // onChange={(e) => setUsername(e.target.value)}
              onChange={(e) => handleUsernameChange(e, false)}
              error={usernameError}
              helperText={
                usernameError ? "Username maksimal berisi 32 karakter" : ""
              }
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
              helperText={
                passwordError ? "Password maksimal berisi 32 karakter" : ""
              }
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
              // onChange={(e) => setPosition(e.target.value)}
              onChange={(e) => handlePositionChange(e, false)}
              error={positionError}
              helperText={
                positionError ? "Kedudukan maksimal berisi 48 karakter" : ""
              }
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
        detail="Instruktur"
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
      <Dialog open={editPrompt} onClose={handleCloseEditPrompt} className="p-6">
        <DialogTitle className="min-w-[400px]">
          Edit Detail Instruktur
        </DialogTitle>
        <DialogContent className="max-w-[400px]">
          <form id="edit" onSubmit={handleEditAsesor}>
            <TextField
              className="my-4"
              id="new-name"
              label="Nama"
              name="new-name"
              variant="standard"
              fullWidth
              // defaultValue={selectedPeserta.name}
              value={nama}
              onChange={(e) => handleNameChange(e, true)}
              error={newNameError}
              helperText={
                newNameError
                  ? "Nama baru harus berisi setidaknya 3 karakter dan maksimal berisi 48 karakter"
                  : ""
              }
            />
            {/* <TextField
              className="my-4"
              id="new-email"
              label="Email"
              name="new-email"
              variant="standard"
              fullWidth
              // defaultValue={detailPeserta.email}
              value={email}
              onChange={(e) => handleEmailChange(e, true)}
              error={newEmailError}
              helperText={
                newEmailError
                  ? "Email baru harus berisi setidaknya 8 karakter dan maksimal berisi 72 karakter"
                  : ""
              }
            /> */}
            <TextField
              className="my-4"
              id="new-instansi"
              label="Instansi"
              name="new-instansi"
              variant="standard"
              fullWidth
              // defaultValue={detailPeserta.email}
              value={email}
              onChange={(e) => handleInstansiChange(e, true)}
              // onChange={(e) => handleEmailChange(e, true)}
              error={newInstansiError}
              helperText={
                newInstansiError
                  ? "Instansi baru harus berisi setidaknya 3 karakter dan maksimal berisi 72 karakter"
                  : ""
              }
            />
            <TextField
              className="my-4"
              id="new-nip"
              label="NIP"
              name="new-nip"
              variant="standard"
              type="number"
              fullWidth
              // defaultValue={selectedPeserta.nip}
              value={nip}
              onChange={(e) => handleNIPChange(e, true)}
              error={newNipError}
              helperText={
                newNipError ? "NIP baru maksimal berisi 32 karakter" : ""
              }
            />
            <TextField
              className="my-4"
              id="new-username"
              label="Username"
              name="new-username"
              variant="standard"
              fullWidth
              // defaultValue={detailPeserta.username}
              value={username}
              onChange={(e) => handleUsernameChange(e, true)}
              error={newUsernameError}
              helperText={
                newUsernameError
                  ? "Username baru maksimal berisi 32 karakter"
                  : ""
              }
            />
            <div className="my-4 flex gap-4 items-center">
              <TextField
                className="w-1/2"
                id="new-position"
                label="Kedudukan"
                name="new-position"
                variant="standard"
                fullWidth
                // defaultValue={detailPeserta.position}
                value={position}
                onChange={(e) => handlePositionChange(e, true)}
                error={newPositionError}
                helperText={
                  newPositionError
                    ? "Kedudukan baru maksimal berisi 48 karakter"
                    : ""
                }
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
          <Button onClick={handleCloseEditPrompt} color="error">
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
