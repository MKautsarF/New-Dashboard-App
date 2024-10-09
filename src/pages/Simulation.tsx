import { useState } from "react";
// import "../App.css";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import Container from "@/components/Container";
import { Train, DirectionsRailway } from "@mui/icons-material";

function Simulation() {
  const navigate = useNavigate();

  const handlePrev = () => {
    navigate("/SecondPage");
  };
  const handleNext = () => {
    navigate("/");
  };
  const handleSettings = () => {
    navigate("/FifthPage");
  };

  const handleKCIC = () => {
    navigate("/FourthPage?type=kcic");
  };
  const handleLRT = () => {
    navigate("/FourthPage?type=lrt");
  };

  const [isHovered, setIsHovered] = useState(false);
  const [isHovered2, setIsHovered2] = useState(false);

  return (
    <>
      <Container w={900}>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col text-left gap-4 p-6">
            <h1 style={{ fontSize: "1.75rem", fontWeight: "bold" }}>
              Simulasi
            </h1>
            <p style={{ fontSize: "1.25rem" }}>
              Pilih jenis kereta yang akan dioperasikan:
            </p>
          </div>

          <div className="flex flex-col px-6 pb-6 justify-center items-center">
            <div
              className="box gap-6 flex "
              style={{
                height: "200px",
                width: "700px",
                transition: "transform 0.3s",
                color: isHovered ? "#f3f3f4" : "#000000",
                borderColor: isHovered ? "transparent" : "rgba(0, 0, 0, 0.2)",
                backgroundColor: isHovered ? "#00a6fb" : "#f3f3f4",
                boxShadow: isHovered
                  ? "0 0 10px rgba(0, 0, 0, 0.5)"
                  : "0 0 10px rgba(0, 0, 0, 0.25)",
                cursor: isHovered ? "pointer" : "default",
                borderRadius: "10px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.1)";
                setIsHovered(true);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                setIsHovered(false);
              }}
              onClick={handleKCIC} // Call handleNext when clicked
            >
              <Train style={{ fontSize: 75 }} />
              <h1>High Speed Train</h1>
            </div>
          </div>

          <div className="flex flex-col px-6 pb-6 justify-center items-center">
            <div
              className="box gap-6 flex "
              style={{
                height: "200px",
                width: "700px",
                transition: "transform 0.3s",
                color: isHovered2 ? "#f3f3f4" : "#000000",
                borderColor: isHovered2 ? "transparent" : "rgba(0, 0, 0, 0.2)",
                backgroundColor: isHovered2 ? "#00a6fb" : "#f3f3f4",
                boxShadow: isHovered2
                  ? "0 0 10px rgba(0, 0, 0, 0.5)"
                  : "0 0 10px rgba(0, 0, 0, 0.25)",
                cursor: isHovered2 ? "pointer" : "default",
                borderRadius: "10px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.1)";
                setIsHovered2(true);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                setIsHovered2(false);
              }}
              onClick={handleLRT} // Call handleNext when clicked
            >
              <DirectionsRailway style={{ fontSize: 75 }} />
              <h1>Light Rail Transit</h1>
            </div>
          </div>
        </div>
        <div className="flex gap-4 justify-start pl-6 pb-6 w-full">
          <Button
            type="button"
            color="error"
            variant="outlined"
            className="bottom-0 mt-4"
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
            onClick={() => {
              handlePrev();
            }}
          >
            Kembali
          </Button>
        </div>
      </Container>
    </>
  );
}

export default Simulation;
