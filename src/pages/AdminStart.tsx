import { ManageAccounts, Groups, School } from "@mui/icons-material";
import { 
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
 } from "@mui/material";
import React, { useState } from "react";
import Logo from "@/components/Logo";
import { useNavigate } from "react-router-dom";
import Container from "@/components/Container";
import { useAuth } from "@/context/auth";

const AdminStart = () => {
  const navigate = useNavigate();
  const { instructor, logout } = useAuth();

  // const [username, setUsername] = useState("Kautsar");

  const handleLogin = () => {
    navigate("/FirstPage");
  };

  const handlePeserta = () => {
    navigate("/admin/traineelist");
  };

  const handleInstruktur = () => {
    navigate("/admin/instructorlist");
  };

  const handleCourse = () => {
    navigate("/admin/courselist");
  };

  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogoutOpen = () => setLogoutOpen(true);
  const handleLogoutClose = () => setLogoutOpen(false);

  const handleConfirmLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Container w={800}>
      <div className="p-6">
        <h4 className="pt-3 mb-2">{"Halo, " + instructor.name + "."}</h4>
        <div className="flex flex-col">
          <p className="mb-4">
            Pilih kategori peserta atau kursus yang ingin dipersunting:{" "}
          </p>
          <div className="border-0 border-solid flex space-x-4 mt-4 justify-center items-center">
            <Button
              variant="contained"
              type="button"
              onClick={() => handleInstruktur()}
              className="w-1/2 p-5 text-2xl bg-gray-400 "
              startIcon={<ManageAccounts className="text-3xl mr-2 ml-[-7px]" />}
              sx={{
                "&:hover": {
                  backgroundColor: "#1aaffb !important",
                },
              }}
            >
              Asesor
            </Button>
            <Button
              variant="contained"
              type="button"
              onClick={() => handlePeserta()}
              className="w-1/2 p-5 text-2xl bg-gray-400 "
              startIcon={<Groups className="text-3xl mr-2 ml-[-7px]" />}
              sx={{
                "&:hover": {
                  backgroundColor: "#1aaffb !important",
                },
              }}
            >
              Peserta
            </Button>
            <Button
              variant="contained"
              type="button"
              onClick={() => handleCourse()}
              className="w-1/2 p-5 text-2xl bg-gray-400 "
              startIcon={<School className="text-3xl mr-2 ml-[-7px]" />}
              sx={{
                "&:hover": {
                  backgroundColor: "#1aaffb !important",
                },
              }}
            >
              Kursus
            </Button>
          </div>
        </div>

        <div className="flex mt-8">
          <Button
            type="button"
            color="error"
            variant="outlined"
            onClick={handleLogoutOpen}
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
            Logout
          </Button>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog
          open={logoutOpen}
          onClose={handleLogoutClose}
          aria-labelledby="logout-dialog-title"
          aria-describedby="logout-dialog-description"
        >
          <DialogTitle id="logout-dialog-title">Konfirmasi Logout</DialogTitle>
          <DialogContent>
            <DialogContentText id="logout-dialog-description">
              Apakah Anda yakin ingin logout?
            </DialogContentText>
          </DialogContent>
          <DialogActions className="p-4">
            <Button onClick={handleConfirmLogout} variant="outlined" color="error">
              Logout
            </Button>
            <Button onClick={handleLogoutClose} variant="contained" color="primary">
              Batal
            </Button>
          </DialogActions>
        </Dialog>
    </Container>
  );
};

export default AdminStart;
