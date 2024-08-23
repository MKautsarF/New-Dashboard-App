import { useState, useMemo, useRef, useEffect } from "react";
import Container from '@/components/Container';
import { Button, Menu, MenuItem } from "@mui/material";
import LogoWithText from '@/components/LogoWithText';
import {
  Article,
  Check,
  FastForward,
  FastRewind,
  PlayArrow,
  Stop,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { shell } from 'electron';
import { sendTextToClients } from '@/socket';
import {
  finishSubmissionById,
  getSubmissionLogByFileIndex,
  uploadSubmission,
  getSubmissionLogByTag,
  getSubmissionById,
  getSubmissionLogById,
} from '@/services/submission.services';
// import { currentSubmission } from '@/context/auth';
import { config } from '@/config';
import fs from 'fs';
import FileSaver from 'file-saver';
import FullPageLoading from '@/components/FullPageLoading';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Dialog } from "@mui/material";
import { set } from "lodash";
import * as XLSX from 'xlsx';
import ExcelGrid from '@/components/ExcelGrid';


function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const FinishLRT: React.FC = () => {
  const navigate = useNavigate();
  const [pageLoading, setPageLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [url, setUrl] = useState<string>('');

  const query = useQuery();
  const submissionId = query.get('submissionId');
  const filePathPDF = `C:/Train Simulator/Data/penilaian/PDF/${query.get('filename')}.pdf`;
  const filePathExcel = `C:/Train Simulator/Data/penilaian/Excel/${query.get('filename')}.xlsx`;
  const jsonPath = `C:/Train Simulator/Data/penilaian/${query.get('filename')}.json`;
  const [pdf, setPdf] = useState<any>(null);
  const [excel, setExcel] = useState<any>(null);
  const [isExcel, setIsExcel] = useState(false);
  const [__html, setHTML] = useState("");

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

  const handlePlay = () => {
    const payload = {
      status: 'video-play',
      source: 'local',
    };
    sendTextToClients(JSON.stringify(payload));
  };

  const handleBackward = () => {
    const payload = {
      status: 'video-backward',
      source: 'local',
    };
    sendTextToClients(JSON.stringify(payload));
  };

  const handleForward = () => {
    const payload = {
      status: 'video-forward',
      source: 'local',
    };
    sendTextToClients(JSON.stringify(payload));
  };

  const handleLihatNilai = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenPDF = () => {
    // shell.openPath(filePathPDF);
    console.log('pdf', pdf);
    const blob = new Blob([pdf], { type: 'application/pdf' });
    const urlfile = URL.createObjectURL(blob);
    setIsExcel(false);
    setUrl(urlfile);
    console.log('url', urlfile);
    setPreviewOpen(true);
    handleClose();
  };

  const handleOpenExcel = () => {
    // shell.openPath(filePathExcel);\
    // const blob = new Blob([excel], { type: 'application/vnd.ms-excel' });
    const reader = new FileReader();
    reader.onload = function(e) {
      const arrayBuffer = e.target.result;
      const workbook = XLSX.read(arrayBuffer, {sheetRows:20});
      /* get first worksheet */
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const table = XLSX.utils.sheet_to_html(worksheet,{id: "tabeller" });
      const styledHTML = `
        <style>
          table#styledTable {
            border-collapse: collapse;
            width: 100%;
          }
          table#styledTable, th, td {
            border: 1px solid black;
          }
          th {
            background-color: black; /* Header background color */
            color: white; /* Header text color */
            padding: 8px;
            text-align: center;
          }
          td {
            padding: 8px;
            text-align: left;
          }
          td[colspan] {
            text-align: center;
            font-weight: bold;
          }
        </style>
        ${table}
      `;

      setHTML(styledHTML);
      setIsExcel(true);
      // setUrl(urlfile);
      setPreviewOpen(true);
      handleClose();
    }
    reader.readAsArrayBuffer(excel);
  };

  const handleUploadFinish = async () => {
    setPageLoading(true);
    try {
      const payload = {
        status: 'video-finish',
        source: 'local',
      };
      sendTextToClients(JSON.stringify(payload));

      // const res = await finishSubmissionById(currentSubmission.id);
      // console.log('finished submission: ' + res.data);

      const json = fs.readFileSync(jsonPath, 'binary');
      const jsonBlob = new Blob([json], { type: 'application/json' });
      const jsonFile = new File([jsonBlob], jsonPath);
      console.log('json read');

      const pdf = fs.readFileSync(filePathPDF, 'binary');
      const pdfBlob = new Blob([pdf], { type: 'application/pdf' });
      const pdfFile = new File([pdfBlob], filePathPDF);
      console.log('pdf read');

      const excel = fs.readFileSync(filePathExcel, 'binary');
      const excelBlob = new Blob([excel], { type: 'application/vnd.ms-excel' });
      const excelFile = new File([excelBlob], filePathExcel);
      console.log('excel read');

      const jsonRes = await uploadSubmission(
        `/instructor/submission/${submissionId}/log`,
        jsonFile,
        'file',
        { tag: 'json' }
      );
      console.log('json uploaded');

      const pdfRes = await uploadSubmission(
        `/instructor/submission/${submissionId}/log`,
        pdfFile,
        'file',
        { tag: 'pdf' }
      );
      console.log('pdf uploaded');

      const excelRes = await uploadSubmission(
        `/instructor/submission/${submissionId}/log`,
        excelFile,
        'file',
        { tag: 'excel' }
      );
      console.log('excel uploaded');
    } catch (e) {
      console.error(e);
    } finally {
      setPageLoading(false);
      navigate('/SecondPage');
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'lihat-nilai-menu' : undefined;

  return (
    <Container w={800}>
      <div className="w-fit absolute -translate-y-full pb-2">
        <LogoWithText />
      </div>

      <div className="p-6 h-full">
        {/* Action Buttons */}
        <div className="mt-16 flex justify-around w-full">
          <Button
            variant="contained"
            className="text-lg"
            startIcon={<Article />}
            onClick={handleLihatNilai}
            aria-controls={open ? 'lihat-nilai-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            endIcon={open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            Lihat Penilaian
          </Button>
          <Menu
            id={id}
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'lihat-nilai-button',
            }}
            sx={{
              '& .MuiPaper-root': {
                width: "236px",
              },
            }}
          >
            <MenuItem onClick={handleOpenPDF}>PDF</MenuItem>
            <MenuItem onClick={handleOpenExcel}>Excel</MenuItem>
          </Menu>
          <Button
            variant="contained"
            className="text-lg"
            startIcon={<PlayArrow />}
            color={'secondary'}
            onClick={handlePlay}
          >
            Replay Simulasi
          </Button>
          <Button
            variant="contained"
            className="text-lg"
            startIcon={<Check />}
            color="success"
            onClick={handleUploadFinish}
          >
            Upload & Finish
          </Button>
        </div>
      </div>
      <Dialog open={previewOpen} onClose={handlePreviewClose} aria-labelledby="logout-dialog-title" aria-describedby="logout-dialog-description" maxWidth="lg" fullWidth>
        {!isExcel && <iframe src={url} style={{ width: "100%", height: "1800px" }}></iframe>}
        {isExcel && <ExcelGrid file={excel} /> }
      </Dialog>

      <FullPageLoading loading={pageLoading} />
    </Container>
  );
};

export default FinishLRT;