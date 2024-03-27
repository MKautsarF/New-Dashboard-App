import { useState, useEffect } from "react";
// import "../App.css";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import Container from "@/components/Container";
import {
  Add,
  Delete,
  CheckBox,
  CheckBoxOutlineBlank,
} from "@mui/icons-material";
import { useSettings } from "../context/settings";
import pullAt from "lodash/pullAt";

function ScoringKCIC() {
  const navigate = useNavigate();

  const handlePrev = () => {
    navigate("/SecondPage");
  };
  const handleNext = () => {
    navigate("/");
  };

  const [val, setVal] = useState([]);
  const [checkedItem, setCheckedItem] = useState(null);

  useEffect(() => {
    const storedVal = localStorage.getItem("scoringKCICVal");
    if (storedVal) {
      setVal(JSON.parse(storedVal));
    }

    const storedCheckedItem = localStorage.getItem("checkedItem");
    if (storedCheckedItem !== null) {
      setCheckedItem(parseInt(storedCheckedItem));
    } else {
      setCheckedItem(null);
    }
  }, []);

  const fs = require("fs");
  const path = require("path");

  const handleAdd = async () => {
    const newCount = val.length + 1;
    const newSettings = [...val, `New Settings ${newCount}`];
    setVal(newSettings);
    localStorage.setItem("scoringKCICVal", JSON.stringify(newSettings));

    // Duplicate the JSON file
    const sourceFilePath = "C:/Train Simulator/Data/MockJSON_MRT.json";
    const destinationFileName = `kcic_New Settings ${newCount}.json`;
    const destinationFilePath = path.join(
      "C:/Train Simulator/Data",
      destinationFileName
    );

    // Read the source file
    fs.readFile(sourceFilePath, "utf8", (err: any, data: any) => {
      if (err) {
        console.error("Error reading source file:", err);
        return;
      }

      // Write the duplicated content to a new file
      fs.writeFile(destinationFilePath, data, "utf8", (err: any) => {
        if (err) {
          console.error("Error writing to destination file:", err);
          return;
        }
        console.log(`File duplicated and saved as ${destinationFileName}`);

        // Read the settings_train.json file
        const settingsFilePath = "C:/Train Simulator/Data/settings_train.json";
        fs.readFile(settingsFilePath, "utf8", (err: any, settingsData: any) => {
          if (err) {
            console.error("Error reading settings file:", err);
            return;
          }

          // Parse the JSON content
          const settings = JSON.parse(settingsData);

          // Update the score array in the kcic section
          settings.kcic.score.push(destinationFileName);

          // Write the updated settings back to the file
          fs.writeFile(
            settingsFilePath,
            JSON.stringify(settings, null, 2),
            (err: any) => {
              if (err) {
                console.error("Error writing settings file:", err);
                return;
              }
              console.log("settings_train.json updated.");
            }
          );
        });
      });
    });
  };

  const handleDelete = (i: any) => {
    const deletVal = [...val];
    const deletedName = deletVal[i];
    deletVal.splice(i, 1);
    setVal(deletVal);
    localStorage.setItem("scoringKCICVal", JSON.stringify(deletVal));

    // Read the settings_train.json file
    const settingsFilePath = "C:/Train Simulator/Data/settings_train.json"; // Adjust the path as needed

    fs.readFile(settingsFilePath, "utf8", (err: any, data: any) => {
      if (err) {
        console.error("Error reading settings file:", err);
        return;
      }

      // Parse JSON data
      const jsonData = JSON.parse(data);

      // Remove the deleted name from the "kcic" section
      if (jsonData["kcic"] && jsonData["kcic"]["score"]) {
        const deletedFileName = jsonData["kcic"]["score"][i + 1];
        pullAt(jsonData["kcic"]["score"], i + 1); // Remove the element at the specified index

        // Write the modified JSON data back to the file
        fs.writeFile(
          settingsFilePath,
          JSON.stringify(jsonData, null, 2),
          "utf8",
          (err: any) => {
            if (err) {
              console.error("Error writing to settings file:", err);
              return;
            }
            console.log(`Name ${deletedName} removed from settings_train.json`);

            // Delete the corresponding JSON file
            const deletedFilePath = path.join(
              "C:/Train Simulator/Data",
              deletedFileName
            );
            fs.unlink(deletedFilePath, (err: any) => {
              if (err) {
                console.error(`Error deleting file ${deletedFileName}:`, err);
                return;
              }
              console.log(`File ${deletedFileName} deleted successfully`);
            });
          }
        );
      }
    });
  };

  const { settings, setSettings } = useSettings();

  const handleClick = (index: any) => {
    setCheckedItem(index);
    localStorage.setItem("checkedItem", index === null ? "default" : index);
    localStorage.setItem("selectedValue", val[index] || "Default");
    // Set the selected value in settings
    setSettings((prevSettings) => ({
      ...prevSettings,
      score: val[index] || "Default", // Assuming val is an array of strings
    }));
  };

  // Function to check if a value is selected
  const isSelected = (index: number) => {
    return index === checkedItem;
  };

  return (
    <>
      <Container w={900}>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col text-left gap-4 p-8 ">
            {/* {settings.score && <p>Selected Value: {settings.score}</p>} */}
            <h1 style={{ fontSize: "1.75rem", fontWeight: "bold" }}>
              Pengaturan Penilaian KCIC
            </h1>
            <p style={{ fontSize: "1.25rem" }}>
              Pilih setelan penilaian yang akan diatur:
            </p>
          </div>

          <div className="flex flex-col pl-8 gap-4 pr-8 justify-center items-center">
            <div>
              <Button
                variant="text"
                onClick={() => {
                  // handleDelete(i);
                }}
                disabled // Adding the disabled prop
                sx={{
                  color: "#df2935",
                  padding: "12px ",
                  fontSize: "1rem",
                  borderColor: "#df2935",
                  "&:hover": {
                    color: "#f58c86",
                    borderColor: "#f58c86",
                  },
                }}
              >
                <Delete sx={{ fontSize: "1.75rem" }}></Delete>
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  navigate(`/Sixthpage/kcic/edit/?type=Default`);
                }}
                sx={{
                  color: "#00a6fb",
                  backgroundColor: "#f3f3f4",
                  padding: "12px 48px",
                  fontSize: "1rem",
                  "&:hover": {
                    color: "#f3f3f4",
                    backgroundColor: "#00a6fb",
                  },
                }}
              >
                Default
              </Button>
              <Button
                variant="text"
                onClick={() => handleClick(null)} // Reset checkbox state on clicking default button
                sx={{
                  color: "#00a6fb",
                  padding: "12px ",
                  fontSize: "1rem",
                  borderColor: "#00a6fb",
                }}
              >
                {checkedItem === null || settings.score === "Default" ? (
                  <CheckBox sx={{ fontSize: "1.75rem" }} />
                ) : (
                  <CheckBoxOutlineBlank sx={{ fontSize: "1.75rem" }} />
                )}
              </Button>
            </div>
            {val.map((data, i) => {
              return (
                <div key={i}>
                  <Button
                    variant="text"
                    onClick={() => {
                      handleDelete(i);
                    }}
                    sx={{
                      color: "#df2935",
                      padding: "12px ",
                      fontSize: "1rem",
                      borderColor: "#df2935",
                      "&:hover": {
                        color: "#f58c86",
                        borderColor: "#f58c86",
                      },
                    }}
                  >
                    <Delete sx={{ fontSize: "1.75rem" }}></Delete>
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      navigate(`/Sixthpage/kcic/edit/?type=${data}`);
                    }}
                    sx={{
                      color: "#00a6fb",
                      backgroundColor: "#f3f3f4",
                      padding: "12px 48px",
                      fontSize: "1rem",
                      "&:hover": {
                        color: "#f3f3f4",
                        backgroundColor: "#00a6fb",
                      },
                    }}
                  >
                    {data}
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => handleClick(i)}
                    sx={{
                      color: "#00a6fb",
                      padding: "12px ",
                      fontSize: "1rem",
                      borderColor: "#00a6fb",
                    }}
                  >
                    {checkedItem === i ? (
                      <CheckBox sx={{ fontSize: "1.75rem" }} />
                    ) : (
                      <CheckBoxOutlineBlank sx={{ fontSize: "1.75rem" }} />
                    )}
                  </Button>
                </div>
              );
            })}
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
            onClick={() => {
              handlePrev();
            }}
          >
            Kembali
          </Button>
          <Button
            variant="outlined"
            endIcon={<Add />}
            onClick={() => {
              handleAdd();
            }}
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
            Tambah
          </Button>
        </div>
      </Container>
    </>
  );
}

export default ScoringKCIC;
