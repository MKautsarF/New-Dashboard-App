import {
  Add,
  Delete,
  EditNote,
  Info,
  NavigateBefore,
  PersonAdd,
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
  Tooltip,
  IconButton,
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
  getUserById,
  getUserByIdAsAdmin,
  getUsersAsAdmin,
  updateUserByIdAsAdmin,
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

const TraineeList = () => {
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

  const [deletePrompt, setDeletePrompt] = useState(false);
  const [reload, setReload] = useState(false);

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

  const handleHapusUser = async () => {
    setIsLoading(true);
    setReload(true);
    try {
      const res = await deactivateUserById(selectedPeserta.id);
      // console.log("deactivated user: " + res.id);

      setRows(rows.filter((row) => row.id !== res.id));
    } catch (e) {
      console.error(e);
      toast.error("Peserta tidak dapat dihapus karena sudah memiliki submisi", {
        position: "top-center",
      });
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

  const validateRegister = (): boolean => {
    return (
      nama !== "" &&
      nip !== "" &&
      email !== "" &&
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
      username: nip,
      email: email,
      scope: "trainee",
      password: "P@ssword!23",
      bio: {
        officialCode: nip,
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
            nip: res.username,
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
      setReload(true);
    } catch (e) {
      const errMsg = e.response.data.errorMessage;
      console.error(e);
      toast.error(
        "Terjadi kesalahan, silahkan coba dengan email/NIP yang berbeda",
        {
          position: "top-center",
        }
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
      const res = await getUsersAsAdmin(1, 6, query);
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

  const handleGetLog = async () => {
    setPageLoading(true);

    try {
      console.log("detailId", detailId);
      navigate(`/FourthPage/UserLogAdmin?id=${detailId}`);
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
        officialCode: newNIP,
        born: newBirthDate.format("YYYY-MM-DD"),
        position: newPosition,
      },
    };

    try {
      // const res = await updateUserByIdAsAdmin(selectedPeserta.id, payload);
      const res = await updateUserByIdAsAdmin(detailId, payload);

      setEditPrompt(false);
      toast.success("Data peserta berhasil diubah", { position: "top-center" });
      setReload(true);
      setDetailId("");
    } catch (e) {
      const errMsg = e.response.data.errorMessage;
      toast.error(errMsg, { position: "top-center" });
    }
  };

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState("");

  useEffect(() => {
    async function getRows(page: number) {
      try {
        setIsLoading(true);
        const res = await getUsersAsAdmin(page, 6);
        // console.log('API Response:', res);

        const resRows = res.results.map((data: any) => ({
          id: data.id,
          name: data.name,
          nip: data.username,
        }));
        setRows(resRows);
        console.log("resRows", resRows);
        setTotalData(res.total);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
        setReload(false);
      }
    }

    getRows(page);
  }, [page, reload]);

  useEffect(() => {
    console.log("detailId", detailId);
  }, [detailId]);

  return (
    <Container w={1000} h={700}>
      <div className="flex flex-col p-6 h-full">
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
          <Table stickyHeader aria-label="Tabel Peserta">
            <colgroup>
              <col width="45%" />
              <col width="30%" />
              <col width="25%" />
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
                      <div className="flex gap-4 justify-end">
                        <Tooltip title="Detail User" placement="top">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setDetailId(row.id), setDetailOpen(true);
                              // setSelectedPeserta({
                              //   id: row.id,
                              //   name: row.name,
                              //   nip: row.nip,
                              // });
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
                              setDetailPeserta({
                                username: peserta.username,
                                name: peserta.name,
                                email: peserta.email,
                                nip:
                                  peserta.bio === null
                                    ? ""
                                    : peserta.bio.officialCode,
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
                        <Tooltip title="Hapus User" placement="top">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedPeserta({
                                id: row.id,
                                name: row.name,
                                nip: row.nip,
                              });
                              setDeletePrompt(true);

                              console.log(row.name);
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
          rowsPerPage={6}
          page={page - 1}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[6]}
          className="overflow-hidden mt-4"
        />

        {/* Navigation */}
        <div className="flex gap-4">
          <Button
            type="button"
            color="error"
            className="text-base absolute bottom-6 "
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

      {/* Edit Peserta Prompt */}
      <Dialog open={editPrompt} onClose={() => setEditPrompt(false)}>
        <DialogTitle className="min-w-[400px]">Edit Detail Peserta</DialogTitle>
        <DialogContent className="m-2 max-w-[400px]">
          <form id="edit" onSubmit={handleEditPeserta}>
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

export default TraineeList;
