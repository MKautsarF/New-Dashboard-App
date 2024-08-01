import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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

import { getUserById } from "@/services/user.services";
import dayjs from "dayjs";

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

function UserLog() {
    const [isLoading, setIsLoading] = useState(false);
    const [userLog, setUserLog] = useState<UserLog | null>(null);

    const navigate = useNavigate();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const userId = query.get('id');
    

    useEffect(() => {
        const fetchUserLog = async () => {
            setIsLoading(true);
            try {
                const response = await getUserById(userId)
                setUserLog(response);
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

    const modules = [
        { title: "Menyalakan Kereta", scoring: 90 },
        { title: "Menjalankan Kereta", scoring: 80 },
        { title: "Mematikan kereta", scoring: 95 },
        { title: "Keluar Dari Depo", scoring: 70 },
        { title: "Masuk Ke Depo", scoring: "-" },
        { title: "Pindah Jalur", scoring: 75 },
        { title: "Kereta Anjlok", scoring: 10 },
    ];

    const belumLulusCount = modules.filter(module => {
        const score = typeof module.scoring === 'number' ? module.scoring : 0;
        return score < 75;
    }).length;

    const lulusCount = modules.filter(module => {
        const score = typeof module.scoring === 'number' ? module.scoring : 0;
        return score >= 75;
    }).length;

    const data = [
        { label: "Belum Lulus", value: belumLulusCount, color: "#FF0000" },
        { label: "Lulus", value: lulusCount, color: "#1fed4f" },
    ];

    const handlePrev = () => {
        navigate(-1);
    };

    return (
        <Container>
            {isLoading && <FullPageLoading loading={false} />}
            <div className="p-8">
                <h1 className="text-2xl font-bold text-center">User Log</h1>
                <div className="flex justify-between flex-start gap-4 mt-4">
                    <div className="flex-col items-center justify-center w-[300px]">
                        <h2>User</h2>
                        <div className="mt-2">
                            <Typography>Nama: {userLog?.name}</Typography>
                            <Typography>NIP: {userLog?.username}</Typography>
                            <Typography>Kedudukan: {userLog?.bio.position}</Typography>
                            <Typography>Tanggal Lahir: {dayjs(userLog?.bio.born).format('DD MMM YYYY')}</Typography>
                        </div>
                        <h2 className="mt-[30px]">Statistic</h2>
                        <div className="">
                            <div className="flex items-center justify-center h-52 flex-grow">
                                <PieChart
                                    series={[
                                        {
                                            paddingAngle: 2,
                                            innerRadius: 60,
                                            outerRadius: 80,
                                            data: data.map((entry) => ({
                                                ...entry,
                                                fill: entry.color,
                                            })),
                                        },
                                    ]}
                                    margin={{ right: 5 }}
                                    width={200}
                                    height={200}
                                    slotProps={{
                                        legend: { hidden: true },
                                    }}
                                />
                                <Typography position='absolute' className="text-center">
                                    {`${Math.floor(data[1].value * 1000 / 7) / 10}%`}<br />
                                    {data[1].value}/{data[0].value + data[1].value} Modul
                                </Typography>
                            </div>
                        </div>
                    </div>
                    <div className="flex space-x-2 flex-col">
                        <TableContainer className="w-[450px]">
                            <Table stickyHeader aria-label="Tabel Nilai Modul">
                                <colgroup>
                                    <col style={{ width: "75%" }} />
                                    <col style={{ width: "25%" }} />
                                </colgroup>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><h3>Judul Modul</h3></TableCell>
                                        <TableCell align="right"><h3>Nilai</h3></TableCell>
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
                </div>
                <div className="flex w-full mt-[100px]">
                    <Button
                        type="button"
                        color="error"
                        variant="outlined"
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