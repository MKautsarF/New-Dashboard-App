import { currentInstructor } from '@/context/auth';
import { getUserById, getUserByIdAsAdmin } from '@/services/user.services';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

interface UserDetail {
  name: string;
  nip: string;
  bio: {
    born: string;
    officialCode: string;
    position: string;
  };
  completion?: number;
}

interface TraineeDetailProps {
  id: any;
  isOpen: boolean;
  handleClose: () => void;
  handleLog: () => void;
  // handleHapus: () => void;
  handleEdit: () => void;
}

let userId: string;

const TraineeDetail: React.FC<TraineeDetailProps> = ({
  id,
  isOpen,
  handleClose,
  handleLog,
  handleEdit,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<UserDetail | null>(null);

  useEffect(() => {
    async function fetchDetail() {
      setIsLoading(true);

      try {
        let detailData: any;
        if (currentInstructor.isAdmin) {
          detailData = await getUserByIdAsAdmin(id);
        } else {
          detailData = await getUserById(id);
        }
        console.log("data",detailData);

        userId = detailData.id;

        setData({
          name: detailData.name,
          nip: detailData.bio.identityNumber,
          bio: detailData.bio,
          completion: Math.round(4/7 * 100 * 10) / 10,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDetail();
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogTitle>
        Detail {currentInstructor.isInstructor ? 'Asesor' : 'Peserta'}
      </DialogTitle>
      <DialogContent className="w-[400px]">
        <DialogContentText>
          {isLoading ? (
            <div className="flex w-full items-center justify-center">
              <CircularProgress />
            </div>
          ) : data ? (
            <>
              <p>Nama: {data.name}</p>
              <p>NIP: {data.nip}</p>
              <p>
                Tanggal lahir:{' '}
                {data.bio && data.bio.born
                  ? `${dayjs(data.bio.born).format('DD MMM YYYY')} (${Math.abs(
                      dayjs(data.bio.born).diff(dayjs(), 'year')
                    )} tahun)`
                  : '-'}
              </p>
              <p>Kedudukan: {(data.bio && data.bio.position) || '-'}</p>
              <p>
                Persentase kelulusan:{' '}
                {data.completion ? `${data.completion}%` : '-'}
              </p>
              {/* <p>
                Kode kedinasan: {(data.bio && data.bio.officialCode) || '-'}
              </p> */}
            </>
          ) : (
            <p>Data tidak ditemukan</p>
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions className="flex justify-end">
        {/* {currentInstructor.isAdmin ? (
          <Button color="error" onClick={handleHapus}>
            Hapus
          </Button>
        ) : (
          <Button onClick={handleLog}>Log</Button>
        )} */}

        {currentInstructor.isAdmin ? null : (
          <>
            <Button onClick={handleEdit}>Edit</Button>
            <Button onClick={handleLog}>Log</Button>
          </>
        )}
        <Button onClick={handleClose}>Tutup</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TraineeDetail;
