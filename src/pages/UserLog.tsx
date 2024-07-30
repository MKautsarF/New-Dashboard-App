import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart } from "@mui/x-charts/PieChart";
import Container from "@/components/Container";
import FullPageLoading from "@/components/FullPageLoading";
import {
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Table,
  Typography,
  Button,
} from "@mui/material";

interface UserLog {
  id: string;
  name: string;
  nip: string;
  bio: {
    born: string;
    officialCode: string;
    position: string;
  };
  complition?: number;
}

interface TraineeDetailProps {
  id: any;
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  6: number;
  7: number;
}

function UserLog() {
  const [isLoading, setIsLoading] = useState(false);
  // const [data, setData] = useState<UserLog | null>(null);
  const [userLog, setUserLog] = useState<UserLog | null>({
    id: "1",
    name: "Trainee 5",
    nip: "55555",
    bio: {
      born: "21 May 2024",
      officialCode: "123123",
      position: "Peserta",
    },
    complition: 2,
  });

  const [selectedPeserta, setSelectedPeserta] = useState({
    id: "",
    name: "",
    nip: "",
    complition: 3,
  });

  const navigate = useNavigate();
  const modules = [
    { title: "Menyalakan Kereta", scoring: 90 },
    { title: "Menjalankan Kereta", scoring: 80 },
    { title: "Mematikan kereta", scoring: 95 },
    { title: "Keluar Dari Depo", scoring: 70 },
    { title: "Masuk Ke Depo", scoring: 85 },
    { title: "Pindah Jalur", scoring: 75 },
    { title: "Kereta Anjlok", scoring: 100 },
  ];

  const data = [
    { name: "Belum Lulus", value: 1, color: "#FF0000" },
    { name: "Lulus", value: 6, color: "#1fed4f" },
  ];

  const handlePrev = () => {
    navigate("/FourthPage");
  };
  return (
    <Container>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-center">User Log</h1>
        <div className="flex justify-between flex-start gap-4 mt-4">
          <div className="flex space-x-2 flex-col">
            <TableContainer className="w-[450px]">
              <Table stickyHeader aria-label="Tabel Nilai Modul">
                <colgroup>
                  <col style={{ width: "75%" }} />
                  <col style={{ width: "25%" }} />
                </colgroup>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <b>Judul Modul</b>
                    </TableCell>
                    <TableCell align="right">
                      <b>Nilai</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {modules.map((module, index) => (
                    <TableRow key={index}>
                      <TableCell>{module.title}</TableCell>
                      <TableCell align="right">{module.scoring}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
          <div className="ml-[50px] flex-col items-center justify-center w-[300px]">
            <h2>User</h2>
            <div>
              <Typography>Nama: {userLog?.name}</Typography>
              {/* <Typography>Nama: {selectedPeserta.name}</Typography> */}
              <Typography>NIP: {userLog?.nip}</Typography>
              <Typography>Kedudukan: {userLog?.bio.position}</Typography>
              <Typography>Tanggal Lahir: {userLog?.bio.born}</Typography>
            </div>
            <h2 className="mt-[30px]">Statistic</h2>
            <div className="">
              <div className="flex items-center justify-center h-52 flex-grow">
                <PieChart
                  series={[
                    {
                      // startAngle: -100,
                      // endAngle: 100,
                      paddingAngle: 2,
                      innerRadius: 60,
                      outerRadius: 80,
                      data: data.map((entry) => ({
                        ...entry,
                        fill: entry.color, // Set the color for each segment
                      })),
                    },
                  ]}
                  margin={{ right: 5 }}
                  width={200}
                  height={200}
                  slotProps={{
                    legend: { hidden: false },
                  }}
                />
                <Typography position="absolute" className="text-center">
                  {`${Math.floor((data[1].value * 1000) / 7) / 10}%`}
                  <br></br>
                  {data[1].value}/{data[0].value + data[1].value} Modul
                </Typography>
                {/* <Typography position='absolute'>{80}%</Typography> */}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-4 justify-between pl-8 pb-8 pr-8 w-full mt-[50px]">
          <Button
            type="button"
            color="error"
            variant="outlined"
            // className="bottom-0 mt-4"
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
            onClick={() => {
              handlePrev();
            }}
          >
            Back
          </Button>
        </div>
      </div>
    </Container>
  );
}

export default UserLog;
