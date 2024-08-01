import React, { useMemo, useState } from 'react';
import Container from '@/components/Container';
import { Button } from '@mui/material';
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
  // uploadSubmissionById,
} from '@/services/submission.services';
import { currentSubmission } from '@/context/auth';
import { config } from '@/config';
import fs from 'fs';
import FileSaver from 'file-saver';
import FullPageLoading from '@/components/FullPageLoading';

function useQuery() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}

const FinishKCIC: React.FC = () => {
  const navigate = useNavigate();

  const [pageLoading, setPageLoading] = useState(false);

  const query = useQuery();
  const filePath = `C:/Train Simulator/Data/penilaian/PDF/${query.get(
    'filename'
  )}.pdf`;

  const jsonPath = `C:/Train Simulator/Data/penilaian/${query.get(
    'filename'
  )}.json`;

  const [isPlaying, setIsPlaying] = useState(false);

  // const handleReplay = () => {
  //   const payload =
  //     "data|" +
  //     JSON.stringify({
  //       status: "replay-start",
  //     });
  // };

  const handlePlay = () => {
    // const payload = {
    //   status: isPlaying ? 'video-stop' : 'video-play',
    //   source: 'local',
    // };
    const payload = {
      status: 'video-play',
      source: 'local',
    };
    sendTextToClients(JSON.stringify(payload));
    // setIsPlaying(!isPlaying);
  };

  function handleBackward() {
    const payload = {
      status: 'video-backward',
      source: 'local',
    };
    sendTextToClients(JSON.stringify(payload));
  }

  function handleForward() {
    const payload = {
      status: 'video-forward',
      source: 'local',
    };
    sendTextToClients(JSON.stringify(payload));
  }

  const handleLihatNilai = () => {
    try {
      shell.openPath(filePath);
    } catch (e) {
      console.error(e);
    }
  };

  // const readStreamVideo = async (path: string) => {
  //   const stream = fs.createReadStream(path, 'binary');
  //   let data = '';
  //   stream.on('data', (chunk) => {
  //     data += chunk.toString();
  //   });
  //   stream.on('end', () => {
  //     console.log('stream end');
  //   });
  //   const blob = new Blob([data], { type: 'video/mp4' });
  //   console.log('create blob');

  //   const file = new File([blob], path);

  //   return file;
  // };

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

      const pdf = fs.readFileSync(filePath, 'binary');
      const pdfBlob = new Blob([pdf], { type: 'application/pdf' });
      const pdfFile = new File([pdfBlob], filePath);
      console.log('pdf read');

      // const pdfFile = await readStreamPdf(filePath);

      // const videoPath = `${config.VIDEO_SOURCE}`;
      // // const videoPath = "C:/Users/ROG STRIX Z790/Videos/Replay.mp4";
      // const videoFile = await readStreamVideo(videoPath);
      // console.log("video read");

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

      // const videoRes = await uploadSubmission(
      //   `/instructor/submission/${currentSubmission.id}/log`,
      //   videoFile,
      //   "file",
      //   { tag: "video" }
      // );
      // console.log("video uploaded");
    } catch (e) {
      console.error(e);
    } finally {
      setPageLoading(false);
      navigate('/SecondPage');
    }
  };

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
          >
            Lihat Penilaian
          </Button>
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