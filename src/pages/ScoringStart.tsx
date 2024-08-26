import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@mui/material";
import Container from "@/components/Container";
import { NavigateNext } from "@mui/icons-material";
import { useSettings } from "../context/settings";
import { sendTextToClients } from "@/socket";
import ButtonSettings from "@/components/ButtonSettings";
import { getCourseByInstructor } from "@/services/course.services";
import { createSubmission } from "@/services/submission.services";
import { getPayloadFromCourse } from "@/services/course.services";
import { getScoringByCourseInstructor } from "@/services/scoring.services";
import FirstPageIcon from '@mui/icons-material/FirstPage';
import { set } from "lodash";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function ScoringStart() {
  const query = useQuery();
  const trainType = query.get("type") as "kcic" | "lrt";
  const courseID = query.get("id");
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
  const [submissionPayload, setSubmissionPayload] = useState<any | null>(null);

  const [payload, setPayload] = useState<any>({});

  const handlePrev = () => {
    navigate(-1);
  };


  const handleClick = (buttonName: string) => {
    console.log(`Currently pressed: ${buttonName}`);
  
    const selectedCourse = coursesData.find((course: any) => course.id === buttonName);
    setSelectedCourse(selectedCourse || null);
  
    if (trainType === "lrt") {
      if (checkedLRT == buttonName){
        setCheckedLRT(null)
      }
      else{
        setCheckedLRT(buttonName);
      }
      setSelectedValue3(buttonName);
      setCheckedKCIC(null);
    } else if (trainType === "kcic") {
      if ( checkedKCIC == buttonName){
        setCheckedKCIC(null)
      }
      else {
        setCheckedKCIC(buttonName);
      }
      setSelectedValue4(buttonName);
      setCheckedLRT(null);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { results } = await getScoringByCourseInstructor(courseID, 1, 100);

        
        console.log("Results:", results);
        console.log("id:", courseID);
        // results.sort((a: any, b: any) => a.level - b.level);
  
        // const lrtData = results.filter((course: any) => course.description === "LRT")
        //   .map((course: any) => ({
        //     title: course.title,
        //     requiredCompletion: course.level // Assuming level as requiredCompletion
        //   }));
  
        setLrtButtons(results);
        setCoursesData(results);
      } catch (error) {
        console.error("Failed to fetch course data:", error);
      }
    };
  
    fetchData();
  }, []); 

  const [submission, setSubmission] = useState<any>({});

  useEffect(() => {
    const fetchPayload = async () => {
      const selectedPesertaId = localStorage.getItem('selectedPesertaId');
      const moduleName = localStorage.getItem('moduleName');
      
      if (selectedCourse && selectedCourse.id) {
        try {
          const payloadData = await getPayloadFromCourse(courseID);
          const payloadS = {
            owner : selectedPesertaId,
            objectType : trainType.toLocaleUpperCase(),
            courseId : courseID,
            courseExamId : selectedCourse.id,
            setting : payloadData
          }
          setSubmissionPayload(payloadS);
          console.log("Payload data:", submissionPayload);
          const payloadAll = {
            ...payloadData,
            id_user: selectedPesertaId,
            learning_module: moduleName,
          };
          setPayload(payloadAll);
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

  const handleStart = async () => {
    try {

      const res = await createSubmission(submissionPayload);
      console.log("Submission created:", res.id);
      setSubmission(res);
      navigate(`/FifthPage/${trainType}?type=${settings.score}&submissionId=${res.id}&scoringId=${selectedCourse.id}&courseId=${courseID}`);
      // console.log("sent payload:", payload);
      // setIsLoading(true);
      // sendTextToClients(JSON.stringify(payload, null, 2));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      console.log("submissionId:", submission.id);
    }
  };

  return (
    <>
      <Container w={900}>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col text-left gap-4 p-6 ">
            <h1 style={{ fontSize: "1.75rem", fontWeight: "bold" }}>
              Modul Penilaian {trainType === "kcic" ? "Kereta Cepat" : trainType.toUpperCase()}

            </h1>
            <p style={{ fontSize: "1.25rem" }}>
              Pilih pembelajaran kereta yang akan digunakan:
            </p>
          </div>

          <div className="flex flex-col px-6 gap-4 justify-center items-center">
            {/* Buttons for LRT */}
            {trainType === "lrt" &&
              lrtButtons.map((button) => (
                <ButtonSettings
                  key={button.title}
                  buttonName={button}
                  completion={completion}
                  onClick={handleClick}
                  checkedValue={checkedLRT}
                  activeButton={activeButton}
                  // requiredCompletion={button.requiredCompletion} // Pass requiredCompletion here
                />
              ))}

            {/* Buttons for KCIC */}
            {trainType === "kcic" &&
              kcicButtons.map((button) => (
                <ButtonSettings
                  key={button.title}
                  buttonName={button}
                  completion={completion}
                  onClick={handleClick}
                  checkedValue={checkedKCIC}
                  activeButton={activeButton}
                  // requiredCompletion={button.requiredCompletion} // Pass requiredCompletion here
                />
              ))}
          </div>
        </div>

        {/* nav */}
        <div className="flex gap-4 justify-between p-6 mt-6 w-full">
          <div className="w-1/2 space-x-2">
            <Button
              type="button"
              color="error"
              variant="outlined"
              // className="bottom-0 mt-4"
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
                navigate("/SecondPage");
              }}
            >
              <FirstPageIcon className="mr-2 ml-[-2px] text-xl text-opacity-80"/> Kembali ke Menu
            </Button>
            <Button
              type="button"
              color="error"
              variant="outlined"
              // className="bottom-0 mt-4"
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
          <div className="w-1/2 flex items-center justify-end">
            {checkedLRT || checkedKCIC ? (
              <Button
                type="button"
                variant="outlined"
                onClick={handleStart}
                sx={{
                  color: "#00a6fb",
                  backgroundColor: "#ffffff",
                  borderColor: "#00a6fb",
                  "&:hover": {
                    borderColor: "#00a6fb",
                    color: "#ffffff",
                    backgroundColor: "#00a6fb",
                  },
                }}
              >
                Mulai Simulasi
              </Button>
            ) : null}
          </div>
        </div>
      </Container>
    </>
  );
}

export default ScoringStart;
