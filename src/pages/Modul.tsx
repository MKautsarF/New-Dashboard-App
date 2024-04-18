import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@mui/material";
import Container from "@/components/Container";
import { EditNote, School } from "@mui/icons-material";

function useQuery() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}

function Modul() {
  const query = useQuery();

  const trainType = query.get("type") as "kcic" | "lrt";

  const navigate = useNavigate();

  const handlePrev = () => {
    navigate(`/FourthPage?type=${trainType}`);
  };

  const [isHovered, setIsHovered] = useState(false);
  const [isHovered2, setIsHovered2] = useState(false);

  const handleNormal = () => {
    navigate(`/FifthPage?type=${trainType}`);

    if (trainType === "lrt") {
      localStorage.setItem("valueSettingsLRT", "Normal");
    } else if (trainType === "kcic") {
      localStorage.setItem("valueSettingsKCIC", "Normal");
    }
  };

  const handleLearning = () => {
    navigate(`/Modul/learning?type=${trainType}`);
  };

  return (
    <>
      <Container w={900}>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col text-left gap-4 p-8 ">
            <h1 style={{ fontSize: "1.75rem", fontWeight: "bold" }}>
              Modul {trainType.toUpperCase()}
            </h1>
            <p style={{ fontSize: "1.25rem" }}>
              Pilih modul yang akan digunakan:
            </p>
          </div>

          <div className="flex flex-col pl-8 pb-8 pr-8 justify-center items-center">
            <div
              className="box gap-6 flex "
              style={{
                height: "250px",
                width: "750px",
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
              onClick={handleNormal} // Call handleNext when clicked
            >
              <EditNote style={{ fontSize: 75 }} />
              <h1>Normal</h1>
            </div>
          </div>

          <div className="flex flex-col pl-8 pb-8 pr-8 justify-center items-center">
            <div
              className="box gap-6 flex "
              style={{
                height: "250px",
                width: "750px",
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
              onClick={handleLearning} // Call handleNext when clicked
            >
              <School style={{ fontSize: 75 }} />
              <h1>Learning</h1>
            </div>
          </div>
        </div>
        <div className="flex gap-4 justify-start pl-8 pb-8 w-full">
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
                // backgroundColor: "rgba(223, 41, 53, 0.4)", // Lower opacity red color
                color: "#ffffff",
              },
            }}
            onClick={() => {
              handlePrev();
            }}
          >
            Back
          </Button>
        </div>
      </Container>
    </>
  );
}

export default Modul;
