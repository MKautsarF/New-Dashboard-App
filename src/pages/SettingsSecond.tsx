import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@mui/material";
import Container from "@/components/Container";
import { NavigateNext } from "@mui/icons-material";
import { useSettings } from "../context/settings";
import { sendTextToClients } from "@/socket";
import ButtonSettings from "@/components/ButtonSettings";
import { getCourseByInstructor } from "@/services/course.services";
import { getPayloadFromCourse } from "@/services/course.services";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function SettingsSecond() {
  const query = useQuery();
  const trainType = query.get("type") as "kcic" | "lrt";
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { settings } = useSettings();

  const [selectedValue3, setSelectedValue3] = useState<string>("");
  const [selectedValue4, setSelectedValue4] = useState<string>("");
  const [completion, setCompletion] = useState(7);
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const [checkedLRT, setCheckedLRT] = useState<string | null>(null);
  const [checkedKCIC, setCheckedKCIC] = useState<string | null>(null);

  const [lrtButtons, setLrtButtons] = useState<any[]>([]);
  const [kcicButtons, setKcicButtons] = useState<any[]>([]);
  const [coursesData, setCoursesData] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);

  const [payload, setPayload] = useState<any>({});

  const handlePrev = () => {
    navigate(`/Modul?type=${trainType}`);
  };


  const handleClick = (buttonName: string) => {
    console.log(`Currently pressed: ${buttonName}`);
  
    const selectedCourse = coursesData.find((course: any) => course.title === buttonName);
    setSelectedCourse(selectedCourse || null);
  
    if (trainType === "lrt") {
      setCheckedLRT(buttonName);
      setSelectedValue3(buttonName);
      setCheckedKCIC(null);
    } else if (trainType === "kcic") {
      setCheckedKCIC(buttonName);
      setSelectedValue4(buttonName);
      setCheckedLRT(null);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { results } = await getCourseByInstructor();

        
  
        results.sort((a: any, b: any) => a.level - b.level);
  
        const lrtData = results.filter((course: any) => course.description === "LRT")
          .map((course: any) => ({
            title: course.title,
            requiredCompletion: course.level // Assuming level as requiredCompletion
          }));
        const kcicData = results.filter((course: any) => course.description === "KCIC")
          .map((course: any) => ({
            title: course.title,
            requiredCompletion: course.level // Assuming level as requiredCompletion
          }));
  
        setLrtButtons(lrtData);
        setKcicButtons(kcicData);
        setCoursesData(results);
      } catch (error) {
        console.error("Failed to fetch course data:", error);
      }
    };
  
    fetchData();
  }, []); 

  useEffect(() => {
    const fetchPayload = async () => {
      if (selectedCourse && selectedCourse.id) {
        try {
          const payloadData = await getPayloadFromCourse(selectedCourse.id);
          setPayload(payloadData);
        } catch (error) {
          console.error("Failed to fetch payload data:", error);
        }
      }
    };

    fetchPayload();
  }, [selectedCourse]);

  useEffect(() => {
    console.log("Payload updated:", payload);
  }, [payload]);

  const handleMulai = async () => {
    try {
      console.log("sent payload:", payload);
      setIsLoading(true);
      sendTextToClients(JSON.stringify(payload, null, 2));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      navigate(`/FifthPage/${trainType}?type=${settings.score}`);
    }
  };

  return (
    <>
      <Container w={900}>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col text-left gap-4 p-8 ">
            <h1 style={{ fontSize: "1.75rem", fontWeight: "bold" }}>
              Pengaturan Kereta {trainType.toUpperCase()}
            </h1>
            <p style={{ fontSize: "1.25rem" }}>
              Pilih pembelajaran kereta yang akan digunakan:
            </p>
          </div>

          <div className="flex flex-col pl-8 gap-4 pr-8 justify-center items-center">
            {/* Buttons for LRT */}
            {trainType === "lrt" &&
              lrtButtons.map((button) => (
                <ButtonSettings
                  key={button.title}
                  buttonName={button.title}
                  completion={completion}
                  onClick={handleClick}
                  checkedValue={checkedLRT}
                  activeButton={activeButton}
                  requiredCompletion={button.requiredCompletion} // Pass requiredCompletion here
                />
              ))}

            {/* Buttons for KCIC */}
            {trainType === "kcic" &&
              kcicButtons.map((button) => (
                <ButtonSettings
                  key={button.title}
                  buttonName={button.title}
                  completion={completion}
                  onClick={handleClick}
                  checkedValue={checkedKCIC}
                  activeButton={activeButton}
                  requiredCompletion={button.requiredCompletion} // Pass requiredCompletion here
                />
              ))}
          </div>
        </div>

        {/* nav */}
        <div className="flex gap-4 justify-between p-8 w-full">
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
            onClick={handlePrev}
          >
            Back
          </Button>
          {payload.module_name ? (
            <Button
              type="button"
              variant="outlined"
              endIcon={<NavigateNext />}
              onClick={handleMulai}
              sx={{
                color: "#f3f3f4",
                backgroundColor: "#00a6fb",
                borderColor: "#f3f3f4",
                fontSize: "1.1rem",
                "&:hover": {
                  borderColor: "#4dc1fc",
                  color: "#f3f3f4",
                  backgroundColor: "#4dc1fc",
                },
              }}
            >
              Start
            </Button>
          ) : null}
        </div>
      </Container>
    </>
  );
}

export default SettingsSecond;
