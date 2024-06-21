import { useState } from "react";
// import "../App.css";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import Container from "../components/Container";
import Logo from "@/components/Logo";

function App() {
  const navigate = useNavigate();

  const handleNext = () => {
    navigate("/FirstPage");
  };

  return (
    <>
      <Container w={600}>
        <div className="gap-2  pt-4 flex flex-col items-center justify-center h-full">
          {/* <img src="\src\static\newLogo.jpg" alt="Logo" /> */}
          <Logo />
          <h1>KCIC LRT Launcher</h1>
          <p>a simulation launcher for KCIC LRT</p>
        </div>
        <div className="flex flex-col gap-4 justify-center p-12">
          <Button
            type="button"
            variant="outlined"
            className="h-14"
            onClick={() => handleNext()}
            sx={{
              color: "#f3f3f4",
              backgroundColor: "#00a6fb",
              borderColor: "#f3f3f4",
              "&:hover": {
                borderColor: "#4dc1fc",
                color: "#f3f3f4",
                backgroundColor: "#4dc1fc",
              },
            }}
          >
            Start
          </Button>

          <Button
            type="button"
            variant="outlined"
            color="error"
            sx={{
              borderColor: "#ffffff",
              backgroundColor: "#ffffff",
              "&:hover": {
                borderColor: "#df2935",
                color: "#df2935",
                backgroundColor: "#ffffff",
              },
            }}
          >
            Exit
          </Button>
        </div>
      </Container>
    </>
  );
}

export default App;
