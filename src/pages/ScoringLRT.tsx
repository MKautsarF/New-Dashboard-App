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

function ScoringLRT() {
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
    const storedVal = localStorage.getItem("scoringLRTVal");
    if (storedVal) {
      setVal(JSON.parse(storedVal));
    }
  }, []);

  const handleAdd = () => {
    const newCount = val.length + 1;
    const newSettings = [...val, `New Settings ${newCount}`];
    setVal(newSettings);
    localStorage.setItem("scoringLRTVal", JSON.stringify(newSettings));
  };

  const handleDelete = (i: any) => {
    const deletVal = [...val];
    deletVal.splice(i, 1);
    setVal(deletVal);
    localStorage.setItem("scoringLRTVal", JSON.stringify(deletVal));
  };

  const handleClick = (index: any) => {
    setCheckedItem(index);
  };

  return (
    <>
      <Container w={900}>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col text-left gap-4 p-8 ">
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
                  handleDelete(i);
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
                {checkedItem === null ? (
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
                      navigate(`/Sixthpage/lrt/edit/?type=${data}`);
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

export default ScoringLRT;
