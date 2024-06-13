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
          {type === 'delete' ? 'Delete Confirmation' : 'Edit Confirmation'}
        </Typography>
        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          {type === 'delete' 
            ? `Are you sure you want to delete ${item}?` 
            : `Are you sure you want to save changes to ${item}?`}
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="outlined" color="error" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" color={type === 'delete' ? 'error' : 'primary'} onClick={onConfirm}>
            {type === 'delete' ? 'Delete' : 'Save'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ConfirmationModal;
