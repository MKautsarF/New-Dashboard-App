import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@mui/material";
import Container from "@/components/Container";
import ButtonSettings from "@/components/ButtonSettings";
import { getCourseByInstructor } from "@/services/course.services";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function SettingsModulKCIC() {
  const [completion, setCompletion] = useState(7);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [kcicButtons, setKcicButtons] = useState<any[]>([]);

  const navigate = useNavigate();

  const handlePrev = () => {
    navigate("/SecondPage");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { results } = await getCourseByInstructor();

        // Sort the results based on the level field
        results.sort((a: any, b: any) => a.level - b.level);

        const kcicData = results
          .filter((course: any) => course.description === "KCIC")
          .map((course: any) => ({
            title: course.title,
            requiredCompletion: course.level, // Assuming level is the requiredCompletion
          }));

        setKcicButtons(kcicData);
      } catch (error) {
        console.error("Failed to fetch course data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Container w={900}>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col text-left gap-4 p-8 ">
            <h1 style={{ fontSize: "1.75rem", fontWeight: "bold" }}>
              Pengaturan Kereta KCIC
            </h1>
            <p style={{ fontSize: "1.25rem" }}>
              Pembelajaran kereta yang tersedia:
            </p>
          </div>

          <div className="flex flex-col pl-8 gap-4 pr-8 justify-center items-center">
            {kcicButtons.map((button) => (
              <ButtonSettings
                key={button.title}
                buttonName={button.title}
                completion={completion}
                requiredCompletion={button.requiredCompletion}
                checkedValue={null}
                activeButton={activeButton}
                sx={{
                  "&:hover": {
                    backgroundColor: "inherit",
                  },
                  pointerEvents: "none", // Disable click events
                }}
              />
            ))}
          </div>
        </div>

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
            Kembali
          </Button>
        </div>
      </Container>
    </>
  );
}

export default SettingsModulKCIC;
