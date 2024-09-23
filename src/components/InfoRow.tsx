import React, { useEffect, useState, useRef } from 'react';
import { Typography } from "@mui/material";
import { Tooltip } from "@mui/material";

interface InfoRowProps {
	label: string;
	value: string | number;
    width: string | number;
    isEllipsisEnabled: boolean;
}

export const InfoRow: React.FC<InfoRowProps> = ({ label, value, isEllipsisEnabled, width }) => {
    const [isEllipsis, setIsEllipsis] = useState(false);
    const valueRef = useRef<HTMLSpanElement>(null);
  
    useEffect(() => {
      if (valueRef.current) {
        setIsEllipsis(valueRef.current.scrollWidth > valueRef.current.clientWidth);
      }
    }, [value, width]);
  
    return (
      <div className="flex flex-col gap-2">
        <span className='text-[16px]'>{label}:</span>
        {isEllipsis ? (
            <Tooltip
                title={
                    <Typography sx={{ fontSize: '1.125rem', color: 'white' }}>
                    {isEllipsis ? value : ""}
                    </Typography>
                }
                arrow={false}
                placement="top"
                >
                    <span
                        ref={valueRef}
                        className="truncate ml-2 text-[18px] font-bold "
                        style={{
                        maxWidth: width,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        }}
                    >
                        {value}
                    </span>
                </Tooltip>
        ) : (
            <span
                ref={valueRef}
                className="truncate ml-2 text-[18px] font-bold "
                style={{
                maxWidth: width,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                }}
            >
                {value}
            </span>)}
      </div>
    );
  };