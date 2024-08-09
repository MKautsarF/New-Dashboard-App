import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: string;
  item: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ open, onClose, onConfirm, type, item }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 1,
        }}
      >
        <Typography id="modal-modal-title" variant="h6" component="h2">
          {type === 'delete' ? 'Konfirmasi Hapus' : 'Konfirmasi Perubahan'}
        </Typography>
        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          {type === 'delete' 
            ? `Apakah yakin untuk mengapus ${item}?` 
            : `Apakah yakin untuk melakukan perubahan pada ${item}?`}
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button color="error" onClick={onConfirm}>
            <b>{type === 'delete' ? 'Hapus' : 'Ubah'}</b>
          </Button>
          <Button variant="contained" color='primary' onClick={onClose}>
            <b>Batal</b>
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ConfirmationModal;
