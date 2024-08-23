import FullPageLoading from '@/components/FullPageLoading';
import { useMemo } from "react";
import { getUsers } from '@/services/user.services';
import {
  Box,
  Button,
  TextField,
  Checkbox,
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
  CircularProgress,
  Typography,
} from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';
import Container from '@/components/Container';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { currentPeserta } from '@/context/auth';
import {
  getSubmissionById,
  getSubmissionList,
  getSubmissionLogByFileIndex,
  getSubmissionLogByTag,
} from '@/services/submission.services';
import dayjs from 'dayjs';
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


interface RowData {
  id: any;
  date: string;
  train: string;
  start: string;
  finish: string;
  module: string;
  score: string;
  scoring: string;
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

interface SubmissionProps {
    id: string;
    moduleName: string;
    score: number;
    status: string;
}

function useQuery() {
    const { search } = useLocation();
  
    return useMemo(() => new URLSearchParams(search), [search]);
  }

const UserLog = () => {
    const query = useQuery();
  const navigate = useNavigate();
  const userId = query.get("id");

  const [isLoading, setIsLoading] = useState(false);

  const [pageLoading, setPageLoading] = useState(false);

  const [rows, setRows] = useState<RowData[]>([]);
  const [totalData, setTotalData] = useState(0);
  const [page, setPage] = useState(1);
  

  const handleCheckboxChange = (index: any) => {
    const updatedCheckedState = checkedState.map((item, i) =>
      i === index ? !item : item
    );
    setCheckedState(updatedCheckedState);
  };

  const levels = [
    { level: "Level 1", value: 100 },
    { level: "Level 2", value: "-" },
    { level: "Level 3", value: "-" },
    { level: "Level 4", value: "-" },
    { level: "Level 5", value: "-" },
    { level: "Level 6", value: "-" },
  ];

  const [checkedState, setCheckedState] = useState(levels.map(level => level.value !== '-'));

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage + 1);
  };

  const handleBack = () => {
    navigate(-1);
  };
  
  const totalLevels = 6;
  const data = [
    { label: 'Selesai', value: 1, color: "#1bf249" },
  ];

  const selesaiValue = data.find(item => item.label === 'Selesai')?.value || 0;
  const belumSelesaiValue = totalLevels - selesaiValue;

  // Add dynamically calculated "Belum Selesai" data
  data.push({ label: 'Belum Selesai', value: belumSelesaiValue, color: '#6e6e6e' });

  const calculateCompletionPercentage = () => {
    const completionPercentage = belumSelesaiValue === 0 ? 100 : (selesaiValue / totalLevels) * 100;
    return completionPercentage.toFixed(2);
  };

  const [completionPercentage, setCompletionPercentage] = useState(calculateCompletionPercentage());
  
  const dataNilai = [
    { level: '0'},
    { level: '1', nilai: 35 },
    { level: '2', nilai: 100 },
    { level: '3', nilai: 100 },
    { level: '4', nilai: 0 },
    { level: '5', nilai: 15 },
    { level: '6', nilai: 0 },
    { level: '7', nilai: 60 },
    { level: '8', nilai: 88 },
    { level: '9', nilai: 12 },
    { level: '10', nilai: 85 },
  ];

  // Menghitung rata-rata nilai
  const calculateAverage = () => {
    const totalNilai = dataNilai
      .filter(item => item.level !== '0') // Filter level 0
      .reduce((acc, curr) => acc + (curr.nilai || 0), 0);

    const jumlahData = dataNilai.filter(item => item.level !== '0').length;

    let rataRataNilai = (totalNilai / jumlahData).toFixed(2);

    if (rataRataNilai.endsWith('.00')) {
      rataRataNilai = rataRataNilai.slice(0, -3);
    } else if (rataRataNilai.endsWith('.50')) {
      rataRataNilai = rataRataNilai.slice(0, -1);
    }

    return parseFloat(rataRataNilai); // Konversi ke number
  };

  const [rataRataNilai, setRataRataNilai] = useState(calculateAverage());
  const [userLog, setUserLog] = useState<UserLog | null>(null);
  const [submissionId, setSubmissionId] = useState(null);
  const [submissionList, setSubmissionList] = useState<any[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [url, setUrl] = useState<string>('');
  const [pdf, setPdf] = useState<any>(null);
  const [excel, setExcel] = useState<any>(null);
  const [isExcel, setIsExcel] = useState(false);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const res = await getSubmissionById(Number(submissionId));
        console.log('submission', res);
        const pdfres = await getSubmissionLogByTag(Number(submissionId), 'pdf');
        console.log('pdfres', pdfres.results[0]);
        const pdffile = await getSubmissionLogByFileIndex(Number(submissionId),pdfres.results[0].id);
        console.log('pdffile', pdffile);
        setPdf(pdffile);
        const excelres = await getSubmissionLogByTag(Number(submissionId), 'xlsx');
        console.log('excelres', excelres);
        const excelfile = await getSubmissionLogByFileIndex(Number(submissionId),excelres.results[0].id);
        console.log('excelfile', excelfile);
        setExcel(excelfile);
      } catch (e) {
        console.error(e);
      }
    };
    fetchSubmission();
    // setUrl(query.get('url'));
  }
  , []);

  const handlePreviewClose = () => {
    setPreviewOpen(false);
  };

  const handleOpenPDF = async (id: any) => {
    setSubmissionId(id);
    try {
      const pdfres = await getSubmissionLogByTag(Number(id), 'pdf');
      console.log('pdfres', pdfres.results[0]);
      const pdffile = await getSubmissionLogByFileIndex(Number(id), pdfres.results[0].id);
      console.log('pdffile', pdffile);
      const blob = new Blob([pdffile], { type: 'application/pdf' });
      const urlfile = URL.createObjectURL(blob);
      setPdf(pdffile);
      setUrl(urlfile);
      setIsExcel(false);
      console.log('url', urlfile);
      setPreviewOpen(true);
    } catch (error) {
      console.error('Error fetching or opening PDF:', error);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

    useEffect(() => {
        const fetchUserLog = async () => {
            setIsLoading(true);
            try {
                const response = await getUserById(userId)
                const response2 = await getSubmissionList(1, 5, userId)
                console.log("response2",response2);
                setSubmissionList(response2.results);
                setUserLog(response);

                const resRows = response2.results.map((submission: any) => ({
                    id: submission.id,
                    date: submission.createdAt,
                    train: submission.objectType, 
                    start: submission.createdAt, 
                    finish: submission.finishedAt, 
                    module: submission.courseId,
                    score: submission.score,
                    scoring: submission.courseExamId
                  }));
                
                setRows(resRows);
            } catch (error) {
                console.error('Error fetching user log:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (userId) {
            fetchUserLog();
        }
    }, [userId]);

  return (
    <Container w={1250} h={875}>
      <div className="flex flex-col p-6 h-full">
        <h1 className="w-full text-center mb-2">
          Log Peserta
        </h1>
        <Box component="form" className="grid gap-4 w-full mb-2">
          <div className="title grid grid-cols-2">
            <div>
              <p className='text-xl'>
                <b>Nama:</b> {currentPeserta.name}
              </p>
            </div>
            <div className="col-span-1">
              <p className='text-xl'>
                <b>NIP:</b> {currentPeserta.nip}
              </p>
            </div>
          </div>
        </Box>

        <div className="flex items-center gap-2 mb-2">
          <div className="w-1/2 h-[300px] flex flex-col border border-solid">
            <Typography className="pl-4 pt-4 text-xl" position='absolute'>Penyelesaian Level:</Typography>
            {rows.length > 0 ? (
              <>
                <div className="flex items-center justify-center h-52 flex-grow pt-4">
                  <PieChart
                    series={[
                      {
                        paddingAngle: 2,
                        innerRadius: 80,
                        outerRadius: 100,
                        data,
                      },
                    ]}
                    margin={{ right: 120 }}
                    width={460}
                    height={200}
                    slotProps={{
                      legend: { hidden: false, position: {vertical: 'middle', horizontal: 'right'}, direction: 'column' }
                    }}
                  />
                  <Typography className="absolute text-center text-2xl" style={{ top: '236px', left: '213px'}}>{completionPercentage}%<br></br>{selesaiValue}/{totalLevels} Level</Typography>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <Typography className="text-xl">Data log peserta tidak ditemukan</Typography>
              </div>
            )}
          </div>
          <div className="w-1/2 h-[300px] flex border border-solid">
            <Typography className="pl-4 pt-4 text-xl" position='absolute'>Nilai Penyelesaian Modul Terbaru:</Typography>
            {rows.length > 0 ? (
              <>
                <div className='flex items-center justify-center w-full h-full pt-16 pb-4'>
                  <div className='w-full h-full flex'>
                    <div className='w-1/2 h-full'>
                      {levels.slice(0, 3).map((level, index) => (
                        <div className='w-full h-1/3 flex items-center justify-center px-3 py-2' key={index}>
                          <div className={`w-full h-full flex items-center justify-center border-2 border-solid rounded-3xl ${checkedState[index] ? 'bg-[#1bf249]' : ''}`}>
                            <div className='w-1/4 h-1/2 flex items-center justify-center'>
                              <Checkbox
                                icon={<RadioButtonUncheckedIcon />}
                                checkedIcon={<TaskAltIcon sx={{ color: 'black' }} />}
                                checked={checkedState[index]}
                                onChange={() => handleCheckboxChange(index)}
                                disabled
                              />
                            </div>
                            <div className={`w-2/4 h-1/2 flex items-center text-lg ${checkedState[index] ? 'text-black' : ''}`}>{level.level}</div>
                            <div className={`w-1/4 h-1/2 flex items-center text-lg ${checkedState[index] ? 'text-black' : ''}`}>{level.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className='w-1/2 h-full'>
                      {levels.slice(3, 6).map((level, index) => (
                        <div className='w-full h-1/3 flex items-center justify-center px-3 py-2' key={index + 3}>
                          <div className={`w-full h-full flex items-center justify-center border-2 border-solid rounded-3xl ${checkedState[index + 3] ? 'bg-[#1bf249]' : ''}`}>
                            <div className='w-1/4 h-1/2 flex items-center justify-center'>
                              <Checkbox
                                icon={<RadioButtonUncheckedIcon />}
                                checkedIcon={<TaskAltIcon sx={{ color: 'black' }} />}
                                checked={checkedState[index + 3]}
                                onChange={() => handleCheckboxChange(index + 3)}
                                disabled
                              />
                            </div>
                            <div className={`w-2/4 h-1/2 flex items-center text-lg ${checkedState[index + 3] ? 'text-black' : ''}`}>{level.level}</div>
                            <div className={`w-1/4 h-1/2 flex items-center text-lg ${checkedState[index + 3] ? 'text-black' : ''}`}>{level.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <Typography className="text-xl">Data log peserta tidak ditemukan</Typography>
              </div>
            )}
          </div>
        </div>
        
        <TableContainer className="mb-8" component={Paper}>
          <Table stickyHeader aria-label="Tabel Peserta">
            <colgroup>
              <col width="18%" />
              <col width="13%" />
              <col width='22%'/>
              <col width="22%" />
              <col width="6%" />
              <col width="14%" />
              <col width="5%" />
            </colgroup>
            <TableHead>
              <TableRow>
                <TableCell className="text-lg font-bold">Tanggal Pengujian</TableCell>
                <TableCell className="text-lg font-bold">Jenis Kereta</TableCell>
                <TableCell className="text-lg font-bold">Modul</TableCell>
                <TableCell className="text-lg font-bold">Penilaian</TableCell>
                <TableCell className='text-lg font-bold'>Nilai  </TableCell>
                <TableCell className="text-lg font-bold">Hasil</TableCell>
                <TableCell className="text-lg font-bold">Replay</TableCell>
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
                    <TableCell className="text-lg">{row.train}</TableCell>
                    <TableCell className="text-lg">{row.module}</TableCell>
                    <TableCell className='text-lg'>{row.scoring}</TableCell>
                    <TableCell className='text-lg'>{row.score}</TableCell>
                    <TableCell align='center' className='flex items-center justify-between'>
                      <Button
                        type="button"
                        variant="outlined"
                        className='w-[60px]'
                        onClick={() => handleOpenPDF(row.id)}
                      >
                        PDF
                      </Button>
                      <Button
                        type="button"
                        variant="outlined"
                        className='w-[60px]'
                      >
                        Excel
                      </Button>
                    </TableCell>
                    <TableCell align='center'>
                      <Button
                        type="button"
                        variant="outlined"
                        color="primary"
                        className='w-[60px] h-[36px]'
                      >
                        {<ReplayIcon style={{fontSize: 17}}/>}
                      </Button>
                    </TableCell>
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

        {/* Navigation */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="contained"
            startIcon={<NavigateBefore />}
            className="text-base"
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

      {/* Preview */}
      <Dialog open={previewOpen} onClose={handlePreviewClose} aria-labelledby="logout-dialog-title" aria-describedby="logout-dialog-description" maxWidth="lg" fullWidth>
        <iframe src={url} style={{ width: "100%", height: "1800px" }}></iframe>
      </Dialog>
    </Container>
    
  );
};

export default UserLog;
