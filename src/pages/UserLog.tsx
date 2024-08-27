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
  CircularProgress,
  Typography,
  Tab,
  Tabs
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
import { getCourseByInstructor } from '@/services/course.services';
import { getScoringByCourseInstructor, getScoringByInstructor } from '@/services/scoring.services';
import { each, get } from 'lodash';
import { arrayBuffer } from 'stream/consumers';


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

const UserLog = () => {
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

  const [activeDiagramTab, setActiveDiagramTab] = useState(0);
  const [kcicDiagramData, setKCICDiagramData] = useState<any[]>([]);
  const [lrtDiagramData, setLrtDiagramData] = useState<any[]>([]);
  const [submissionList, setSubmissionList] = useState<any[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  const fetchCourseData = async () => {
    try {
      const response  = await getCourseByInstructor(1,100);
      console.log("resssss", response)

      // Filter courses based on the description
      const lrtData = response.results.filter((course: any) => course.description === "LRT")
          .map((course: any) => ({
            id: course.id,
            title: course.title,
          }));
          
        const kcicData = response.results.filter((course: any) => course.description === "KCIC")
          .map((course: any) => ({
            id: course.id,
            title: course.title,
          }));
          console.log("kcic", kcicData)
      // Set state with the filtered data
      setKCICDiagramData(kcicData);
      setLrtDiagramData(lrtData);
    } catch (error) {
      console.error('Error fetching course data:', error);
    }
  };

  const fetchSubmissionData = async () => {
    try {
      const response = await getSubmissionList(userId);
      setSubmissionList(response.results);
    } catch (error) {
      console.error('Error fetching submission data:', error);
    }
  };

  const handleLevel = (diagramData: any) =>{
    const updatedLevels = [...levels];
    for(let j = 0; j < diagramData.length; j++){
      let highestScore = -1;
      const submissionCourse = submissionList.filter((submission) =>  submission.courseId == diagramData[j].id);
      console.log("ini dia", submissionCourse)
      if (submissionCourse.length > 0) {
        for (let i = 0; i < submissionCourse.length; i++){
          console.log("perbandingan", submissionCourse[i].score, highestScore)
            if (submissionCourse[i].score > highestScore){
              highestScore = submissionCourse[i].score 
            }
        }
      }
      const scoring = {
        title : diagramData[j].title,
        score: (highestScore == -1) ? '-' : highestScore.toLocaleString(),
        checkstate: (highestScore > -1)
      }
      console.log("kiwkiw",scoring)
      updatedLevels[j] = scoring
    };
    console.log(updatedLevels)
    setLevels(updatedLevels)
  }

  const calculateCompletionPercentage = (diagramData: any) => {
    let completion = 0
    diagramData.forEach((course: any) => {
      console.log("submission", submissionList)
      const submissionCourse = submissionList.filter((submission) =>  submission.courseId == course.id);
      if (submissionCourse.length > 0){
        completion += 1
      }
    });
    console.log("completion", completion)
      const total = diagramData.length
    return  (completion / total) * 100;
  };

  useEffect(() => {
    fetchCourseData();
    if (userId) {
      fetchSubmissionData();
    }
  }, [userId]);

  useEffect(() => {
    console.log("kcic data", kcicDiagramData)
    console.log("lrt data", lrtDiagramData)
    const diagramData = activeDiagramTab === 0 ? kcicDiagramData : lrtDiagramData;
    console.log("diagram data", diagramData)
    const percentage = calculateCompletionPercentage(diagramData);
    handleLevel(diagramData)
    console.log("percentage", percentage)
    setCompletionPercentage(percentage);
  }, [kcicDiagramData, lrtDiagramData, submissionList, activeDiagramTab]);

  const handleDiagramTabChange = (event: any, newValue: any) => {
    setActiveDiagramTab(newValue);
  };

  const diagramData = activeDiagramTab === 0 ? kcicDiagramData : lrtDiagramData;
  const totalModuls = diagramData.length;
  
  const [activeModuleTab, setActiveModuleTab] = useState(0);

  const handleModuleTabChange = (event: any, newValue: any) => {
    setActiveModuleTab(newValue);
  };

  

  const [levels, setLevels] = useState<Scoring[]>([{title: "kk", score: "-", checkstate:false}]);

  const [checkedState, setCheckedState] = useState(levels.map(level => level.score != '-'));

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage + 1);
  };

  const handleBack = () => {
    navigate(-1);
  };
  
  // const totalLevels = 6;
  const data = [
    { label: 'Selesai', value: 1, color: "#1aaffb" },
  ];

  
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


  const [modalOpen, setModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [url, setUrl] = useState<string>('');
  const [pdf, setPdf] = useState<any>(null);
  const [excel, setExcel] = useState<any>(null);
  const [isExcel, setIsExcel] = useState(false);
  const [courseList, setCourseList] = useState<[]>([]);

  const [pdfAnchorEl, setPDFAnchorEl] = useState<null | HTMLElement>(
    null
  );

  const [excelAnchorEl, setExcelAnchorEl] = useState<null | HTMLElement>(
    null
  );

  const isPDFMenuOpen = Boolean(pdfAnchorEl);
  const isExcelMenuOpen = Boolean(pdfAnchorEl);


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
    setPDFAnchorEl(null);
  };

  const handleDownloadPDF = async (id: number, date: string, module: string) => {
    setSubmissionId(id);
    try {
        const pdfres = await getSubmissionLogByTag(id, 'pdf');
        console.log('pdfres', pdfres.results[0]);

        if (pdfres.results.length === 0) {
            console.error('No PDF results found');
            return;
        }

        const pdffile = await getSubmissionLogByFileIndex(id, pdfres.results[0].id);
        console.log('pdffile', pdffile);

        const blob = new Blob([pdffile], { type: 'application/pdf' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${userLog?.name}_${dayjs(date).format('DD MMM YYYY')}_${module}.pdf`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setIsExcel(false);
    } catch (error) {
        console.error('Error fetching or opening PDF:', error);
    }
    setPDFAnchorEl(null);
  };


  const handlePDFClick = (event: React.MouseEvent<HTMLElement>) => {
    if (isPDFMenuOpen) {
      setPDFAnchorEl(null);
    } else {
      setPDFAnchorEl(event.currentTarget);
    }
  };

  const handlePDFUnclick = () => {
    setPDFAnchorEl(null);
  };

  const handleOpenExcel = async (id: any) => {
    setSubmissionId(id);
    try {
      const excelres = await getSubmissionLogByTag(Number(submissionId), 'xlsx');
      console.log('excelres', excelres);
      const excelfile = await getSubmissionLogByFileIndex(Number(submissionId),excelres.results[0].id);
      console.log('excelfile', excelfile);
      const blob = new Blob([excelfile], { type: 'application/vnd.ms-excel' });
      const urlfile = URL.createObjectURL(blob);
      setExcel(excelfile);
      setUrl(urlfile);
      setPreviewOpen(true);
    } catch (error) {
      console.error('Error fetching or opening PDF:', error);
    }
    setExcelAnchorEl(null);
  };

  const handleExcelClick = (event: React.MouseEvent<HTMLElement>) => {
    if (isExcelMenuOpen) {
      setExcelAnchorEl(null);
    } else {
      setExcelAnchorEl(event.currentTarget);
    }
  };

  const handleExcelUnclick = () => {
    setExcelAnchorEl(null);
  };

  const handleVideoPreview = () => {
    //load video file from videopath
    const video = fs.readFileSync(videopath)
    const blob = new Blob([video], { type: 'video/mp4'});
    const urel = URL.createObjectURL(blob);
    setUrl(urel)
    setPreviewOpen(true)
  }
  const [getSubmission, setGetSubmission] = useState(false);

  const [courseMap, setCourseMap] = useState<Map<number, string>>(new Map());
  const [scoringMap, setScoringMap] = useState<Map<number, string>>(new Map());

    useEffect(() => {
        const fetchUserLog = async () => {
            setIsLoading(true);
            try {
                const response = await getUserById(userId)
                const response2 = await getSubmissionList(userId)
                console.log("response2",response2);
                setSubmissionList(response2.results);
                setUserLog(response);

                const resRows = response2.results.map((submission: any) => ({
                    id: submission.id,
                    date: submission.createdAt,
                    train: submission.objectType, 
                    start: submission.createdAt, 
                    finish: submission.finishedAt, 
                    module: '',
                    score: submission.score,
                    // scoring: submission.courseExamId
                    scoring: '',
                    courseId: submission.courseId
                  }));
                
                setRows(resRows);
                setGetSubmission(true);
                
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

    useEffect(() => {
      if (getSubmission) {
        rows.map(async (row) => {
          const res = await getSubmissionById(Number(row.id));
          console.log('submission', res.exam?.assessment?.judul_modul);
          row.module = res.exam?.assessment?.judul_modul
          row.scoring = res.exam?.assessment?.judul_penilaian
          // set to rows
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
          Log Peserta
        </h1>
        <Box component="form" className="grid gap-4 w-full mb-2">
          <div className="title grid grid-cols-4 gap-4">
            <p className='text-xl'>
              <b>Nama:</b> {userLog?.name}
            </p>
            <p className='text-xl'>
              <b>NIP:</b> {userLog?.username}
            </p>
            <p className='text-xl'>
              <b>Kedudukan:</b> {userLog?.bio.position}
            </p>
            <p className='text-xl'>
              <b>Tanggal Lahir:</b> {dayjs(userLog?.bio.born).format('DD MMM YYYY')}
            </p>
          </div>
        </Box>

        <div className="flex items-center gap-2 mb-2">
          <div className="w-1/2 h-[300px] flex flex-col border border-solid">
            <Typography className="pl-4 pt-4 text-xl" position='absolute'>Penyelesaian Modul:</Typography>

            <Tabs
              value={activeDiagramTab}
              onChange={handleDiagramTabChange}
              className='absolute pl-[366px]'
            >
              <Tab label="Kereta Cepat" />
              <Tab label="LRT" />
            </Tabs>

            {diagramData.length > 0 ? (
              <>
                <div className="flex items-center justify-center h-52 flex-grow pt-4">
                  <PieChart
                    series={[
                      {
                        paddingAngle: 2,
                        innerRadius: 80,
                        outerRadius: 100,
                        data: diagramData,
                      },
                    ]}
                    margin={{ right: 120 }}
                    width={460}
                    height={200}
                    slotProps={{
                      legend: { hidden: false, position: {vertical: 'middle', horizontal: 'right'}, direction: 'column' }
                    }}
                  />
                  <Typography className="absolute text-center text-2xl" style={{ top: '236px', left: '213px'}}>{completionPercentage.toFixed(2)}%<br />{totalModuls} Modul</Typography>
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

            <Tabs
              value={activeModuleTab}
              onChange={handleModuleTabChange}
              className='absolute pl-80'
            >
              <Tab label="Kereta Cepat" />
              <Tab label="LRT" />
            </Tabs>

            {rows.length > 0 ? (
              <>
                <div className='flex items-center justify-center w-full h-full pt-16 pb-4 overflow-y-auto'>
                  <div className='w-full h-full flex'>
                    <div className='w-full h-full'>
                      {levels.map((level, index) => (
                        <div className='w-full h-1/3 flex items-center justify-center px-3 py-2' key={index}>
                          <div className={`w-full h-full flex items-center justify-center border-2 border-solid rounded-3xl ${level.checkstate ? 'bg-[#1aaffb] text-white' : ''}`}>
                            <div className='w-1/4 h-1/2 flex items-center justify-center'>
                              <Checkbox
                                icon={<RadioButtonUncheckedIcon />}
                                checkedIcon={<TaskAltIcon sx={{ color: 'white' }} />}
                                checked={level.checkstate}
                                disabled
                              />
                            </div>
                            <div className={`w-2/4 h-1/2 flex items-center text-lg ${level.checkstate ? 'text-white' : ''}`}>{level.title}</div>
                            <div className={`w-1/4 h-1/2 flex items-center text-lg ${level.checkstate ? 'text-white' : ''}`}>{level.score}</div>
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
        
        <TableContainer className="mb-8 h-[370px]" component={Paper}>
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
                        onClick={handlePDFClick}
                      >
                        PDF
                      </Button>
                      <Menu
                        anchorEl={pdfAnchorEl}
                        open={Boolean(pdfAnchorEl)}
                        onClose={handlePDFUnclick}
                        PaperProps={{
                            style: {
                              width: 'auto',
                              boxShadow: 'none',
                              border: '1px solid rgba(0, 0, 0, 0.12)',
                            },
                          }}
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center',
                          }}
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'center',
                          }}
                        >
                        <MenuItem onClick={() => handleOpenPDF(row.id)}>
                            Preview
                        </MenuItem>
                        <MenuItem onClick={() => handleDownloadPDF(row.id, row.date, row.module)}>
                            Download
                        </MenuItem>
                      </Menu>
                      <Button
                        type="button"
                        variant="outlined"
                        className='w-[60px]'
                        onClick={handleExcelClick}
                      >
                        Excel
                      </Button>
                      <Menu
                        anchorEl={excelAnchorEl}
                        open={Boolean(excelAnchorEl)}
                        onClose={handleExcelUnclick}
                        PaperProps={{
                            style: {
                              width: 'auto',
                              boxShadow: 'none',
                              border: '1px solid rgba(0, 0, 0, 0.12)',
                            },
                          }}
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center',
                          }}
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'center',
                          }}
                        >
                        <MenuItem onClick={() => handleOpenExcel(row.id)}>
                            Preview
                        </MenuItem>
                        <MenuItem>
                            Download
                        </MenuItem>
                      </Menu>
                    </TableCell>
                    <TableCell align='center'>
                      <Button
                        type="button"
                        variant="outlined"
                        color="primary"
                        className='w-[60px] h-[36px]'
                        onClick={handleVideoPreview}
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

      {/* Preview */}
      <Dialog open={previewOpen} onClose={handlePreviewClose} aria-labelledby="logout-dialog-title" aria-describedby="logout-dialog-description" maxWidth="lg" fullWidth>
        <iframe src={url} style={{ width: "100%", height: "1800px" }}></iframe>
      </Dialog>
    </Container>
    
  );
};

export default UserLog;
