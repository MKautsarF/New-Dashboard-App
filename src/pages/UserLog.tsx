import FullPageLoading from "@/components/FullPageLoading";
import { useMemo, useRef } from "react";
import { getUserByIdAdmin, getUsers } from "@/services/user.services";
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
  Tabs,
  Tooltip,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import Container from "@/components/Container";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { currentPeserta } from "@/context/auth";
import {
  deleteSubmissionAll,
  deleteSubmissionById,
  getSubmissionById,
  getSubmissionList,
  getSubmissionLogByFileIndex,
  getSubmissionLogByTag,
} from "@/services/submission.services";
import dayjs from "dayjs";
import { sendTextToClients } from "@/socket";
import FileSaver = require("file-saver");
import { shell } from "electron";
import fs from "fs";
import { InteractableTableCell } from "@/components/InteractableTableCell";
import { NavigateBefore } from "@mui/icons-material";
import { PieChart } from "@mui/x-charts/PieChart";
import { LineChart } from "@mui/x-charts/LineChart";
import SettingsIcon from "@mui/icons-material/Settings";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import { getUserById } from "@/services/user.services";
import {
  getCourseByAdmin,
  getCourseByInstructor,
} from "@/services/course.services";
import * as XLSX from "xlsx";
import ExcelGrid from "@/components/ExcelGrid";
import { toast } from "react-toastify";

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
  status: string;
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
  console.log("userId", userId);
  //temporary
  const videopath = "";

  const [isLoading, setIsLoading] = useState(false);

  const [pageLoading, setPageLoading] = useState(false);

  const [rows, setRows] = useState<RowData[]>([]);
  const [totalData, setTotalData] = useState(0);
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(false);
  const [activeDiagramTab, setActiveDiagramTab] = useState(0);
  const [kcicDiagramData, setKCICDiagramData] = useState<any[]>([]);
  const [lrtDiagramData, setLrtDiagramData] = useState<any[]>([]);
  const [submissionList, setSubmissionList] = useState<any[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  const [dateSort, setDateSort] = useState<"asc" | "desc" | "">("desc");
  const [trainSort, setTrainSort] = useState<"LRT" | "KCIC" | "">("");

  const [isEllipsisEnabled, setIsEllipsisEnabled] = useState(true);

  const handleDateSort = () => {
    if (dateSort === "asc") {
      setDateSort("desc");
    } else if (dateSort === "desc") {
      setDateSort("asc");
    } else {
      setDateSort("desc");
    }
  };

  const handleTrainSort = () => {
    if (trainSort === "LRT") {
      setTrainSort("KCIC");
    } else if (trainSort === "KCIC") {
      setTrainSort("");
    } else {
      setTrainSort("LRT");
    }
  };

  const fetchCourseData = async () => {
    try {
      const response = await getCourseByInstructor(1, 100);

      // Filter courses based on the description
      const lrtData = response.results
        .filter((course: any) => course.description === "LRT")
        .map((course: any) => ({
          id: course.id,
          title: course.title,
        }));

      const kcicData = response.results
        .filter((course: any) => course.description === "KCIC")
        .map((course: any) => ({
          id: course.id,
          title: course.title,
        }));
      // Set state with the filtered data
      setKCICDiagramData(kcicData);
      setLrtDiagramData(lrtData);
    } catch (error) {
      console.error("Error fetching course data:", error);
    }
  };

  const fetchSubmissionData = async () => {
    try {
      console.log("TES", userId);
      console.log("TES", dateSort);
      console.log("TES", trainSort);
      const response = await getSubmissionList(userId, dateSort, trainSort);
      console.log("TES1", userId);
      setSubmissionList(response.results);
    } catch (error) {
      console.error("Error fetching submission data:", error);
    }
  };

  const handleLevel = (diagramData: any) => {
    const updatedLevels = [];
    for (let j = 0; j < diagramData.length; j++) {
      let highestScore = -1;
      const submissionCourse = submissionList.filter(
        (submission) => submission.courseId == diagramData[j].id
      );
      if (submissionCourse.length > 0) {
        for (let i = 0; i < submissionCourse.length; i++) {
          if (submissionCourse[i].score > highestScore) {
            highestScore = submissionCourse[i].score;
          }
        }
      }
      const scoring = {
        title: diagramData[j].title,
        score:
          highestScore == null || highestScore === -1
            ? "-"
            : highestScore.toLocaleString(),
        checkstate: highestScore != null && highestScore > -1,
      };

      updatedLevels[j] = scoring;
    }
    setLevels(updatedLevels);
  };

  const [completion, setCompletion] = useState(0);
  const [totalModuls, setTotalModuls] = useState(0);

  const calculateCompletionPercentage = (diagramData: any) => {
    let completion = 0;
    diagramData.forEach((course: any) => {
      const submissionCourse = submissionList.filter(
        (submission) => submission.courseId == course.id
      );
      if (submissionCourse.length > 0) {
        completion += 1;
      }
    });
    const totalModuls = diagramData.length;
    return (completion / totalModuls) * 100;
  };

  useEffect(() => {
    fetchCourseData();
    console.log("User ID", userId);
    if (userId) {
      fetchSubmissionData();
    }
  }, [userId]);

  const calculateCompletion = (diagramData: any) => {
    let completionCount = 0;
    diagramData.forEach((course: any) => {
      const submissionCourse = submissionList.filter(
        (submission) => submission.courseId === course.id
      );
      if (submissionCourse.length > 0) {
        completionCount += 1;
      }
    });
    const totalModuls = diagramData.length;
    return { completion: completionCount, totalModuls };
  };

  const diagramData = activeDiagramTab === 0 ? kcicDiagramData : lrtDiagramData;

  useEffect(() => {
    const diagramData =
      activeDiagramTab === 0 ? kcicDiagramData : lrtDiagramData;
    const percentage = calculateCompletionPercentage(diagramData);
    const { completion, totalModuls } = calculateCompletion(diagramData);
    setCompletion(completion);
    setTotalModuls(totalModuls);
    setCompletionPercentage(percentage);
  }, [diagramData, activeDiagramTab]);

  const handleDiagramTabChange = (event: any, newValue: any) => {
    setActiveDiagramTab(newValue);
  };

  const pieDiagramData = [
    { id: "selesai", label: "Selesai", value: completion, color: "#1aaffb" },
    {
      id: "belum selesai",
      label: "Belum Selesai",
      value: totalModuls - completion,
      color: "#6e6e6e",
    },
  ];

  const adjustedPieDiagramData =
    diagramData.length === 0
      ? [
          { id: "selesai", label: "Selesai", value: 0, color: "#1aaffb" },
          {
            id: "belum selesai",
            label: "Belum Selesai",
            value: totalModuls,
            color: "#6e6e6e",
          },
        ]
      : pieDiagramData;

  const [activeModuleTab, setActiveModuleTab] = useState(0);
  const moduleData = activeModuleTab === 0 ? kcicDiagramData : lrtDiagramData;

  useEffect(() => {
    const diagramData =
      activeModuleTab === 0 ? kcicDiagramData : lrtDiagramData;
    handleLevel(diagramData);
  }, [moduleData, activeModuleTab]);

  const handleModuleTabChange = (event: any, newValue: any) => {
    setActiveModuleTab(newValue);
  };

  const [levels, setLevels] = useState<Scoring[]>([
    { title: "kk", score: "-", checkstate: false },
  ]);

  const handleBack = () => {
    navigate(-1);
  };

  const [userLog, setUserLog] = useState<UserLog | null>(null);
  const [submissionId, setSubmissionId] = useState(null);
  const [submissionName, setSubmissionName] = useState("");

  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [modalDeleteAllOpen, setModalDeleteAllOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [url, setUrl] = useState<string>("");
  const [pdf, setPdf] = useState<any>(null);
  const [excel, setExcel] = useState<any>(null);
  const [isExcel, setIsExcel] = useState(false);
  const [courseList, setCourseList] = useState<[]>([]);

  // const [pdfAnchorEl, setPDFAnchorEl] = useState<null | HTMLElement>(
  //   null
  // );

  // const [excelAnchorEl, setExcelAnchorEl] = useState<null | HTMLElement>(
  //   null
  // );

  const [replayAnchorEl, setReplayAnchorEl] = useState<null | HTMLElement>(
    null
  );

  // const isPDFMenuOpen = Boolean(pdfAnchorEl);
  // const isExcelMenuOpen = Boolean(excelAnchorEl);
  const isReplayMenuOpen = Boolean(replayAnchorEl);

  const [__html, setHTML] = useState("");

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const res = await getSubmissionById(Number(submissionId));
        console.log("RESSSSSSS", res);
        const pdfres = await getSubmissionLogByTag(Number(submissionId), "pdf");
        const pdffile = await getSubmissionLogByFileIndex(
          Number(submissionId),
          pdfres.results[0].id
        );
        setPdf(pdffile);
        const excelres = await getSubmissionLogByTag(
          Number(submissionId),
          "xlsx"
        );
        const excelfile = await getSubmissionLogByFileIndex(
          Number(submissionId),
          excelres.results[0].id
        );
        setExcel(excelfile);
      } catch (e) {
        console.error(e);
      }
    };

    fetchSubmission();
  }, []);

  const handlePreviewClose = () => {
    setPreviewOpen(false);
  };

  const handleOpenPDF = async (id: any) => {
    setSubmissionId(id);
    try {
      const pdfres = await getSubmissionLogByTag(Number(id), "pdf");
      const pdffile = await getSubmissionLogByFileIndex(
        Number(id),
        pdfres.results[0].id
      );
      const blob = new Blob([pdffile], { type: "application/pdf" });
      const urlfile = URL.createObjectURL(blob);
      setPdf(pdffile);
      setUrl(urlfile);
      setIsExcel(false);
      setPreviewOpen(true);
    } catch (error) {
      console.error("Error fetching or opening PDF:", error);
    }
    // setPDFAnchorEl(null);
  };

  const handleDownloadPDF = async (
    id: number,
    date: string,
    module: string
  ) => {
    setSubmissionId(id);
    try {
      const pdfres = await getSubmissionLogByTag(id, "pdf");
      if (pdfres.results.length === 0) {
        console.error("No PDF results found");
        return;
      }

      const pdffile = await getSubmissionLogByFileIndex(
        id,
        pdfres.results[0].id
      );

      const blob = new Blob([pdffile], { type: "application/pdf" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${userLog?.name}_${dayjs(date).format(
        "DD MMM YYYY"
      )}_${module}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExcel(false);
    } catch (error) {
      console.error("Error fetching or opening PDF:", error);
    }
    // setPDFAnchorEl(null);
  };

  const handleOpenExcel = async (id: any) => {
    setSubmissionId(id);
    try {
      const excelres = await getSubmissionLogByTag(Number(id), "xlsx");
      const excelfile = await getSubmissionLogByFileIndex(
        Number(id),
        excelres.results[0].id
      );
      console.log("excelfile", excelfile);

      const blob = new Blob([excelfile], { type: "application/vnd.ms-excel" });
      const urlfile = URL.createObjectURL(blob);
      setUrl(urlfile);
      setExcel(excelfile);

      // Gunakan FileReader untuk membaca file Excel dan tampilkan sebagai HTML
      const reader = new FileReader();
      reader.onload = function (e) {
        const array = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(array, { sheetRows: 20, type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const table = XLSX.utils.sheet_to_html(worksheet, {
          id: "tabeller",
          editable: true,
        });

        const styledHTML = `
          <style>
            table#styledTable {
              border-collapse: collapse;
              width: 100%;
              font-family: Arial, sans-serif;
            }
            td {
              border: 1px solid black;
            }
            th {
              background-color: #f2f2f2;
              color: black;
              padding: 8px;
              text-align: center;
              font-weight: bold;
            }
            td {
              padding: 8px;
              text-align: left;
              vertical-align: middle;
            }
            td[colspan] {
              text-align: center;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
          </style>
          ${table}
        `;

        setHTML(styledHTML);
        setIsExcel(true);
        setPreviewOpen(true);
      };
      reader.readAsArrayBuffer(excelfile);
    } catch (error) {
      console.error("Error fetching or opening Excel:", error);
    }
    // setExcelAnchorEl(null);
  };

  const handleReplayClick = (event: React.MouseEvent<HTMLElement>) => {
    if (isReplayMenuOpen) {
      setReplayAnchorEl(null);
    } else {
      setReplayAnchorEl(event.currentTarget);
    }
  };

  const handleReplaylUnclick = () => {
    setReplayAnchorEl(null);
  };

  const handleOpenReplay = async (id: any) => {
    setSubmissionId(id);
    try {
      const excelres = await getSubmissionLogByTag(
        Number(submissionId),
        "xlsx"
      );
      const excelfile = await getSubmissionLogByFileIndex(
        Number(submissionId),
        excelres.results[0].id
      );
      console.log("excelfile", excelfile);
      const blob = new Blob([excelfile], { type: "application/vnd.ms-excel" });
      const urlfile = URL.createObjectURL(blob);
      setExcel(excelfile);
      setUrl(urlfile);
      setPreviewOpen(true);
    } catch (error) {
      console.error("Error fetching or opening PDF:", error);
    }
    // setExcelAnchorEl(null);
  };

  const handleVideoPreview = () => {
    const video = fs.readFileSync(videopath);
    const blob = new Blob([video], { type: "video/mp4" });
    const urel = URL.createObjectURL(blob);
    setUrl(urel);
    setPreviewOpen(true);
  };
  const [getSubmission, setGetSubmission] = useState(false);

  const handleDelete = async (id: number) => {
    try {
      console.log("submissionId", submissionId);
      await deleteSubmissionById(id);
      setModalDeleteOpen(false);
      setReload(!reload);
    } catch (error) {
      console.error("Failed to publish the course:", error);
      toast.error(
        "Gagal menghapus modul karena modul ini memiliki modul penilaian",
        {
          position: "top-center",
        }
      );
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteSubmissionAll(userId);
      setModalDeleteAllOpen(false);
      setReload(!reload);
    } catch (error) {
      console.error("Failed to publish the course:", error);
      toast.error(
        "Gagal menghapus modul karena modul ini memiliki modul penilaian",
        {
          position: "top-center",
        }
      );
    }
  };

  useEffect(() => {
    const fetchUserLog = async () => {
      setIsLoading(true);
      try {
        const response = await getUserById(userId);
        const response2 = await getSubmissionList(userId, dateSort, trainSort);
        console.log("response2", response2);
        setSubmissionList(response2.results);
        setUserLog(response);

        const resRows = response2.results.map((submission: any) => ({
          id: submission.id,
          date: submission.createdAt,
          train: submission.objectType,
          start: submission.createdAt,
          finish: submission.finishedAt,
          status: submission.status,
          module: "",
          score: submission.score,
          scoring: "",
          courseId: submission.courseId,
        }));

        setRows(resRows);
        console.log(resRows);
        setGetSubmission(true);
      } catch (error) {
        console.error("Error fetching user log:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserLog();
    }
  }, [userId, reload, dateSort, trainSort]);

  useEffect(() => {
    if (getSubmission) {
      rows.map(async (row) => {
        const res = await getSubmissionById(Number(row.id));
        row.module = res.exam?.assessment?.judul_modul;
        row.scoring = res.exam?.assessment?.judul_penilaian;
        setRows([...rows]);
      });
      setGetSubmission(false);
    }
  }, [reload, getSubmission]);

  const userInfo = [
    { label: "Nama", value: userLog?.name },
    { label: "NIP", value: userLog?.username },
    { label: "Kedudukan", value: userLog?.bio.position },
    {
      label: "Tanggal Lahir",
      value: userLog?.bio.born
        ? dayjs(userLog?.bio.born).format("DD MMM YYYY")
        : "",
    },
  ];

  return (
    <Container w={1500} h={875}>
      <div className="flex flex-col p-6 h-full">
        <Dialog open={modalDeleteAllOpen}>
          <DialogTitle className="px-6 pt-6">
            HAPUS SEMUA LOG PESERTA
          </DialogTitle>
          <DialogContent className="w-[600px] px-6">
            <DialogContentText>
              Semua log peserta akan dihapuskan
            </DialogContentText>
          </DialogContent>
          <DialogActions className="px-6 pb-4">
            <Button
              onClick={() => setModalDeleteAllOpen(false)}
              color="primary"
            >
              Kembali
            </Button>
            <Button onClick={() => handleDeleteAll()} color="error">
              Hapus
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={modalDeleteOpen}
          // onSubmit={() => handleDelete(submissionId)}
        >
          <DialogTitle className="px-6 pt-6">HAPUS LOG PESERTA</DialogTitle>
          <DialogContent className="w-[600px] px-6">
            <DialogContentText>
              Log modul {submissionName} akan dihapus
            </DialogContentText>
          </DialogContent>
          <DialogActions className="px-6 pb-4">
            <Button onClick={() => setModalDeleteOpen(false)} color="primary">
              Kembali
            </Button>
            <Button onClick={() => handleDelete(submissionId)} color="error">
              Hapus
            </Button>
          </DialogActions>
        </Dialog>
        <h1 className="w-full text-center mb-2">Log Peserta</h1>
        <Box component="form" className="grid gap-4 w-full mb-2">
          <div className="title grid grid-cols-5 gap-4">
            {userInfo.map((info: any, index: any) => (
              <Tooltip
                key={index}
                placement="top"
                title={
                  <Typography sx={{ fontSize: "1.125rem", color: "white" }}>
                    {info.value || ""}
                  </Typography>
                }
              >
                <Typography
                  variant="body1"
                  className="truncate text-xl"
                  style={{ maxWidth: index === 3 ? "300px" : "340px" }}
                >
                  <b>{info.label}:</b> {info.value}
                </Typography>
              </Tooltip>
            ))}
            <div className="text-right">
              <Button
                className="w-fit"
                variant="contained"
                color="error"
                onClick={() => {
                  setModalDeleteAllOpen(true);
                }}
              >
                DELETE ALL
              </Button>
            </div>
          </div>
        </Box>

        <div className="flex items-center gap-2 mb-2">
          <div className="w-1/2 h-[300px] flex flex-col border border-solid">
            <div className="flex w-full h-1/5 justify-between">
              <div>
                <Typography className="pl-3 pt-2 text-xl">
                  Penyelesaian Modul:
                </Typography>
              </div>
              <div className="w-[329.44px]">
                <Tabs
                  value={activeDiagramTab}
                  onChange={handleDiagramTabChange}
                >
                  <Tab label="High Speed Train" />
                  <Tab label="Light Rail Transit" />
                </Tabs>
              </div>
            </div>
            {diagramData.length > 0 ? (
              <div className="flex items-center justify-center w-full h-full -mt-4 pb-4 flex-grow">
                <PieChart
                  series={[
                    {
                      innerRadius: 75,
                      outerRadius: 95,
                      data: adjustedPieDiagramData,
                    },
                  ]}
                  margin={{ right: 120 }}
                  width={460}
                  height={200}
                  slotProps={{
                    legend: {
                      hidden: false,
                      position: { vertical: "middle", horizontal: "right" },
                      direction: "column",
                    },
                  }}
                />
                {diagramData.length > 0 ? (
                  <Typography
                    className="absolute text-center text-2xl"
                    style={{ top: "223px", left: "285px" }}
                  >
                    {completionPercentage.toFixed(1)}%<br />
                    {completion} dari {totalModuls}
                    <br />
                    Modul
                  </Typography>
                ) : (
                  <Typography
                    className="absolute text-center text-xl"
                    style={{ top: "223px", left: "220px" }}
                  >
                    0%
                    <br />
                    {completion} Modul
                  </Typography>
                )}
                          
              </div>
            ) : (
              <div className="flex items-center justify-center w-full h-full -mt-4">
                <Typography className="text-xl">
                  Data log peserta tidak ditemukan
                </Typography>
              </div>
            )}
          </div>
          <div className="w-1/2 h-[300px] flex flex-col border border-solid">
            <div className="flex w-full h-1/5 justify-between">
              <div>
                <Typography className="pl-3 pt-2 text-xl">
                  Nilai Penyelesaian Modul Terbaik:
                </Typography>
              </div>
              <div className="w-[329.44px]">
                <Tabs value={activeModuleTab} onChange={handleModuleTabChange}>
                  <Tab label="High Speed Train" />
                  <Tab label="Light Rail Transit" />
                </Tabs>
              </div>
            </div>
            <div className="flex w-full h-4/5">
              {moduleData.length > 0 ? (
                <>
                  <div className="flex items-center justify-center w-full h-full pb-4 overflow-y-auto">
                    <div className="w-full h-full flex">
                      <div className="w-full h-full">
                        {levels.map((level, index) => (
                          <div
                            className="w-full h-1/3 flex items-center justify-center px-3 py-2"
                            key={index}
                          >
                            <div
                              className={`w-full h-full flex items-center justify-center border-2 border-solid rounded-3xl ${
                                level.checkstate
                                  ? "bg-[#1aaffb] text-white"
                                  : ""
                              }`}
                            >
                              <div className="w-1/6 h-1/2 flex items-center justify-center">
                                <Checkbox
                                  icon={<RadioButtonUncheckedIcon />}
                                  checkedIcon={
                                    <TaskAltIcon sx={{ color: "white" }} />
                                  }
                                  checked={level.checkstate}
                                  disabled
                                />
                              </div>
                              <div
                                className={`w-4/6 h-1/2 flex items-center text-lg ${
                                  level.checkstate ? "text-white" : ""
                                }`}
                              >
                                {level.title}
                              </div>
                              <div
                                className={`w-1/6 h-1/2 flex items-center text-lg ${
                                  level.checkstate ? "text-white" : ""
                                }`}
                              >
                                {level.score}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <Typography className="text-xl">
                    Data log peserta tidak ditemukan
                  </Typography>
                </div>
              )}
            </div>
          </div>
        </div>

        <TableContainer className="mb-8 h-[370px]" component={Paper}>
          <Table
            stickyHeader
            sx={{
              "& .MuiTableCell-sizeMedium": {
                padding: "14px 8px",
              },
            }}
            aria-label="Tabel Peserta"
          >
            <colgroup>
              <col width="13%" />
              <col width="8%" />
              <col width="12%" />
              <col width="23%" />
              <col width="23%" />
              <col width="5%" />
              <col width="11%" />
              <col width="5%" />
            </colgroup>
            <TableHead>
              <TableRow>
                <TableCell className="text-lg font-bold">
                  <Button
                    onClick={handleDateSort}
                    className="text-lg text-black font-bold w-full"
                    sx={{
                      textTransform: "none",
                      padding: "5px 2px",
                      border: "1px solid black",
                    }}
                  >
                    Tanggal <br />
                    Pengujian{" "}
                    {dateSort == "" ? (
                      <></>
                    ) : dateSort == "desc" ? (
                      <ExpandLessIcon
                        style={{ fontSize: 19, marginLeft: 12 }}
                      />
                    ) : (
                      <ExpandMoreIcon
                        style={{ fontSize: 19, marginLeft: 12 }}
                      />
                    )}
                  </Button>
                </TableCell>
                <TableCell className="text-lg font-bold">Status</TableCell>
                <TableCell>
                  <Button
                    onClick={handleTrainSort}
                    className="text-lg text-black font-bold"
                    sx={{
                      textTransform: "none",
                      padding: "5px 2px",
                      border: "1px solid black",
                      width: "140px",
                      textAlign: "center",
                      justifyContent: "center",
                    }}
                  >
                    {trainSort == ""
                      ? "Jenis Kereta"
                      : trainSort == "LRT"
                      ? "LRT"
                      : "KCIC"}
                  </Button>
                </TableCell>
                <TableCell className="text-lg font-bold">Modul</TableCell>
                <TableCell className="text-lg font-bold">Penilaian</TableCell>
                <TableCell className="text-lg font-bold">Nilai </TableCell>
                <TableCell className="text-lg font-bold">Hasil</TableCell>
                <TableCell className="text-lg font-bold">Replay</TableCell>
                <TableCell className="text-lg font-bold">Action</TableCell>
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
                      "&:last-child td, &:last-child th": { border: 0 },
                    }}
                  >
                    <TableCell className="text-lg">
                      {dayjs(row.date).format("DD MMM YYYY, HH:mm")}
                    </TableCell>
                    <TableCell className="text-lg">{row.status}</TableCell>
                    <TableCell className="text-lg">
                      {row.train === "KCIC"
                        ? "High Speed Train"
                        : row.train === "LRT"
                        ? "Light Rail Transit"
                        : row.train}
                    </TableCell>
                    <InteractableTableCell
                      content={row.module}
                      isEllipsisEnabled={isEllipsisEnabled}
                      width="314px"
                      textSize="1.125rem"
                    />
                    <InteractableTableCell
                      content={row.scoring}
                      isEllipsisEnabled={isEllipsisEnabled}
                      width="318px"
                      textSize="1.125rem"
                    />
                    <TableCell className="text-lg">{row.score}</TableCell>
                    <TableCell
                      align="center"
                      className="flex items-center gap-1 py-6"
                    >
                      <Button
                        type="button"
                        variant="outlined"
                        className="w-[60px]"
                        onClick={() => handleOpenPDF(row.id)}
                      >
                        PDF
                      </Button>
                      <Button
                        type="button"
                        variant="outlined"
                        className="w-[60px]"
                        onClick={() => handleOpenExcel(row.id)}
                      >
                        Excel
                      </Button>
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        type="button"
                        variant="outlined"
                        color="primary"
                        className="w-[60px] h-[36px]"
                        onClick={handleReplayClick}
                      >
                        {<PlayArrowIcon style={{ fontSize: 19 }} />}
                      </Button>
                      <Menu
                        anchorEl={replayAnchorEl}
                        open={Boolean(replayAnchorEl)}
                        onClose={handleReplaylUnclick}
                        PaperProps={{
                          style: {
                            width: "auto",
                            boxShadow: "none",
                            border: "1px solid rgba(0, 0, 0, 0.12)",
                          },
                        }}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "center",
                        }}
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "center",
                        }}
                      >
                        <MenuItem onClick={() => handleOpenReplay(row.id)}>
                          Preview
                        </MenuItem>
                        <MenuItem>Download</MenuItem>
                      </Menu>
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        color="error"
                        className="w-[60px]"
                        onClick={() => {
                          setModalDeleteOpen(true);
                          setSubmissionId(row.id);
                          setSubmissionName(row.module);
                        }}
                      >
                        DELETE
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
      <Dialog
        open={previewOpen}
        onClose={handlePreviewClose}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        maxWidth="lg"
        fullWidth
      >
        {!isExcel && (
          <iframe
            src={url}
            style={{ width: "100%", height: "1800px" }}
          ></iframe>
        )}
        {isExcel && <ExcelGrid file={excel} />}
      </Dialog>
    </Container>
  );
};

export default UserLog;
