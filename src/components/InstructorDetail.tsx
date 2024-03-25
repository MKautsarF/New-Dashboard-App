import { currentInstructor, useAuth } from '@/context/auth';
import { updatePassword, updateProfile } from '@/services/profile.services';
import {
  EditNote,
  LockReset,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

interface InstructorDetailProps {
  isOpen: boolean;
  handleClose: () => void;
}

const InstructorDetail: React.FC<InstructorDetailProps> = ({
  isOpen,
  handleClose,
}) => {
  const { instructor, logout } = useAuth();

  const handleLogout = () => {
    handleClose();
    logout();
  };

  const [passwordPrompt, setPasswordPrompt] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [editPrompt, setEditPrompt] = useState(false);

  const handleSubmitPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const oldPassword = formData.get('old-password') as string;
    const newPassword = formData.get('new-password') as string;

    if (oldPassword === '' || newPassword === '') {
      toast.error('Input password tidak boleh kosong!', {
        position: 'top-center',
      });
      return;
    }

    try {
      await updatePassword(oldPassword, newPassword);

      setPasswordPrompt(false);
      toast.success('Password berhasil diubah', {
        position: 'top-center',
      });
    } catch (e) {
      const errMsg = e.response.data.errorMessage;
      toast.error(errMsg, { position: 'top-center' });
    }
  };

  const handleSubmitProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const newName = formData.get('name') as string;
    const newUsername = formData.get('username') as string;
    const newEmail = formData.get('email') as string;

    if (newName === '' || newUsername === '' || newEmail === '') {
      toast.error('Input tidak boleh kosong!', {
        position: 'top-center',
      });
      return;
    }

    try {
      const res = await updateProfile(newName, newUsername, newEmail);

      setEditPrompt(false);
      // handleClose();
      toast.success(
        'Profil berhasil diubah. Login kembali untuk melihat perubahan',
        { position: 'top-center' }
      );
    } catch (e) {
      const errMsg = e.response.data.errorMessage;
      toast.error(errMsg, { position: 'top-center' });
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogTitle className="flex justify-between">
        <span>
          Detail {currentInstructor.isAdmin ? 'Administrator' : 'Asesor'}
        </span>
        <span>
          <Tooltip title="Edit Profil" placement="top">
            <IconButton
              size="small"
              onClick={() => setEditPrompt(true)}
              className="ml-1"
            >
              <EditNote />
            </IconButton>
          </Tooltip>
          <Tooltip title="Ubah Password" placement="top">
            <IconButton
              size="small"
              onClick={() => setPasswordPrompt(true)}
              className="ml-1"
            >
              <LockReset />
            </IconButton>
          </Tooltip>
        </span>
      </DialogTitle>
      <DialogContent className="w-[400px]">
        <DialogContentText>
          {instructor.id && (
            <>
              <p>ID: {instructor.id}</p>
              <p>Nama: {instructor.name}</p>
              <p>Username: {instructor.username}</p>
              <p>Email: {instructor.email}</p>
            </>
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions className="flex px-6 mb-4">
        <Button onClick={handleLogout} color="error" variant="outlined">
          Logout
        </Button>
        <Button onClick={handleClose} className="ml-auto">
          Tutup
        </Button>
      </DialogActions>

      {/* Change Password prompt */}
      <Dialog open={passwordPrompt} onClose={() => setPasswordPrompt(false)}>
        <DialogTitle className="min-w-[360px]">Ubah Password</DialogTitle>

        <DialogContent className="flex m-2 justify-center max-w-[360px]">
          <form id="password" onSubmit={handleSubmitPassword}>
            <TextField
              className="mb-4"
              id="old-password"
              label="Password lama"
              name="old-password"
              variant="standard"
              fullWidth
              type={showOldPassword ? 'text' : 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowOldPassword(!showOldPassword)}
                    >
                      {showOldPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              className="mb-4"
              id="new-password"
              label="Password baru"
              name="new-password"
              variant="standard"
              fullWidth
              type={showNewPassword ? 'text' : 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
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
            form="password"
            variant="contained"
            color="success"
          >
            Simpan
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Profile Prompt */}
      <Dialog open={editPrompt} onClose={() => setEditPrompt(false)}>
        <DialogTitle className="min-w-[360px]">Edit Profil</DialogTitle>
        <DialogContent className="flex m-2 justify-center max-w-[360px]">
          <form id="profile" onSubmit={handleSubmitProfile}>
            <TextField
              className="my-4"
              id="name"
              label="Nama"
              name="name"
              variant="standard"
              fullWidth
              defaultValue={instructor.name}
            />
            <TextField
              className="my-4"
              id="username"
              label="Username"
              name="username"
              variant="standard"
              fullWidth
              defaultValue={instructor.username}
            />
            <TextField
              className="my-4"
              id="email"
              label="Email"
              name="email"
              variant="standard"
              fullWidth
              defaultValue={instructor.email}
            />
          </form>
        </DialogContent>
        <DialogActions className="mb-2 flex justify-between">
          <Button
            className="mx-2"
            onClick={() => setEditPrompt(false)}
            color="error"
          >
            Batal
          </Button>

          <Button
            className="mx-2"
            type="submit"
            form="profile"
            variant="contained"
            color="success"
          >
            Simpan
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default InstructorDetail;
