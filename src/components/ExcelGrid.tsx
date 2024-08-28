import React, { useEffect, useRef, useState } from 'react';
import ExcelJS from 'exceljs';
import DownloadIcon from '@mui/icons-material/Download';
import {
    Button,
  } from '@mui/material';

interface ExcelGridProps {
    file: Blob;
}

const ExcelGrid = ({ file }: ExcelGridProps) => {
    const gridRef = useRef<HTMLDivElement>(null);
    const [htmlContent, setHtmlContent] = useState<string>('');

    useEffect(() => {
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const arrayBuffer = e.target.result as ArrayBuffer;

                // Initialize a new workbook and load the array buffer
                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.load(arrayBuffer);

                // Get the first worksheet
                const worksheet = workbook.worksheets[0];

                // Generate HTML from worksheet data
                let html = '<table border="1" style="width:100%; border-collapse:collapse;">';
                const mergeRowStart = 4; 
                const mergeRowEnd = 12;
                const mergeCols = [2, 6];

                worksheet.eachRow((row, rowNumber) => {
                    const cellValues = Array.isArray(row.values) ? row.values.slice(1) : [];
                    const isHeaderRow = cellValues.some(value => value === 'No');

                    html += `<tr style="${isHeaderRow ? 'background-color: black; color: white;' : ''}">`;
                    let lastCellValue: any = null;
                    let colspan = 1;

                    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                        let cellValue = cell.value;
                        if (typeof cellValue === 'boolean' || typeof cellValue === 'number') {
                            cellValue = cellValue.toString();
                        } else if (cellValue === null || cellValue === undefined) {
                            cellValue = '';
                        }

                        // Check if the current cell value matches the last cell value for horizontal merge
                        if (cellValue === lastCellValue) {
                            colspan++;
                        } else {
                            if (lastCellValue !== null) {
                                html += `<td colspan="${colspan}" style="text-align: center; font-weight: normal; font-size: 15px;">${lastCellValue}</td>`;
                            }
                            lastCellValue = cellValue;
                            colspan = 1;
                        }

                        // For the last cell in the row or if it's a header row
                        if (colNumber === row.cellCount) {
                            html += `<td colspan="${colspan}" style="text-align: ${cell.alignment?.horizontal || 'center'}; font-weight: ${cell.font?.bold ? 'bold' : 'normal'}; font-size: ${(cell.font?.size + 3) || 12}px;">${cellValue}</td>`;
                        }
                    });

                    html += '</tr>';

                    // Handle vertical merging for rows 3-11 in columns 1 and 5
                    if (rowNumber >= mergeRowStart && rowNumber <= mergeRowEnd) {
                        for (const col of mergeCols) {
                            if (rowNumber > mergeRowStart && row.getCell(col).value === '') {
                                // Skip empty cells in the column
                                const previousCellValue = worksheet.getRow(rowNumber - 1).getCell(col).value;
                                if (previousCellValue !== '') {
                                    // Merge the cell vertically
                                    html = html.replace(/<\/tr>\s*$/, `<td rowspan="${mergeRowEnd - mergeRowStart + 1}" style="background-color: white; text-align: center;">${previousCellValue}</td></tr>`);
                                }
                            }
                        }
                    }
                });

                html += '</table>';

                setHtmlContent(html);
            };
            reader.readAsArrayBuffer(file);
        }
    }, [file]);

    const handleDownload = () => {
        const url = window.URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Submisi Peserta.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div ref={gridRef} style={{ height: '1800px', width: '100%', overflow: 'auto' }}>
            <div className='h-12 w-full p-6 flex justify-end items-center'>Unduh file excel:
                <Button
                    type="button"
                    onClick={handleDownload}
                    style={{
                        padding: 0,
                        minWidth: 'auto',
                        backgroundColor: 'transparent',
                        border: 'none',
                        boxShadow: 'none',
                    }}
                    className='ml-2'
                    >
                    <DownloadIcon style={{ fontSize: 21, color: 'black' }} />
                </Button>
            </div>
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>
    );
};

export default ExcelGrid;
