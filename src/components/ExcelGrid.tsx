import React, { useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import CanvasDatagrid from "canvas-datagrid";

interface ExcelGridProps {
    file: Blob;
}

const ExcelGrid = ({ file }: ExcelGridProps) => {
    const gridRef = useRef(null);
    const [data, setData] = useState([]);
  
    useEffect(() => {
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const arrayBuffer = e.target.result;
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          console.log(jsonData);
          setData(jsonData);
        };
        reader.readAsArrayBuffer(file);
      }
    }, [file]);
  
    useEffect(() => {
      if (data.length > 0 && gridRef.current) {
        const grid = CanvasDatagrid({
          parentNode: gridRef.current,
          data: data,
          style: {
            headerCellBackgroundColor: 'black',
            headerCellColor: 'white',
          },
          // schema: [
          //   { name: 'A' ,
          //   title: 'A',
          //   },
          //   {
          //     name: 'B',
          //     title: 'B',
          //   },
          //   { name: 'C',
          //   },
          //   {
          //     name: 'B',
          //   },
          //   { name: 'C' },
          //   { name: 'D' },
          //   { name: 'E' },
          //   { name: 'F' },
          //   { name: 'G' },
          // ],
        });
        grid.style.height = '100%';
        grid.style.width = '100%';
      }
    }, [data]);
  
    return <div ref={gridRef} style={{ height: '500px', width: '100%' }}></div>;
  };
  
  export default ExcelGrid;