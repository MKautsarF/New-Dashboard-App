import React, { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// import { default as mrtjson } from '@/static/MockJSON_MRT.json';
import Container from "../components/Container";
import LangkahKerja from "../components/LangkahKerja";
// import Logo from "@/components/Logo";
import {
  Alert,
  AlertColor,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  TextField,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import {
  formatDurationToString,
  getFilenameSafeDateString,
} from "../utils/datestring";

import FullPageLoading from "../components/FullPageLoading";
import { shell } from "electron";
import {
  handleClientDisconnect,
  sendTextToClients,
  server,
  socketClients,
} from "@/socket";
import dayjs from "dayjs";
import { useSettings, useSettingsKCIC } from "../context/settings";
import { useAuth } from "../context/auth";
import { Assessment, EditNoteRounded, EditNoteSharp, Stop } from "@mui/icons-material";
import { getScoringDetail } from "@/services/scoring.services";
import { getUserById } from "@/services/user.services";
import { cancelSubmissionById, uploadLogSubmission } from "@/services/submission.services";
import fs from "fs";

import { finishSubmissionById } from "@/services/submission.services";
import { set } from "lodash";
import { getCourseByID } from "@/services/course.services";

interface TableRow {
  content: string | number;
  rowSpan?: number;
  colSpan?: number;
  styles?: {
    textDecoration?: string;
    halign?: "center";
    fillColor?: [number, number, number];
    [key: string]: any;
  };
}

interface ToastData {
  severity: AlertColor;
  msg: string;
}

function useQuery() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}

function Review() {
  const query = useQuery();
  const ExcelJS = require("exceljs");
  const navigate = useNavigate();
  const { instructor } = useAuth();
  const { settings } = useSettings();

  const [simulation, setSimulation] = useState(true);
  const [url, setUrl] = useState<string>("");

  const submissionId = query.get("submissionId");
  const courseId = query.get("courseId");
  const trainType = query.get("trainType");


  const [json, setJson] = useState<any>();
  const [realTimeNilai, setRealTimeNilai] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [totalScore, setTotalScore] = useState(null);
  const [toastData, setToastData] = useState<ToastData>({
    severity: "error",
    msg: "",
  });
  const scoringID = query.get("scoringId");

  // Notes
  const [notes, setNotes] = useState("");
  const [notesOpen, setNotesOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const startTime = useMemo(() => dayjs(), []);
  const [peserta, setPeserta] = useState<any>();

  useEffect(() => {
    async function fetchData() {
      try {
        // setIsLoading(true);
        const res = await getScoringDetail(scoringID);
        const res2 = await getUserById(localStorage.getItem('selectedPesertaId'));
        const res3 = await getCourseByID(courseId);
        console.log("res", res);
        console.log("res3", res3);
        setJson(res);
        setPeserta(res2);
        setCourseName(res3.title);
        // console.log("trainee", res2);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    }
    fetchData();
  }
), [];
  

  const handleFinish = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNotesOpen(false);
    const { currentTarget } = e;

    try {
      setIsLoading(true);
      const endTime = dayjs();
      
      // Get input data from form
      const data = new FormData(currentTarget);
      const inputValues = data.getAll("penilaian");
      
      // Copy krl json mock template
      const jsonToWrite = {
        ...json,
        judul_modul: courseName,
      };
      
      // Write metadata
      // * Time
      jsonToWrite.waktu_mulai = startTime.format("HH.mm");
      jsonToWrite.waktu_selesai = endTime.format("HH.mm");
      
      const diff = endTime.diff(startTime, "second");
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      
      jsonToWrite.durasi = formatDurationToString(hours, minutes, seconds);
      jsonToWrite.tanggal = startTime.format("DD/MM/YYYY");
      
      // * Crew data
      jsonToWrite.nama_crew = peserta.name;
      jsonToWrite.kedudukan =
      (peserta.bio && peserta.bio.position) || "";
      jsonToWrite.usia = `${
        peserta.bio && peserta.bio.born
        ? Math.abs(dayjs(peserta.bio.born).diff(dayjs(), "years"))
        : "-"
      } tahun`;
      jsonToWrite.kode_kedinasan =
      peserta.username ||
      "";
      
      // * Train data
      jsonToWrite.train_type = trainType.toUpperCase();
      jsonToWrite.id_pengaturan
      
      jsonToWrite.no_ka = "-";
      jsonToWrite.lintas =
      settings.stasiunAsal + " - " + settings.stasiunTujuan;
      
      // * Instructor data
      jsonToWrite.nama_instruktur = instructor.name;
      
      // * Notes
      jsonToWrite.keterangan = notes === "" ? "-" : notes;
      
      // Write actual nilai to the copied krl json
      let jsonIdx = 0;
      
      jsonToWrite.penilaian.forEach((penilaian: any, i: number) => {
        // console.log('reading penilaian array');
        penilaian.data.forEach((data: any, j: number) => {
          // console.log('reading data array');
          data.poin.forEach((poin: any, k: number) => {
            // console.log('reading poin array');
            if (poin.nilai !== null) {
              poin.nilai = Number(inputValues[jsonIdx]);
              jsonIdx += 1;
            }
          });
        });
      });
      
      // nilai skor akhir
      jsonToWrite.nilai_akhir = realTimeNilai < 0 ? 0 : realTimeNilai;
      
      
      //generate pdf
      let pdfname = null;
      let excelname = null;
      pdfname = generatePDF(jsonToWrite);
      await generateExcel(jsonToWrite).then((excel) => {
        excelname = excel;
      });
      const res = await finishSubmission(jsonToWrite, pdfname.pdfBuffer, pdfname.score, excelname);

      // Save file to local

      // console.log("tes");
      const dir = "C:/Train Simulator/Data/penilaian";

      navigate(`/finishLRT?&submissionId=${submissionId}&url=${url}&trainType=${trainType}`);

    } catch (e) {
      console.error(e);
      setToastData({
        severity: "error",
        msg: `Failed to save scores. Please try again later.`,
      });
      setOpen(true);
    } finally {
      setIsLoading(false);
      sendTextToClients(JSON.stringify({ status: "finish" }, null, 2));
    }
  };
  
  const finishSubmission = async (jsonToWrite: any, pdfbuf: any, score: number, excelbuf:any) => {
    try {
      console.log("totalScore2", totalScore);
      const payload = {
        score : score,
        assessment : jsonToWrite
      }
      console.log("payload", payload);
      const res = await finishSubmissionById(Number(submissionId), payload);
      console.log("Finish button clicked");   
      console.log("Submission finished:", res);
      const formData = new FormData();
      console.log("pdfbuf", pdfbuf);
      const blob = new Blob([pdfbuf], { type: 'application/pdf' });  // or any other appropriate MIME type
      setUrl(URL.createObjectURL(blob));
      formData.append("file", blob, "data.pdf");
      formData.append("tag", "pdf");
      const resPDF = await uploadLogSubmission(Number(submissionId), formData);
      console.log(resPDF);
      const blobExcel = new Blob([excelbuf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' });  // or any other appropriate MIME type
      const formDataExcel = new FormData();
      formDataExcel.append("file", blobExcel, "data.xlsx");
      formDataExcel.append("tag", "xlsx");
      const resExcel = await uploadLogSubmission(Number(submissionId), formDataExcel);
      console.log(resExcel);
    } catch (error) {
      console.error(error);
    }
  }

  const handleConfirmedCancel = async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      setIsLoading(true);
      const endTime = dayjs();
    
      // Copy krl json mock template
      const jsonToWrite = {
        ...json,
        judul_modul: courseName,
      };
      
      // Write metadata
      // * Time
      jsonToWrite.waktu_mulai = startTime.format("HH.mm");
      jsonToWrite.waktu_selesai = endTime.format("HH.mm");
      
      const diff = endTime.diff(startTime, "second");
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      
      jsonToWrite.durasi = formatDurationToString(hours, minutes, seconds);
      jsonToWrite.tanggal = startTime.format("DD/MM/YYYY");
      
      // * Crew data
      jsonToWrite.nama_crew = peserta.name;
      jsonToWrite.kedudukan =
      (peserta.bio && peserta.bio.position) || "";
      jsonToWrite.usia = `${
        peserta.bio && peserta.bio.born
        ? Math.abs(dayjs(peserta.bio.born).diff(dayjs(), "years"))
        : "-"
      } tahun`;
      jsonToWrite.kode_kedinasan =
      peserta.username ||
      "";
      
      // * Train data
      jsonToWrite.train_type = trainType.toUpperCase();
      jsonToWrite.id_pengaturan
      
      jsonToWrite.no_ka = "-";
      jsonToWrite.lintas =
      settings.stasiunAsal + " - " + settings.stasiunTujuan;
      
      // * Instructor data
      jsonToWrite.nama_instruktur = instructor.name;
      
      // * Notes
      jsonToWrite.keterangan = notes === "" ? "-" : notes;
      
      // Write actual nilai to the copied krl json
      let jsonIdx = 0;
      
      // nilai skor akhir
      jsonToWrite.nilai_akhir = realTimeNilai < 0 ? 0 : realTimeNilai;
      
      
      const res = await cancelSubmission(jsonToWrite);

      // Save file to local

      // console.log("tes");
      const dir = "C:/Train Simulator/Data/penilaian";

      // navigate(`/finishLRT?&submissionId=${submissionId}&url=${url}&trainType=${trainType}`);
      // navigate('/SecondPage');

    } catch (e) {
      console.error(e);
      setToastData({
        severity: "error",
        msg: `Failed to save scores. Please try again later.`,
      });
      setOpen(true);
    } finally {
      setIsLoading(false);
      sendTextToClients(JSON.stringify({ status: "canceled" }, null, 2));
      navigate('/SecondPage');
    }
  };

  const cancelSubmission = async (jsonToWrite: any) => {
    try {
      const payload = {
        score : "",
        assessment : jsonToWrite
      }
      const res = await cancelSubmissionById(Number(submissionId), payload);
    } catch (error) {
      console.error(error);
    }
  }


  const generatePDF = (json: any) => {
    const doc = new jsPDF();

    let nilaiAkhir = 0;
    let nilaiUnit = 0;
    let totalUnit = 0;
    let totalData = 0;
    let nilaiData = 0;

    const addHeader = (doc: any, title: any) => {
      doc.setFontSize(20);
      doc.text(title, doc.internal.pageSize.getWidth() / 2, 15, {
        align: "center",
      });
      doc.setFontSize(12);
      doc.setLineWidth(0.5);
      doc.text("Mulai: " + json.waktu_mulai, 11, 27);
      doc.text("Selesai: " + json.waktu_selesai, 60, 27);
      doc.text("Durasi: " + json.durasi, 110, 27);
      doc.text("Tanggal: " + json.tanggal, 160, 27);
      doc.line(10, 30, doc.internal.pageSize.getWidth() - 10, 30); // Horizontal line
    };

    const addUnit = (unit: any, startY: number) => {
      // let nilaiUnit = 0;

      if (!unit.disable) {
        totalUnit++;
      }
      doc.setFontSize(16);
      doc.text("Unit Kompetensi " + unit.unit, 14, startY);
      doc.setFontSize(12);
      doc.text(unit.judul, 14, startY + 5);

      // Initialize body data for the entire unit
      const unitBodyData: TableRow[][] = [];

      // Iterate through each data in the unit and add rows to unitBodyData
      let currentY = startY + 15;
      unit.data.forEach((datas: any) => {
        const { bodyData, rataRataRow } = addData(datas);
        unitBodyData.push(...bodyData);
        unitBodyData.push(rataRataRow); // Add rata-rata langkah kerja row
        nilaiData = 0;
      });

      // Calculate the average nilai for the unit
      let rataRataUnit = nilaiUnit / totalData;
      if (totalData == 0) {
        rataRataUnit = 0;
      }
      nilaiAkhir += rataRataUnit;

      const rataRataUnitRow: TableRow[] = [
        {
          content: "Rata-rata Unit " + unit.unit,
          colSpan: 3,
          styles: { fillColor: [220, 220, 220], fontStyle: "bold" },
        },
        {
          content: rataRataUnit.toFixed(2),
          styles: { fillColor: [220, 220, 220], fontStyle: "bold" },
        },
      ];

      // Add rata-rata unit row to unitBodyData
      unitBodyData.push(rataRataUnitRow);

      // Add the combined table for the unit
      (doc as any).autoTable({
        startY: currentY,
        head: [["No", "Langkah Kerja", "Poin Observasi", "Penilaian"]],
        headStyles: {
          fillColor: [74, 73, 72],
          lineColor: [0, 0, 0],
          textColor: [255, 255, 255],
        },
        body: unitBodyData,
        theme: "grid",
        styles: {
          fontSize: 12,
          textColor: [0, 0, 0],
          lineWidth: 0.3,
          lineColor: [0, 0, 0],
          cellPadding: { right: 5, top: 2, bottom: 2, left: 2 },
        },

        didDrawCell: (data: any) => {
          const { row, column, cell } = data;
          const cellContent = cell.text.join(" ");
          const cellWidth = cell.width - 5;
          const textLines = doc.splitTextToSize(cellContent, cellWidth);
          const numberOfLines = textLines.length;

          // Calculate rowIndex and poinIndex
          let currentDataIndex = 0;
          let currentRowCount = 0;
          for (let i = 0; i < unit.data.length; i++) {
            currentRowCount += unit.data[i].poin.length + 1; // Add 1 for the rata-rata langkah kerja row
            if (data.row.index < currentRowCount) {
              currentDataIndex = i;
              break;
            }
          }
          const rowIndex = currentDataIndex;
          const poinIndex =
            data.row.index -
            (currentRowCount - (unit.data[rowIndex].poin.length + 1)) +
            1;

          // Check if it's within the body section and meets your condition
          if (data.row.section === "body") {
            // Check if the content of langkah_kerja or poin.observasi/nilai contains "line-through"
            if (column.index == 3) {
              const rataRataCell = data.table.body[data.row.index].cells[0];
              console.log("rataRataCell: ", rataRataCell);
              // check RatarataCel is not defined
              if (rataRataCell != undefined) {
                // check if the cell.text contains "Rata-rata"....
                if ((rataRataCell.text[0] = "R")) {
                  const langkahKerja = unit.data[rowIndex]?.disable;
                  if (langkahKerja) {
                    console.log(
                      "yang ini yg rata row: ",
                      data.row.index,
                      "column: ",
                      data.column.index,
                      "cell: ",
                      cellContent,
                      "numberOfLines: ",
                      numberOfLines
                    );
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(1);
                    for (let i = 0; i < numberOfLines; i++) {
                      const linewidth = doc.getTextWidth(textLines[i]);
                      doc.line(
                        cell.x + 1,
                        cell.y + 4 + i * 5,
                        cell.x + linewidth + 3,
                        cell.y + 4 + i * 5
                      );
                    }
                  }
                }
              }
            }
            if (column.index <= 1) {
              const langkahKerja = unit.data[rowIndex]?.disable;
              if (langkahKerja) {
                console.log(
                  "row: ",
                  data.row.index,
                  "column: ",
                  data.column.index,
                  "cell: ",
                  cellContent,
                  "numberOfLines: ",
                  numberOfLines
                );
                doc.setDrawColor(0, 0, 0);
                doc.setLineWidth(1);
                for (let i = 0; i < numberOfLines; i++) {
                  const linewidth = doc.getTextWidth(textLines[i]);
                  doc.line(
                    cell.x + 1,
                    cell.y + 4 + i * 5,
                    cell.x + linewidth + 3,
                    cell.y + 4 + i * 5
                  );
                }
              }
            } else if (column.index === 2 || column.index === 3) {
              const observasi =
                unit.data[rowIndex]?.poin?.[poinIndex - 1]?.disable; // Adjust poinIndex for rata-rata row
              if (observasi) {
                doc.setDrawColor(0, 0, 0);
                doc.setLineWidth(1);
                for (let i = 0; i < numberOfLines; i++) {
                  const linewidth = doc.getTextWidth(textLines[i]);
                  doc.line(
                    cell.x + 1,
                    cell.y + 4 + i * 5,
                    cell.x + linewidth + 3,
                    cell.y + 4 + i * 5
                  );
                }
              }
            }
          }
        },
      });
    };

    const addData = (
      datas: any
    ): { bodyData: TableRow[][]; rataRataRow: TableRow[] } => {
      const bodyData: TableRow[][] = [];

      if (!datas.disable) {
        totalData++;
      }

      // Add the first row with rowspan
      bodyData.push([
        { content: datas.no + ".", rowSpan: datas.poin.length },
        { content: datas.langkah_kerja, rowSpan: datas.poin.length },
        { content: datas.poin[0].observasi },
        { content: datas.poin[0].nilai.toString() },
      ]);

      let totalPoin = 0;

      if (!datas.poin[0].disable) {
        nilaiData += datas.poin[0].nilai;
        totalPoin++;
      }

      // Add remaining rows for poin
      for (let i = 1; i < datas.poin.length; i++) {
        if (!datas.poin[i].disable) {
          nilaiData += datas.poin[i].nilai;
          totalPoin++;
        }

        bodyData.push([
          { content: datas.poin[i].observasi },
          { content: datas.poin[i].nilai.toString() },
        ]);
      }

      let averageNilai = nilaiData / totalPoin;
      if (totalPoin == 0) {
        averageNilai = 0;
      }

      nilaiUnit += averageNilai;

      // Create the "Rata-Rata Langkah Kerja" row
      const rataRataRow: TableRow[] = [
        {
          content: "Rata-rata Langkah Kerja " + datas.no,
          colSpan: 3,
          styles: { fillColor: [220, 220, 220] },
        },
        {
          content: averageNilai.toFixed(2),
          styles: { fillColor: [220, 220, 220] },
        },
      ];

      return { bodyData, rataRataRow };
    };

    // Add header to the first page
    addHeader(doc, "Hasil Simulasi Penilaian " + json.train_type);
    let totalScore = 0;
    doc.setFontSize(16);
    doc.text("Overview", 14, 40);

    const mergedRowSimulasi = [
      {
        content: "Simulasi",
        colSpan: 3,
        styles: { halign: "center", fillColor: [220, 220, 220] },
      },
    ];

    const mergedRowPeserta = [
      {
        content: "Peserta",
        colSpan: 3,
        styles: { halign: "center", fillColor: [220, 220, 220] },
      },
    ];

    autoTable(doc, {
      startY: 45,
      head: [["No", "Overview", "Keterangan"]],
      headStyles: { fillColor: [74, 73, 72], textColor: [255, 255, 255] },
      body: [
        [1, "Nama Crew", json.nama_crew],
        [2, "NIP", json.kode_kedinasan],
        [3, "Kedudukan", json.kedudukan],
        [4, "Usia", json.usia],
        [5, "No KA", json.no_ka],
        [6, "Lintas", json.lintas],
        [7, "Nama Instruktur", json.nama_instruktur],
        [8, "Keterangan", json.keterangan],
      ],
      theme: "grid",
      styles: {
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
        fontSize: 12,
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 60 },
        2: { cellWidth: doc.internal.pageSize.getWidth() - 103 },
      },
    });

    doc.addPage();
    doc.setFontSize(20);
    // (doc as any).setFontStyle('bold')
    doc.text("Penilaian", 14, 20);
    // (doc as any).setFontStyle('normal')
    let startY = 30;
    doc.setFontSize(14);

    json.penilaian.forEach((unit: any, index: number) => {
      if (index > 0) {
        doc.addPage();
        startY = 20;
      }

      addUnit(unit, startY);
      nilaiUnit = 0;
      totalData = 0;
      startY += 10;

      startY = (doc as any).lastAutoTable.finalY + 10; // Adjust the spacing as needed
    });

    let averageAkhir = nilaiAkhir / totalUnit;
    if (totalUnit == 0) {
      averageAkhir = 0;
    }

    // convert average akhir to 2 decimal
    averageAkhir = Math.floor(averageAkhir * 10) / 10;
    const averageTotal = (averageAkhir + json.nilai_akhir) / 2;
    setTotalScore(averageTotal);
    console.log("averagetotal",averageTotal)
    console.log("totalscore1", totalScore);
    doc.addPage();
    doc.setFontSize(20);
    doc.text("Rata-rata Total Penilaian", 14, 20);
    doc.setFontSize(14);
    autoTable(doc, {
      startY: 30,
      body: [
        [
          { content: "Rata-rata Total Penilaian Manual " },
          { content: averageAkhir.toFixed(2) },
        ],
        [
          { content: "Rata-rata Total Penilaian Simulasi " },
          { content: json.nilai_akhir },
        ],
        [
          { content: "Rata-rata Total Penilaian Keseluruhan " },
          { content: averageTotal.toFixed(2) },
        ],
      ],
      theme: "grid",
      styles: {
        fontSize: 12,
        fillColor: [220, 220, 220],
        textColor: [0, 0, 0],
        lineWidth: 0.3,
        lineColor: [0, 0, 0],
      },
    });

    
    //rounding averageTotal to integer
    const score = Math.round(averageTotal);
    
    const pdfBuffer = doc.output("blob");
    console.log("pdfBuffer", pdfBuffer);
    return {pdfBuffer, score};
    
  };

  async function uploadPDF(formData: FormData) {
    try {
      const res = await uploadLogSubmission(Number(submissionId), formData);
      console.log("PDF uploaded:", res);
    }
    catch (error) {
      console.error(error);
    }
  }

  async function generateExcel(json: any) {
    try {
      let totalData = 0;
      let totalUnit = 0;
      let nilaiAkhir = 0;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Tasks Data", {
        pageSetup: { paperSize: 9, orientation: "landscape" },
        headerFooter: {
          firstHeader: "Hello Exceljs",
          firstFooter: "Hello World",
        },
      });

      let rowIndex = 2;

      // Add header to the first page
      worksheet.mergeCells("A1:G1");

      worksheet.getCell("A1").value =
        "Hasil Simulasi Penilaian " + json.train_type;
      worksheet.getCell("A1").alignment = { horizontal: "center" };
      worksheet.getCell("A1").font = { bold: true, size: 20 };

      worksheet.mergeCells("A3:G3");
      worksheet.getCell("A3").value = "Data Diri";
      worksheet.getCell("A3").font = { bold: true, size: 16 };

      worksheet.addTable({
        name: "DataDiri",
        ref: "C4",
        headerRow: true,
        totalsRow: false,
        style: {
          theme: "TableStyleLight8",
          showRowStripes: false,
        },
        columns: [
          { name: "No", filterButton: false },
          { name: "Data Diri", filterButton: false },
          { name: "Keterangan", filterButton: false },
        ],
        rows: [
          [1, "Nama Crew", json.nama_crew],
          [2, "NIP", json.kode_kedinasan],
          [3, "Kedudukan", json.kedudukan],
          [4, "Usia", json.usia],
          [5, "No KA", json.no_ka],
          [6, "Lintas", json.lintas],
          [7, "Nama Instruktur", json.nama_instruktur],
          [8, "Keterangan", json.keterangan],
        ],
      });

      const table1 = worksheet.getTable("DataDiri");
      table1.totalsRow = false;
      table1.commit();

      rowIndex = worksheet.actualRowCount + 3;
      const startRef = "A" + rowIndex;
      worksheet.mergeCells(startRef + ":G" + rowIndex);
      worksheet.getCell(startRef).value = "Penilaian";
      worksheet.getCell(startRef).font = { bold: true, size: 16 };
      worksheet.getCell(startRef).alignment = { horizontal: "center" };

      rowIndex += 2;

      worksheet.columns.forEach((column: any) => {
        column.width = 30;
        column.alignment = { horizontal: "center" };
      });
      for (let i = 0; i < json.penilaian.length; i++) {
        let totalRow = 0;
        let unit = json.penilaian[i];
        const bodyData = [];
        const startRef = "A" + rowIndex;
        worksheet.mergeCells(startRef + ":G" + rowIndex);
        worksheet.getCell(startRef).value = "Unit Kompetensi " + unit.unit;
        worksheet.getCell(startRef).font = { bold: true, size: 14 };
        worksheet.getCell(startRef).alignment = { horizontal: "center" };
        rowIndex += 2;
        // let startIndex = 0;
        for (let j = 0; j < unit.data.length; j++) {
          let data = unit.data[j];
          bodyData.push([
            data.no,
            data.langkah_kerja,
            data.bobot,
            data.poin[0].observasi,
            data.poin[0].nilai,
            data.poin[0].disable,
            data.poin[0].bobot,
          ]);
          totalRow++;
          for (let i = 1; i < data.poin.length; i++) {
            totalRow++;
            // startIndex++;
            bodyData.push([
              "",
              "",
              "",
              data.poin[i].observasi,
              data.poin[i].nilai,
              data.poin[i].disable,
              data.poin[i].bobot,
            ]);
          }
        }
        worksheet.addTable({
          name: "Data" + i.toString(),
          ref: "A" + rowIndex,
          headerRow: true,
          totalsRow: false,
          style: {
            theme: "TableStyleLight8",
            showRowStripes: false,
          },
          columns: [
            { name: "No", filterButton: false },
            { name: "Langkah Kerja", filterButton: false },
            { name: "Bobot Langkah Kerja", filterButton: false },
            { name: "Poin Observasi", filterButton: false },
            {
              name: "Penilaian",
              filterButton: false,
              totalsRowFunction: "average",
            },
            { name: "disable", filterButton: false },
            { name: "bobot Poin", filterButton: false },
          ],
          rows: bodyData,
        });
        worksheet.eachRow(
          { includeEmpty: false },
          (row: any, rowNumber: any) => {
            const currentCell = row._cells;
            if (rowNumber >= rowIndex && rowNumber < rowIndex + totalRow + 1) {
              currentCell.forEach((singleCell: any) => {
                const cellAddress = singleCell._address;
                worksheet.getCell(cellAddress).alignment = { wrapText: true };
              });
            }
          }
        );
        let indexborder = rowIndex;
        for (let i = 0; i < unit.data.length; i++) {
          indexborder += unit.data[i].poin.length;
          worksheet.getRow(indexborder).eachCell((cell: any) => {
            cell.border = {
              bottom: { style: "thick" },
            };
          });
        }
        rowIndex += totalRow + 2;
      }

      // worksheet.getColumn(0).width = 5;

      const buf = await workbook.xlsx.writeBuffer();
      return buf;
    } catch (err) {
      console.log(err);
    }
  }

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  useEffect(() => {
    server.on("connection", (socket) => {
      console.log("Client connected - in start mode");

      // Add the new client socket to the array
      socketClients.push(socket);

      socket.on("data", (data) => {
        const stringData = data.toString();
        const payload = stringData.split("|").slice(-1)[0];
        const jsonData = JSON.parse(payload);

        console.log("received data: ", jsonData);

        if (jsonData.id === "K1.1.1") {
          setRealTimeNilai(Number(jsonData.nilai));
        }
      });

      socket.on("end", () => {
        console.log("Client disconnected");
        handleClientDisconnect(socket);
      });

      socket.on("error", (err) => {
        console.error("Socket error:", err.message);
        handleClientDisconnect(socket);
      });
    });

    socketClients.forEach((socket) => {
      socket.on("data", (data) => {
        const stringData = data.toString();
        const payload = stringData.split("|").slice(-1)[0];
        const jsonData = JSON.parse(payload);

        if (jsonData.id === "M1.1.1") {
          setRealTimeNilai(Number(jsonData.nilai));
        }
      });
    });

    return () => {
      socketClients.forEach((socket) => {
        socket.removeAllListeners("data");
      });
    };
  }, []);

  return (
    <Container w={1000}>
      {/* <div className="w-1/3 absolute -translate-y-full py-4">
        <Logo />
      </div> */}
      <div className="p-6 overflow-y-auto">
        <h1
          className="w-full text-center mb-8"
          style={{ fontSize: "2rem", fontWeight: "bold" }}
        >
          Penilaian Kereta: {courseName}
        </h1>

        <section className="w-full flex flex-col gap-2 items-center justify-center p-4 mb-4 bg-blue-100">
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            Nilai Simulasi
          </h2>
          <p className="text-3xl w-16 h-16 border-solid border-2 rounded-2xl border-white flex items-center justify-center">
            {realTimeNilai < 0 ? "0" : realTimeNilai}
          </p>
        </section>

        {/* Looping penilaian */}
        <Box component="form" id="penilaian-form" onSubmit={handleFinish}>
          <div>
            {json?.penilaian.map((nilai: any, i: number) => (
              <section key={nilai.unit} className="pt-8 text-left ">
                <h2
                  style={{ fontSize: "1.5rem", fontWeight: "bold" }}
                  className="pb-4"
                >
                  Unit Kompetensi {nilai.unit}:
                </h2>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
                  {nilai.judul}
                </h2>
                {nilai.data.map((data: any, idx: number) => (
                  <LangkahKerja key={idx} keyVal={idx} data={data} />
                ))}
              </section>
            ))}
          </div>
        </Box>

        <div className="flex w-full justify-center items-center fixed bottom-0 left-0 shadow-lg">
          <div className="w-[600px] rounded-full flex px-4 py-3 mb-4 border-2 border-solid border-blue-400 bg-slate-50">
            {/* nav */}
            <div className="flex gap-4 justify-between w-full">
              <Button
                variant="text"
                color="error"
                // onClick={() => {
                //   if (simulation) {
                //     setSimulation(false);
                //     sendTextToClients(
                //       JSON.stringify({ status: "finish" }, null, 2)
                //     );
                //   }
                //   navigate("/SecondPage");
                // }}
                onClick={() => setCancelOpen(true)}
                sx={{
                  color: "#df2935",
                  borderColor: "#df2935",
                  // backgroundColor: "#ffffff",
                  "&:hover": {
                    borderColor: "#df2935",
                    backgroundColor: "#df2935",
                    color: "#ffffff",
                  },
                }}
              >
                Batal
              </Button>

              <Button
                className="ml-auto"
                // startIcon={<Stop />}
                variant="outlined"
                disabled={!simulation}
                onClick={() => {
                  setSimulation(false);
                  sendTextToClients(
                    JSON.stringify({ status: "finish" }, null, 2)
                  );
                }}
                sx={{
                  color: "#ffffff",
                  borderColor: "#df2935",
                  backgroundColor: "#df2935",
                  "&:hover": {
                    borderColor: "#b2212a",
                    backgroundColor: "#b2212a",
                    color: "#ffffff",
                  },
                }}
              >
                Stop Simulasi
              </Button>

              <Button
                variant="text"
                className="ml-auto"
                type="button"
                onClick={() => setNotesOpen(true)}

                sx={{
                  color: "#00a6fb",
                  borderColor: "#00a6fb",
                  "&:hover": {
                    borderColor: "#00a6fb",
                    backgroundColor: "#00a6fb",
                    color: "#ffffff",
                  },
                }}
              >
                Selesai
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Notes dialog */}
      <Dialog open={notesOpen} onClose={() => setNotesOpen(false)}>
        <DialogContent className="w-96">
          <TextField
            autoFocus
            multiline
            id="notes"
            label="Catatan penilaian (opsional)"
            fullWidth
            value={notes}
            onChange={(e) => setNotes(e.currentTarget.value)}
            variant="standard"
            rows={4}
          />
        </DialogContent>
        <DialogActions className="mb-2 mx-2">
          <Button onClick={() => setNotesOpen(false)} color="error">
            Kembali
          </Button>
          <Button type="submit" form="penilaian-form" variant="contained">
            Selesai
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel dialog */}
      <Dialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        aria-labelledby="cancel-dialog-title"
        aria-describedby="cancel-dialog-description"
        className="p-6"
      >
        <DialogTitle id="cancel-dialog-title">Konfirmasi Batal Simulasi</DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-dialog-description">
            Apakah Anda yakin ingin membatalkan simulasi?
          </DialogContentText>
        </DialogContent>
        <DialogActions className="flex p-6 justify-between w-full">
          <Button 
            onClick={() => setCancelOpen(false)}
            color="primary"
          >
            Tidak
          </Button>
          <Button 
            onClick={handleConfirmedCancel} color="error" variant="outlined"
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
          >
            Ya
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Alert
          onClose={handleClose}
          severity={toastData.severity}
          sx={{ width: "100%" }}
        >
          {toastData.msg}
        </Alert>
      </Snackbar>

      <FullPageLoading loading={isLoading} />
    </Container>
  );
}

export default Review;
