import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Container from "@/components/Container";
import { NavigateNext } from "@mui/icons-material";
import { useSettings } from "../context/settings";
import { sendTextToClients } from "@/socket";
import ButtonSettings from "@/components/ButtonSettings";
import { getCourseByInstructor, getCourseDetailByInstructor } from "@/services/course.services";
import FirstPageIcon from '@mui/icons-material/FirstPage';
import { 
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography
 } from "@mui/material";
 import { currentInstructor, useAuth } from "@/context/auth";

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

  const { instructor, logout } = useAuth();

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

  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogoutOpen = () => setLogoutOpen(true);
  const handleLogoutClose = () => setLogoutOpen(false);

  const handleConfirmLogout = () => {
    logout();
    navigate('/');
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { results } = await getCourseByInstructor(1, 100);
        
        // Sort alphabetically by title
        results.sort((a: any, b: any) => a.title.localeCompare(b.title));
  
        const lrtData = results.filter((course: any) => course.description === "LRT")
          .map((course: any) => ({
            id: course.id,
            title: course.title,
            // requiredCompletion: course.level // Assuming level as requiredCompletion
          }));
          
        const kcicData = results.filter((course: any) => course.description === "KCIC")
          .map((course: any) => ({
            id: course.id,
            title: course.title,
            // requiredCompletion: course.level // Assuming level as requiredCompletion
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
          const payloadData = await getCourseDetailByInstructor(selectedCourse.id);
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

  const handleLanjut = async () => {
    try {
      setIsLoading(true);
      localStorage.setItem('moduleName', payload.module_name);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      navigate(`/scoringStart?type=${trainType}&id=${selectedCourse.id}`);
    }
  };

  return (
    <>
      <Container w={900} h={700}>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col text-left gap-4 px-6 pt-6 pb-2">
            <h1 style={{ fontSize: "1.75rem", fontWeight: "bold" }}>
              {/* Pengaturan {trainType === "kcic" ? "Kereta Cepat" : trainType.toUpperCase()} */}
              Pengaturan {trainType === "kcic" ? "High Speed Train" : trainType === "lrt" ? "Low Rapid Train" : trainType}
            </h1>
            <p style={{ fontSize: "1.25rem" }}>
              Pilih pembelajaran kereta yang akan digunakan:
            </p>
          </div>

          <div className="flex flex-col px-6 gap-4 justify-center items-center h-[470px] overflow-y-auto">
            {/* Displaying buttons or message based on data availability */}
            {trainType === "kcic" ? (
              kcicButtons.length > 0 ? (
                <div className="w-full overflow-y-auto flex flex-col items-center gap-4">
                  {kcicButtons.map((button) => (
                    <ButtonSettings
                      key={button.id}
                      buttonName={button}
                      completion={completion}
                      onClick={() => handleClick(button.id)}
                      checkedValue={checkedKCIC}
                      activeButton={activeButton}
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full h-[400px] flex flex-col items-center justify-center">
                  <p>Belum ada modul, silahkan logout lalu login kembali sebagai admin untuk membuat modul.</p>
                  <Button
                    type="button"
                    color="error"
                    variant="outlined"
                    className="mt-6"
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
              )
            ) : (
              lrtButtons.length > 0 ? (
                <div className="w-full overflow-y-auto flex flex-col items-center gap-4">
                  {lrtButtons.map((button) => (
                    <ButtonSettings
                      key={button.id}
                      buttonName={button}
                      completion={completion}
                      onClick={() => handleClick(button.id)}
                      checkedValue={checkedLRT}
                      activeButton={activeButton}
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full h-[400px] flex flex-col items-center justify-center">
                  <p>Belum ada modul, silahkan logout lalu login kembali sebagai admin untuk membuat modul.</p>
                  <Button
                    type="button"
                    color="error"
                    variant="outlined"
                    className="mt-6"
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
              )
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
              className="text-base absolute bottom-4 left-6"
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
              className="text-base absolute bottom-4 left-[235px]"
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
            {checkedKCIC || checkedLRT ? (
              <Button
                type="button"
                variant="outlined"
                onClick={handleLanjut}
                sx={{
                  color: "#00a6fb",
                  backgroundColor: "#ffffff",
                  borderColor: "#00a6fb",
                  maxWidth: "415px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  "&:hover": {
                    borderColor: "#00a6fb",
                    color: "#ffffff",
                    backgroundColor: "#00a6fb",
                  },
                }}
              >
                <Typography
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  Lanjut ({payload.module_name})
                </Typography>
              </Button>
            ) : null}
          </div>
        </div>

        <Dialog
          open={logoutOpen}
          onClose={handleLogoutClose}
          aria-labelledby="logout-dialog-title"
          aria-describedby="logout-dialog-description"
          className="p-6"
        >
          <DialogTitle id="logout-dialog-title">Konfirmasi Logout</DialogTitle>
          <DialogContent>
            <DialogContentText id="logout-dialog-description">
              Apakah Anda yakin ingin logout?
            </DialogContentText>
          </DialogContent>
          <DialogActions className="flex p-6 justify-between w-full">
            <Button onClick={handleLogoutClose} color="primary">
              Batal
            </Button>
            <Button 
              onClick={handleConfirmLogout} color="error" variant="outlined"
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
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}

export default SettingsSecond;