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
import { getCourseDetailByInstructor } from "@/services/course.services";
import { getScoringByCourseInstructor, getScoringByInstructor } from "@/services/scoring.services";
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
  console.log("courseID", courseID);
  const location = useLocation();
  const fromEksplorasi = location.state?.fromEksplorasi || false;
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { settings } = useSettings();

  const [selectedValue3, setSelectedValue3] = useState<string>("");
  const [completion, setCompletion] = useState(7);
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const [checkedButton, setCheckedButton] = useState<string | null>(null);

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
  
    if (checkedButton == buttonName){
        setCheckedButton(null)
    }
      else{
        setCheckedButton(buttonName);
      }
      setSelectedValue3(buttonName);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        let results;
        if (fromEksplorasi) {
          results = await getScoringByInstructor(trainType);
          console.log("traintype", trainType)
          console.log("results", results);
        } else {
          results = await getScoringByCourseInstructor(courseID, 1, 100);
        }
        setCoursesData(results.results);
      } catch (error) {
        console.error("Failed to fetch course data:", error);
      }
    };
  
    fetchData();
  }, []); 

  const [submission, setSubmission] = useState<any>({});

  type StationMapping = {
    [key: string]: string;
  };
  
  const stationMapping: StationMapping = {
    "Tegalluar": "Tegal Luar",
    "Joint Workshop Tegalluar": "Tegal Luar Depot",
    "Karawang": "Karawang",
    "Padalarang": "Padalarang",
    "Halim": "Halim",
  };
  
  const getPayloadStationName = (displayName: any) => Object.keys(stationMapping).find(key => stationMapping[key] === displayName) || displayName;

  const getPayloadExploration = () => {
    const rangkaianKereta = "6 Rangkaian";
    const selectedPesertaId = localStorage.getItem('selectedPesertaId');
    const payload = {
      id_user: selectedPesertaId,
      train_type: trainType.toUpperCase(),
      train: {
        weight: settings.berat.toString(),
        type: rangkaianKereta,
      },
      time: Number(settings.waktu.format("HH")),
      weather: [
        {
          value: settings.statusHujan,
          location: [0, 0],
          name: "rain",
        },
        {
          value: settings.fog,
          location: [0, 0],
          name: "fog",
        },
      ],
      route: {
        start: {
          name: getPayloadStationName(settings.stasiunAsal),
        },
        finish: {
          name: getPayloadStationName(settings.stasiunTujuan),
        },
      },
      motion_base: settings.useMotionBase,
      speed_buzzer: settings.useSpeedBuzzer,
      speed_limit: settings.speedLimit,
      status: "play",
      module_name: "Eksplorasi",
    };

    console.log("payload", payload);
    return payload;
  };
  useEffect(() => {
    const fetchPayload = async () => {
      const selectedPesertaId = localStorage.getItem('selectedPesertaId');
      const moduleName = localStorage.getItem('moduleName');
      
      if (selectedCourse && selectedCourse.id) {
        try {
          let payloadData;
          if (fromEksplorasi) {
            payloadData = getPayloadExploration();
          } else {
            payloadData = await getCourseDetailByInstructor(courseID);
          }
          // add scoring name in payloadData
          payloadData.scoring_name = selectedCourse.title;
          const payloadS = {
            owner : selectedPesertaId,
            objectType : trainType.toLocaleUpperCase(), 
            courseId : courseID,
            courseExamId : selectedCourse.id,
            setting : payloadData
          }
          console.log("Payload data:", payloadS);
          setSubmissionPayload(payloadS);
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

  useEffect(() => {
    console.log("coursesData updated:", coursesData);
  }
  , [coursesData]);

  const handleStart = async () => {
    try {

      const res = await createSubmission(submissionPayload);
      console.log("Submission created:", res.id);
      setSubmission(res);
      navigate(`/FifthPage/review?type=${settings.score}&submissionId=${res.id}&scoringId=${selectedCourse.id}&courseId=${courseID}&trainType=${trainType}`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      console.log("submissionId:", submission.id);
    }
  };

  const handleNewScoring = async () => {
    // navigate(`/courselist?&type=${trainType}`);
    navigate(`/scoringlist/coursedetail?id=${courseID}&type=${trainType}`)
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
            {coursesData.length > 0 ? (
              coursesData.map((button) => (
                <ButtonSettings
                  key={button.title}
                  buttonName={button}
                  completion={completion}
                  onClick={handleClick}
                  checkedValue={checkedButton}
                  activeButton={activeButton}
                />
              ))
            ) : (
              <div className="w-full h-[400px] flex flex-col items-center justify-center">
                  <p>Belum ada modul, silahkan buat modul penilaian baru.</p>
                  <Button
                    type="button"
                    variant="outlined"
                    className="mt-6"
                    onClick={handleNewScoring}
                    sx={{
											color: "#ffffff",
											backgroundColor: "#00a6fb",
											borderColor: "#00a6fb",
											"&:hover": {
												borderColor: "#1aaffb",
												color: "#ffffff",
												backgroundColor: "#1aaffb",
											},
										}}
                  >
                    Buat Baru
                  </Button>
                </div>
            )}
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
            {checkedButton ? (
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
