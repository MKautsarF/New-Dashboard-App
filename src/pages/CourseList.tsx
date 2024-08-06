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
  getCourseListbyAdmin,
  downloadCourse,
} from "@/services/course.services";
import { useSettings } from "@/context/settings";
import FullPageLoading from "@/components/FullPageLoading";
import TraineeDetail from "@/components/TraineeDetail";
import dayjs, { Dayjs } from "dayjs";
import { DatePicker } from "@mui/x-date-pickers";
import { toast } from "react-toastify";
import { getSubmissionList } from "@/services/submission.services";

interface RowData {
  id: number;
  title: string;
  description: string;
  filename: string;
}

const CourseList = () => {
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

  currentInstructor.isAdmin = true;
  // console.log(currentInstructor.isAdmin);
  currentInstructor.isInstructor = true;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleKembali = () => {
    navigate("/admin");
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage + 1);
    // setPage(newPage);
  };

  const handleViewFile = async (id: number) => {
    try {
      const response = await downloadCourse(id);
      console.log(response);
      // if (!response.ok) {
      //   throw new Error("Network response was not ok");
      // }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `${id}.json`; // You can customize the filename
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download file:", error);
    }
  };

  useEffect(() => {
    async function getRows(page: number) {
      try {
        setIsLoading(true);
        const res = await getCourseListbyAdmin(page, 5);
        console.log("API Response:", res);

        const resRows: RowData[] = res.results.map((entry: any) => ({
          id: entry.id,
          title: entry.title,
          description: entry.description,
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
    <Container w={1000} h={700}>
      <div className="flex flex-col p-6 h-full gap-4">
        {/* Search bar */}
        <Box component="form" className="flex gap-4 w-full ">
          <Button
            type="button"
            variant="contained"
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
                <TableCell sx={{ fontWeight: "bold", fontSize: "17px" }}>
                  Judul
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", fontSize: "17px" }}>
                  Tipe Kereta
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", fontSize: "17px" }}>
                  Test
                </TableCell>
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
                    <TableCell>{row.title}</TableCell>
                    <TableCell>{row.description}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleViewFile(row.id)} // Pass the id to the function
                      >
                        View File
                      </Button>
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
          // page={page}
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

      <FullPageLoading loading={pageLoading} />
    </Container>
  );
};

export default CourseList;
