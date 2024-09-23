import FullPageLoading from '@/components/FullPageLoading';
import { useMemo } from "react";
import { getUsers, getUsersDatabase } from '@/services/user.services';
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
  getAllSubmissionByInstructor,
  getActiveSubmissionCount,
  // getAllSubmissionList,
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
import { InteractableTableCell } from '@/components/InteractableTableCell';


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
  status: any;
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
  const videopath = ""

  const [isLoading, setIsLoading] = useState(false);

  const [pageLoading, setPageLoading] = useState(false);

  const [rows, setRows] = useState<RowData[]>([]);
  const [totalData, setTotalData] = useState(0);
  const [page, setPage] = useState(1);
  const [ownerId, setOwnerId] = useState('');
  

  const [submissionList, setSubmissionList] = useState<any[]>([]);

  const [dateSort, setDateSort] = useState<'asc' | 'desc' | ''>('desc');
  const [trainSort, setTrainSort] = useState<'LRT' | 'KCIC' | ''>('');

  const [isEllipsisEnabled, setIsEllipsisEnabled] = useState(true);

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

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    setIsLoading(true);
    setPage(1);
    setTotalData(0);
  
    const data = new FormData(e.currentTarget);
    const query = data.get("query") as string;
  
    try {
      if (query != ''){
        const res = await getUsersDatabase(1, 5, query);
        const resRows = res.results.map((data: any) => ({
          id: data.id,
          name: data.name,
          nip: data.username,
        }));
    
        setOwnerId(resRows[0].id);
        setTotalData(res.total);
      } else {
        setOwnerId('');
      }
    } catch (e) {
      console.error(e);
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  };

  const [pageExclusions, setPageExclusions] = useState<{ [page: number]: Set<number> }>({0: new Set()});    
    
  const [activeData, setActiveData] = useState(0);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage + 1);
  };
  

  const [getSubmission, setGetSubmission] = useState(false);
  

  useEffect(() => {
    if (getSubmission) {
      Promise.all(
        rows.map(async (row) => {
          const res = await getSubmissionById(Number(row.id));
          return {
            ...row,
            instructor: res.exam?.setting?.instructor_name,
            name: res.exam?.setting?.name,
            module: res.exam?.setting?.module_name,
            scoring: res.exam?.setting?.scoring_name,
          };
        })
      )
      .then((updatedRows) => {
        setRows(updatedRows);
        setGetSubmission(false);
      })
      .catch((error) => {
        console.error('Error fetching submission details:', error);
        setGetSubmission(false);
      });
    }
  }, [getSubmission, rows]);
  
  useEffect(() => {
    const getRows = async (page: number) => {
      try {
        setIsLoading(true);
  
        const response = await getAllSubmissionByInstructor(
          page,
          9,
          '',
          dateSort,
          trainSort,
          pageExclusions
        );
        
        console.log("wwwwww", response)

        const { results, total, pageExclusion } = response;
        
        setPageExclusions(pageExclusion);
  
        const resRows: RowData[] = results.map((submission: any) => ({
          id: submission.id,
          date: submission.createdAt,
          train: submission.objectType,
          start: submission.createdAt,
          finish: submission.finishedAt,
          status: submission.status,
          module: '',
          score: submission.score,
          scoring: '',
          courseId: submission.courseId,
          instructor: submission.instructor || '',
          name: submission.name || ''
        }));
  
        setRows(resRows);

        
  
        if (activeData > 0) {
          setTotalData(total - activeData);
        } else {
          setTotalData(total);
        }
  
        setGetSubmission(true);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
  
    if (activeData !== null) {
      getRows(page);
    }
  }, [page, dateSort, trainSort, activeData]);
  
  
  
  return (
    <Container w={1500} h={875}>
      <div className="flex flex-col p-6 h-full">
        <h1 className="w-full text-center mb-2">
          Riwayat Submisi
        </h1>
        <Box
          component="form"
          onSubmit={handleSearch}
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
              <col width="13%"/>
              <col width="8%"/>
              <col width="11%"/>
              <col width='11%'/>
              <col width="12%"/>
              <col width="22%"/>
              <col width="23%"/>
            </colgroup>
            <TableHead>
              <TableRow>
                <TableCell className="text-lg font-bold" >
                  <Button
                    onClick={handleDateSort}
                    className="text-lg text-black font-bold w-full"
                    sx={{ 
                        textTransform: 'none', 
                        padding: '5px 2px', 
                        border: '1px solid black'
                    }}
                >
                    Tanggal <br /> 
                    Pengujian {dateSort == '' ? (<></>) : (dateSort == "desc" ? <ExpandLessIcon style={{fontSize: 19,  marginLeft: 12}}/> : <ExpandMoreIcon style={{fontSize: 19,  marginLeft: 12}}/>)}
                  </Button>
                </TableCell>
                <TableCell className='text-lg font-bold'>Status</TableCell>
                <TableCell className='text-lg font-bold'>Instruktur</TableCell>
                <TableCell className="text-lg font-bold">Peserta</TableCell>
                <TableCell className="font-bold">
                  <Button
                    onClick={handleTrainSort}
                    className="text-lg text-black font-bold"
                    sx={{ 
                        textTransform: 'none', 
                        padding: '5px 3px', 
                        border: '1px solid black', 
                        width: '140px',
                        textAlign: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {trainSort == '' ? ("Jenis Kereta") : (trainSort == "LRT" ? ("Low Rapid Train") : ("High Speed Train"))}
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
                    <TableCell className='text-lg'>{row.status}</TableCell>
                    <InteractableTableCell content={row.instructor} isEllipsisEnabled={isEllipsisEnabled} width="150px" textSize="1.125rem"/>
                    <InteractableTableCell content={row.name} isEllipsisEnabled={isEllipsisEnabled} width="150px" textSize="1.125rem"/>
                    <TableCell className="text-lg">{row.train === "KCIC" ? "High Speed Train" : row.train === "LRT" ? "Low Rapid Train" : row.train}</TableCell>
                    <InteractableTableCell content={row.module} isEllipsisEnabled={isEllipsisEnabled} width="314px" textSize="1.125rem"/>
                    <InteractableTableCell content={row.scoring} isEllipsisEnabled={isEllipsisEnabled} width="318px" textSize="1.125rem"/>
                  </TableRow>
                ))}
              </TableBody>
            ) : (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="flex items-center justify-center h-full text-lg">
                      Data log submisi peserta tidak ditemukan
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
