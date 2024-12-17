import { currentInstructor } from "@/context/auth";
import { getUserById, getUserByIdAsAdmin } from "@/services/user.services";
import { useEffect, useState, useRef } from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import React from "react";

interface UserDetail {
  name: string;
  nip: string;
  username: string;
  bio: {
    born: string;
    identityNumber: string;
    position: string;
  };
}

interface TraineeDetailProps {
  id: string;
  isOpen: boolean;
  detail: string;
  handleClose: () => void;
  handleLog: () => void;
  handleEdit: () => void;
}

const TraineeDetail: React.FC<TraineeDetailProps> = ({
  id,
  isOpen,
  detail,
  handleClose,
  handleLog,
  handleEdit,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<UserDetail | null>(null);
  const [showTooltip, setShowTooltip] = useState([false, false, false, false]);

  const nameRef = useRef<HTMLParagraphElement>(null);
  const nipRef = useRef<HTMLParagraphElement>(null);
  const bornRef = useRef<HTMLParagraphElement>(null);
  const positionRef = useRef<HTMLParagraphElement>(null);

  const refs = [nameRef, nipRef, bornRef, positionRef];

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const detailData = currentInstructor.isAdmin
          ? await getUserByIdAsAdmin(id)
          : await getUserById(id);
        console.log("DETAIL DATA", detailData);

        setData({
          name: detailData.name,
          nip: detailData.bio?.identityNumber,
          username: detailData.username,
          bio: detailData.bio,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchDetail();
    }
  }, [id, isOpen]);

  const checkEllipsis = () => {
    const tooltipStatus = refs.map((ref) => {
      if (ref.current) {
        return ref.current.scrollWidth > ref.current.clientWidth;
      }
      return false;
    });
    setShowTooltip(tooltipStatus);
  };

  useEffect(() => {
    if (data) {
      checkEllipsis();
    }
  }, [data]);

  const renderDetails = () => {
    if (isLoading) {
      return (
        <div className="flex w-full items-center justify-center">
          <CircularProgress />
        </div>
      );
    }

    if (!data) {
      return <p>Data tidak ditemukan</p>;
    }

    const fields = [
      { label: "Nama", value: data.name, ref: nameRef },
      { label: "NIP", value: data.nip, ref: nipRef },
      {
        label: "Tanggal Lahir",
        value: data.bio?.born
          ? `${dayjs(data.bio.born).format("DD MMM YYYY")} (${Math.abs(
              dayjs(data.bio.born).diff(dayjs(), "year")
            )} tahun)`
          : "-",
        ref: bornRef,
      },
      ...(detail === "Asesor"
        ? [{ label: "Username", value: data.username, ref: positionRef }]
        : []),
      { label: "Kedudukan", value: data.bio?.position, ref: positionRef },
    ];

    return fields.map((field, index) => (
      <Tooltip
        key={index}
        title={
          showTooltip[index] ? (
            <Typography sx={{ fontSize: "1rem", color: "white" }}>
              {field.value}
            </Typography>
          ) : (
            ""
          )
        }
        placement="top"
        arrow={false}
      >
        <p ref={field.ref} className="truncate">
          {field.label}: {field.value || "-"}
        </p>
      </Tooltip>
    ));
  };

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogTitle>Detail {detail}</DialogTitle>
      <DialogContent className="w-[400px]">
        <DialogContentText>{renderDetails()}</DialogContentText>
      </DialogContent>
      <DialogActions className="flex justify-end pr-6">
        <Button onClick={handleClose}>Tutup</Button>
        {!currentInstructor.isAdmin && (
          <Button onClick={handleEdit}>Edit</Button>
        )}
        {
          // detail === "Peserta" && (
          <Button onClick={handleLog}>Log</Button>
          // )
        }
      </DialogActions>
    </Dialog>
  );
};

export default TraineeDetail;
