import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

interface SelectedPeserta {
  name: string;
}

interface PasswordDialogProps {
  passwordPrompt: boolean;
  setPasswordPrompt: React.Dispatch<React.SetStateAction<boolean>>;
  selectedPeserta: SelectedPeserta;
  handleSubmitPassword: React.FormEventHandler<HTMLFormElement>;
}

export const PasswordDialog: React.FC<PasswordDialogProps> = ({
  passwordPrompt,
  setPasswordPrompt,
  selectedPeserta,
  handleSubmitPassword,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isEllipsis, setIsEllipsis] = useState(false);
  const nameRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const checkEllipsis = () => {
      if (nameRef.current) {
        const isOverflowing = nameRef.current.scrollWidth > nameRef.current.clientWidth;
        setIsEllipsis(isOverflowing);
        console.log("Ellipsis status:", isOverflowing);
      }
    };

    const timeoutId = setTimeout(checkEllipsis, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [selectedPeserta.name]);

  return (
    <Dialog open={passwordPrompt} onClose={() => setPasswordPrompt(false)}>
      <DialogTitle className="min-w-[360px]">Ubah Password</DialogTitle>
      <DialogContent className="m-2 justify-center max-w-[360px]">
        {isEllipsis ? (
          <Tooltip
            title={
              <Typography sx={{ fontSize: '1rem', color: 'white' }}>
                {selectedPeserta.name}
              </Typography>
            }
            placement="top"
          >
            <span
              ref={nameRef}
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'block',
                maxWidth: '360px',
              }}
              className="mb-4"
            >
              {selectedPeserta.name}
            </span>
          </Tooltip>
        ) : (
          <span
            ref={nameRef}
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'block',
              maxWidth: '360px',
            }}
            className="mb-4"
          >
            {selectedPeserta.name}
          </span>
        )}

        <form id="new-password" onSubmit={handleSubmitPassword}>
          <TextField
            label="Password baru"
            name="password"
            variant="standard"
            fullWidth
            type={showPassword ? 'text' : 'password'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </form>
      </DialogContent>
      <DialogActions className="mb-2 flex justify-between">
        <Button
          className="mx-2"
          onClick={() => setPasswordPrompt(false)}
          color="error"
        >
          Batal
        </Button>
        <Button
          className="mx-2"
          type="submit"
          form="new-password"
          variant="contained"
          sx={{
            color: '#ffffff',
            backgroundColor: '#1aaffb',
            '&:hover': {
              borderColor: '#00a6fb',
              color: '#ffffff',
            },
          }}
        >
          Simpan
        </Button>
      </DialogActions>
    </Dialog>
  );
};
