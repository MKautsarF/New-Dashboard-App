import { TextField, Tooltip } from '@mui/material';
import React, { FC } from 'react';

interface LangkahKerjaData {
  no: number;
  langkah_kerja: string;
  bobot: number;
  poin: {
    observasi: string;
    nilai: number;
    id: string;
    disable: boolean;
    bobot: number;
  }[];
}

interface LangkahKerjaProps {
  data: LangkahKerjaData;
  keyVal: number;
}

const LangkahKerja: FC<LangkahKerjaProps> = ({ data, keyVal }) => {
  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>
  ) => {
    const currentVal = Number(e.target.value);
    if (currentVal > 100) e.target.value = (100).toString();
    if (currentVal < 0) e.target.value = (0).toString();
  };

  const borderStyle = 'border border-solid border-slate-200';
  const bgStyle = 'bg-slate-100';

  return (
    <div key={keyVal}>
      <h3 className="mt-8 w-full flex gap-4 items-center justify-between">
        <span>
          {data.no}. {data.langkah_kerja}
        </span>
        <span> x {data.bobot}</span>
      </h3>
      {data.poin.map((poin) => (
        <div
          key={poin.id}
          className={`flex gap-4 my-2 items-center rounded-lg p-2 ${
            poin.nilai !== null ? borderStyle : bgStyle
          } ${poin.disable ? bgStyle : ''}`}
        >
          <p className="w-5/6 min-h-[40px] flex items-center">
            <span style={{ color: `${poin.disable ? 'gray' : 'auto'}` }}>
              {poin.observasi}
            </span>
          </p>
          {poin.nilai !== null && (
            <TextField
              size="small"
              className="w-1/6"
              type="number"
              defaultValue={0}
              id={poin.id}
              inputProps={{
                min: 0,
                max: 100,
                // step: 5,
              }}
              onFocus={(e) => e.target.select()}
              onBlur={handleBlur}
              name="penilaian"
              // disabled={poin.disable}
              InputProps={{
                readOnly: poin.disable,
              }}
            />
          )}
          <p className="w-10 flex items-center">
            <span style={{ color: `${poin.disable ? 'gray' : 'auto'}` }}>
              x {poin.bobot}
            </span>
          </p>
        </div>
      ))}
    </div>
  );
};

export default LangkahKerja;
