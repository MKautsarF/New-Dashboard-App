import React, { useState, useEffect, useRef } from 'react';
import { TableCell, Box, Tooltip, Typography } from '@mui/material';

interface InteractableTableCellProps {
  content: string;
  isEllipsisEnabled: boolean;
  width: string | number;  // Tambahkan properti width
}

export function InteractableTableCell({ content, isEllipsisEnabled, width }: InteractableTableCellProps) {
  const [isEllipsis, setIsEllipsis] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false); 
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setIsEllipsis(
        contentRef.current.scrollWidth > contentRef.current.clientWidth
      );
    }
  }, [content, width]); // Tambahkan width sebagai dependency agar efek dipicu saat width berubah

  const handleTooltipToggle = () => {
    if (isEllipsis && isEllipsisEnabled) {
      setIsTooltipOpen((prev) => !prev); 
    }
  };

  return (
    <TableCell
      className="text-lg"
      sx={{
        position: 'relative',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: width,
        cursor: isEllipsis && isEllipsisEnabled ? 'pointer' : 'default',
      }}
      onClick={handleTooltipToggle}
    >
      {isEllipsis ? (
        <Tooltip
          open={isTooltipOpen}
          title={
            <Typography sx={{ fontSize: '1.125rem', color: 'white' }}>
              {content}
            </Typography>
          }
          arrow={false}
          placement="top"
        >
          <Box
            ref={contentRef}
            sx={{
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {content}
          </Box>
        </Tooltip>
      ) : (
        <Box
          ref={contentRef}
          sx={{
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {content}
        </Box>
      )}
    </TableCell>
  );
}
