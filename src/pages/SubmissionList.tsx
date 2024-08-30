import FullPageLoading from '@/components/FullPageLoading';
import { useMemo } from "react";
import { getUsers } from '@/services/user.services';
import {
  Box,
  Button,
  TextField,
  Checkbox,
  Dialog,
  MenuItem,
  Menu,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Typography,
  Tab,
  Tabs
} from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Container from '@/components/Container';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { currentPeserta } from '@/context/auth';
import {
  getSubmissionById,
  getSubmissionList,
  getAllSubmissionList,
  getSubmissionLogByFileIndex,
  getSubmissionLogByTag,
} from '@/services/submission.services';
import dayjs from 'dayjs';
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import { sendTextToClients } from '@/socket';
import FileSaver = require('file-saver');
import { shell } from 'electron';
import fs from 'fs';
import { config } from '@/config';
import { processFile, processFileExcel } from '@/services/file.services';
import { toast } from 'react-toastify';
import Logo from '@/components/Logo';
import { NavigateBefore } from '@mui/icons-material';
import { PieChart } from '@mui/x-charts/PieChart';
import { LineChart } from '@mui/x-charts/LineChart';
import SettingsIcon from '@mui/icons-material/Settings';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { getUserById } from "@/services/user.services";
import { getCourseByInstructor } from '@/services/course.services';
import * as XLSX from 'xlsx';
import ExcelGrid from '@/components/ExcelGrid';


interface RowData {
  id: any;
  date: string;
  train: string;
  start: string;
  finish: string;
  module: string;
  score: string;
  scoring: string;
  courseId: string;
  instructor: any;
  name: any;
}

interface UserLog {
    id: string;
    name: string;
    nip: string;
    username: string;
    bio: {
        born: string;
        officialCode: string;
        position: string;
    };
    completion?: number;
}

interface Course {
    id: number;
    title: string;
}

interface Scoring {
    title: string;
    score: string;
    checkstate: boolean;
}

function useQuery() {
    const { search } = useLocation();
  
    return useMemo(() => new URLSearchParams(search), [search]);
  }

const SubmissionList = () => {
    const query = useQuery();
  const navigate = useNavigate();
  const userId = query.get("id");

  //temporary
  const videopath = "C:/Users/Harits/Downloads/Embed external website page and display only particular portion of it in a webpage.mp4"

  const [isLoading, setIsLoading] = useState(false);

  const [pageLoading, setPageLoading] = useState(false);

  const [rows, setRows] = useState<RowData[]>([]);
  const [totalData, setTotalData] = useState(0);
  const [page, setPage] = useState(1);
  

  const [submissionList, setSubmissionList] = useState<any[]>([]);

  const [dateSort, setDateSort] = useState<'asc' | 'desc' | ''>('desc');
  const [trainSort, setTrainSort] = useState<'LRT' | 'KCIC' | ''>('');

  const handleDateSort = () => {
    if (dateSort === 'asc') {
      setDateSort('desc');
    } else if (dateSort === 'desc') {
      setDateSort('asc');
    } else {
      setDateSort('desc');
    }
  }

  const handleTrainSort = () => {
    if (trainSort === 'LRT') {
      setTrainSort('KCIC');
    } else if (trainSort === 'KCIC') {
      setTrainSort('');
    } else {
      setTrainSort('LRT');
    }
  }


  const fetchSubmissionData = async () => {
    try {
      const response = await getSubmissionList(userId, dateSort, trainSort);
      setSubmissionList(response.results);
    } catch (error) {
      console.error('Error fetching submission data:', error);
    }
  };
    
    const handleBack = () => {
      navigate(-1);
    };
    
    const [userLog, setUserLog] = useState<UserLog | null>(null);
    const [submissionId, setSubmissionId] = useState(null);
    
    const [previewOpen, setPreviewOpen] = useState(false);
    const [courseList, setCourseList] = useState<[]>([]);

    
    
    useEffect(() => {
      const getRows = async (page: number) => {
        try {
          const res = await getAllSubmissionList(page, 9);
          console.log("RESSSSSSS", res);

          const resRows = res.results.map((submission: any) => ({
            id: submission.id,
            date: submission.createdAt,
            train: submission.objectType, 
            start: submission.createdAt, 
            finish: submission.finishedAt, 
            module: '',
            score: submission.score,
            scoring: '',
            courseId: submission.courseId
          }));
          setRows(resRows);
          setTotalData(res.total);
          setGetSubmission(true);
        } catch (e) {
          console.error(e);
        }
      };
      
      getRows(page);
    }
  , [page]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage + 1);
  };
  

  const [getSubmission, setGetSubmission] = useState(false);
  
  useEffect(() => {
    if (getSubmission) {
      rows.map(async (row) => {
        const res = await getSubmissionById(Number(row.id));
        console.log("res", res);
        row.instructor = res.exam?.assessment?.nama_instruktur
        row.name = res.exam?.assessment?.nama_crew
        row.module = res.exam?.assessment?.judul_modul
        row.scoring = res.exam?.assessment?.judul_penilaian
        setRows([...rows]);
      });
      setGetSubmission(false);
    }
  }
  , [getSubmission]);
  
  return (
    <Container w={1250} h={875}>
      <div className="flex flex-col p-6 h-full">
        <h1 className="w-full text-center mb-2">
          Riwayat Submisi
        </h1>
        <Box
          component="form"
          className="flex gap-4 w-full mb-4"
        >
          <TextField
            id="input-with-icon-textfield"
            fullWidth
            name="query"
            placeholder="Cari berdasarkan Instruktur atau Peserta"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              sx: {
                backgroundColor: "#ffffff",
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
        <TableContainer className="mb-2" component={Paper}>
            <Table
                stickyHeader
                sx={{
                    '& .MuiTableCell-sizeMedium': {
                        padding: '14px 8px',
                    },
                }}
                aria-label="Tabel Peserta"
            >
            <colgroup>
              <col width="18%" />
              <col width="11%" />
              <col width='11%'/>
              <col width="12%" />
              <col width="24%" />
              <col width="24%" />
            </colgroup>
            <TableHead>
              <TableRow>
                <TableCell className="text-lg font-bold" >
                    <Button onClick={handleDateSort} className="text-lg text-black font-bold" sx={{ textTransform: 'none', padding: '0px 0px' }}>
                        Tanggal Pengujian {dateSort == '' ? (<></>) : (dateSort == "desc" ? <ExpandLessIcon style={{fontSize: 19}}/> : <ExpandMoreIcon style={{fontSize: 19}}/>)}
                    </Button>
                </TableCell>
                <TableCell className='text-lg font-bold'>Instruktur</TableCell>
                <TableCell className="text-lg font-bold">Peserta</TableCell>
                <TableCell className="text-lg font-bold">
                    <Button onClick={handleTrainSort} className="text-lg text-black font-bold" sx={{ textTransform: 'none', padding: '0px 0px' }}>
                        {trainSort == '' ? ("Jenis Kereta") : (trainSort == "LRT" ? ("LRT") : ("KCIC"))}
                    </Button>
                </TableCell>
                <TableCell className="text-lg font-bold">Modul</TableCell>
                <TableCell className="text-lg font-bold">Penilaian</TableCell>
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
                      '&:last-child td, &:last-child th': { border: 0 },
                    }}
                  >
                    <TableCell className="text-lg">
                        {dayjs(row.date).format('DD MMM YYYY, HH:mm')}
                    </TableCell>
                    <TableCell className='text-lg'>{row.instructor}</TableCell>
                    <TableCell className='text-lg'>{row.name}</TableCell>
                    <TableCell className="text-lg">{row.train === "KCIC" ? "Kereta Cepat" : row.train}</TableCell>
                    <TableCell className="text-lg">{row.module}</TableCell>
                    <TableCell className='text-lg'>{row.scoring}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            ) : (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="flex items-center justify-center h-full text-lg">
                      Data log peserta tidak ditemukan
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            )}
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalData}
          rowsPerPage={9}
          page={page - 1}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[9]}
          className="overflow-hidden"
        />

        {/* Navigation */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="contained"
            startIcon={<NavigateBefore />}
            className="text-base absolute bottom-6 left-6"
            onClick={() => handleBack()}
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
            Kembali
          </Button>
        </div>
      </div>

      <FullPageLoading loading={pageLoading} />

    </Container>
    
  );
};

export default SubmissionList;
