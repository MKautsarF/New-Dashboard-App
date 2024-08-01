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
} from '@/services/submission.services';
import { currentSubmission } from '@/context/auth';
import { config } from '@/config';
import fs from 'fs';
import FileSaver from 'file-saver';
import FullPageLoading from '@/components/FullPageLoading';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';


function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const FinishKCIC: React.FC = () => {
  const navigate = useNavigate();
  const [pageLoading, setPageLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const query = useQuery();
  const filePathPDF = `C:/Train Simulator/Data/penilaian/PDF/${query.get('filename')}.pdf`;
  const filePathExcel = `C:/Train Simulator/Data/penilaian/Excel/${query.get('filename')}.xlsx`;
  const jsonPath = `C:/Train Simulator/Data/penilaian/${query.get('filename')}.json`;

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
    shell.openPath(filePathPDF);
    handleClose();
  };

  const handleOpenExcel = () => {
    shell.openPath(filePathExcel);
    handleClose();
  };

  const handleUploadFinish = async () => {
    setPageLoading(true);
    try {
      const payload = {
        status: 'video-finish',
        source: 'local',
      };
      sendTextToClients(JSON.stringify(payload));

      const res = await finishSubmissionById(currentSubmission.id);
      console.log('finished submission: ' + res.data);

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
        `/instructor/submission/${currentSubmission.id}/log`,
        jsonFile,
        'file',
        { tag: 'json' }
      );
      console.log('json uploaded');

      const pdfRes = await uploadSubmission(
        `/instructor/submission/${currentSubmission.id}/log`,
        pdfFile,
        'file',
        { tag: 'pdf' }
      );
      console.log('pdf uploaded');

      const excelRes = await uploadSubmission(
        `/instructor/submission/${currentSubmission.id}/log`,
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

      <div className="p-8 h-full">
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

      <FullPageLoading loading={pageLoading} />
    </Container>
  );
};

export default FinishKCIC;