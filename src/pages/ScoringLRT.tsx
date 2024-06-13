import { useState, useEffect } from "react";
// import "../App.css";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import Container from "@/components/Container";
import ConfirmationModal from "@/components/ConfirmationModal";
import {
  Add,
  Edit,
  Save,
  Delete,
  CheckBox,
  CheckBoxOutlineBlank,
} from "@mui/icons-material";
import { useSettings } from "../context/settings";
import pullAt from "lodash/pullAt";

function ScoringLRT() {
  const navigate = useNavigate();

  const handlePrev = () => {
    navigate("/SecondPage");
  };
  const handleNext = () => {
    navigate("/");
  };

  const [val, setVal] = useState([]);
  const [checkedItem2, setCheckedItem2] = useState(null);

  useEffect(() => {
    // const storedVal = localStorage.getItem("scoringLRTVal");
    // if (storedVal) {
    //   setVal(JSON.parse(storedVal));
    // }

    // Read the settings_train.json file
    const settingsFilePath = "C:/Train Simulator/Data/settings_train.json";
    const fs = require("fs");
    fs.readFile(settingsFilePath, "utf8", (err: any, data: any) => {
      if (err) {
        console.error("Error reading settings file:", err);
        return;
      }

      // Parse JSON data
      const jsonData = JSON.parse(data);

      // Get the score array from the "lrt" section
      const scoreArray = jsonData["lrt"] && jsonData["lrt"]["score"];
      if (scoreArray) {
        setVal(scoreArray.slice(1)); // Assuming the first element is not needed
      }
      // exclude the lrt_ and .json from scoreArray
      // const scoreArray = jsonData["lrt"] && jsonData["lrt"]["score"];
      if (scoreArray) {
        setVal(scoreArray.slice(1).map((item: string) => item.replace('lrt_', '').replace('.json', ''))); // Assuming the first element is not needed
      }
      
    });

    const storedCheckedItem = localStorage.getItem("checkedItem2");
    if (storedCheckedItem !== null) {
      setCheckedItem2(parseInt(storedCheckedItem));
    } else {
      setCheckedItem2(null);
    }
  }, []);

  const fs = require("fs");
  const path = require("path");

  const handleAdd = async () => {
    const newCount = val.length + 1;
    const newSettings = [...val, `New Settings ${newCount}`];
    setVal(newSettings);
    localStorage.setItem("scoringLRTVal", JSON.stringify(newSettings));

    // Duplicate the JSON file
    const sourceFilePath = "C:/Train Simulator/Data/MockJSON_KRL.json";
    const destinationFileName = `lrt_New Settings ${newCount}.json`;
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

          // Update the score array in the lrt section
          settings.lrt.score.push(destinationFileName);

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

  const handleRename = (i: number, newName: string) => {
    const renamedVal = [...val];
    renamedVal[i] = newName;
    setVal(renamedVal);
    localStorage.setItem("scoringLRTVal", JSON.stringify(renamedVal));
    
    // Rename the JSON file
    const sourceFilePath = `C:/Train Simulator/Data/lrt_New Settings ${i + 1}.json`;
    const destinationFileName = `lrt_${newName}.json`;
    const destinationFilePath = path.join(
      "C:/Train Simulator/Data",
      destinationFileName

      );
    const settingPath = "C:/Train Simulator/Data/settings_train.json";
    fs.readFile(settingPath, "utf8", (err: any, settingsData: any) => {
      if (err) {
        console.error("Error reading settings file:", err);
        return;
      }
        
    // Parse the JSON content
    const settings = JSON.parse(settingsData);
    settings.lrt.score[i + 1] = destinationFileName;
    fs.writeFile(
      settingPath,
      JSON.stringify(settings, null, 2),
      (err: any) => {
        if (err) {
          console.error("Error writing settings file:", err);
          return;
        }
        console.log("settings_train.json updated.");
      }
    );
  }
);


  fs.rename(sourceFilePath, destinationFilePath, (err: any) => {
    if (err) {
      console.error("Error renaming file:", err);
      return;
      }
      console.log(`File renamed to ${destinationFileName}`);
      });
      };

  const handleDelete = (i: any) => {
    const deletVal = [...val];
    const deletedName = deletVal[i];
    deletVal.splice(i, 1);
    setVal(deletVal);

    const deletedFilePath = path.join(
      "C:/Train Simulator/Data/",
      `lrt_${deletedName}.json`
    );
    fs.unlink(deletedFilePath, (err: any) => {
      if (err) {
        console.error(`Error deleting file ${deletedName}:`, err);
        return;
      }
      console.log(`File ${deletedName} deleted successfully`);
    });
    localStorage.setItem("scoringLRTVal", JSON.stringify(deletVal));

    // Read the settings_train.json file
    const settingsFilePath = "C:/Train Simulator/Data/settings_train.json"; // Adjust the path as needed

    fs.readFile(settingsFilePath, "utf8", (err: any, data: any) => {
      if (err) {
        console.error("Error reading settings file:", err);
        return;
      }

      // Parse JSON data
      const jsonData = JSON.parse(data);

      // Remove the deleted name from the "lrt" section
      if (jsonData["lrt"] && jsonData["lrt"]["score"]) {
        const deletedFileName = jsonData["lrt"]["score"][i + 1];
        pullAt(jsonData["lrt"]["score"], i + 1); // Remove the element at the specified index

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
              "C:/Train Simulator/Data/",
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

  const handleClick = (index2: any) => {
    setCheckedItem2(index2);
    localStorage.setItem("checkedItem2", index2 === null ? "Default" : index2);
    localStorage.setItem("selectedValue2", val[index2] || "Default"); // scoring lrt
    // Set the selected value in settings
    setSettings((prevSettings) => ({
      ...prevSettings,
      score: val[index2] || "Default", // Assuming val is an array of strings
    }));
  };

  // Function to check if a value is selected
  const isSelected = (index2: number) => {
    return index2 === checkedItem2;
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setNewName(val[index]);
  };

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [modalType, setModalType] = useState<string | null>(null);
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState<string | null>(null);

  const handleModalClose = () => {
    setModalType(null);
    setModalIndex(null);
    setModalOpen(false);
  };

  const handleModalOpen = (type: string, index: number) => {
    setModalType(type);
    setModalItem(val[index]);
    setModalIndex(index);
    setModalOpen(true);
  }
  const handleSave = (index: number) => {
    const updatedVal = [...val];
    updatedVal[index] = newName;
    handleRename(index, newName);
    setVal(updatedVal);
    localStorage.setItem("scoringLRTVal", JSON.stringify(updatedVal));
    setEditingIndex(null);
    setNewName("");
    };
  const handleConfirm = () => {
    if (modalType === 'delete' && modalIndex !== null) {
      handleDelete(modalIndex);
    }
    handleModalClose();
  }

  return (
    <>
      <Container w={900}>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col text-left gap-4 p-8 ">
            {/* {settings.score && <p>Selected Value: {settings.score}</p>} */}
            <h1 style={{ fontSize: "1.75rem", fontWeight: "bold" }}>
              Pengaturan Penilaian LRT
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
                  navigate(`/Sixthpage/lrt/edit/?type=Default`);
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
                {checkedItem2 === null || settings.score === "Default" ? (
                  <CheckBox sx={{ fontSize: "1.75rem" }} />
                ) : (
                  <CheckBoxOutlineBlank sx={{ fontSize: "1.75rem" }} />
                )}
              </Button>
            </div>
            {val.map((data, i) => (
          <div key={i}>
            <Button
              variant="text"
              onClick={() => handleModalOpen("delete", i)}
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
              <Delete sx={{ fontSize: "1.75rem" }} />
            </Button>
            {editingIndex === i ? (
              <>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="border-b-2 border-gray-300 w-48 h-10 text-lg"
                />
                <Button
                  onClick={() => handleSave(i)}
                  sx={{
                    color: "#00a6fb",
                    padding: "12px",
                    fontSize: "1rem",
                    borderColor: "#00a6fb",
                  }}
                >
                  <Save sx={{ fontSize: "1.75rem" }} />
                </Button>
              </>
            ) : (
              <Button
                onClick={() => handleEdit(i)}
                sx={{
                  color: "#00a6fb",
                  padding: "12px",
                  fontSize: "1rem",
                  borderColor: "#00a6fb",
                }}
              >
                <Edit sx={{ fontSize: "1.75rem" }} />
              </Button>
            )}
            <Button
              variant="outlined"
              onClick={() => navigate(`/Sixthpage/lrt/edit/?type=${data}`)}
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
              {checkedItem2 === i ? (
                <CheckBox sx={{ fontSize: "1.75rem" }} />
              ) : (
                <CheckBoxOutlineBlank sx={{ fontSize: "1.75rem" }} />
              )}
            </Button>
          </div>
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
          <ConfirmationModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onConfirm={handleConfirm}
            type={modalType}
            item={modalItem}
          />
        </div>
      </Container>
    </>
  );
}

export default ScoringLRT;
