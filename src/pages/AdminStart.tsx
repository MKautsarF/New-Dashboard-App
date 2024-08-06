import { ManageAccounts, Groups, School } from "@mui/icons-material";
import { Button } from "@mui/material";
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

  const handleLogout = () => {
    logout();
  };

  return (
    <Container w={800}>
      {/* <div className="w-1/3 absolute -translate-y-full py-4">
        <Logo />
      </div> */}

      <div className="p-6">
        <h4 className="py-3 mb-2">{"Halo, " + instructor.name + "."}</h4>
        <div className="flex flex-col">
          <p className="mb-5">
            Pilih kategori peserta yang ingin dipersunting:{" "}
          </p>
          <div className="border-0 border-solid flex space-x-10 justify-center items-center">
            <Button
              variant="contained"
              type="button"
              onClick={() => handleInstruktur()}
              className="w-1/2 p-5 text-2xl bg-gray-400 "
              startIcon={<ManageAccounts className="text-3xl" />}
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
              startIcon={<Groups className="text-3xl" />}
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
              startIcon={<School className="text-3xl" />}
              sx={{
                "&:hover": {
                  backgroundColor: "#1aaffb !important",
                },
              }}
            >
              Course
            </Button>
          </div>
        </div>

        <div className="flex mt-8">
          <Button
            type="button"
            color="error"
            variant="outlined"
            // startIcon={<NavigateBefore />}
            onClick={() => handleLogout()}
            sx={{
              color: "#df2935",
              borderColor: "#df2935",
              "&:hover": {
                borderColor: "#df2935",
                backgroundColor: "#df2935",
                // backgroundColor: "rgba(223, 41, 53, 0.4)", // Lower opacity red color
                color: "#ffffff",
              },
            }}
          >
            Logout
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default AdminStart;
