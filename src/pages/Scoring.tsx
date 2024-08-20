import { useEffect, useMemo, useRef, useState } from "react";
// import "../App.css";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertColor,
  Box,
  Button,
  FormControl,
  IconButton,
  TextField,
  Tooltip,
} from "@mui/material";
import { AddBox, Delete, Visibility, VisibilityOff } from "@mui/icons-material";
import Container from "@/components/Container";
import ConfirmationModal from "@/components/ConfirmationModal";
// import { default as sourceKCIC } from "C:/Train Simulator/Data/MockJSON_MRT.json";
import { flushSync } from "react-dom";
import fs from "fs";
import { createScoringAsAdmin } from "@/services/scoring.services";
import { editScoringAsAdmin } from "@/services/scoring.services";
import { getScoringDetail } from "@/services/scoring.services";
import { get, set } from "lodash";

interface ToastData {
  severity: AlertColor;
  msg: string;
}

function useQuery() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}

function EditKCIC() {
  // const jsonPath = "C:/Train Simulator/Data/MockJSON_MRT.json";
  const query = useQuery();

  const navigate = useNavigate();
  const type = query.get("type");
  console.log("type", type);
  const courseID = query.get("courseID");
  const train = query.get("train");
  const mode = query.get("mode");
  const role = query.get("role");
  const [scoringData, setScoringData] = useState<any>(null);

  const jsonPath = "C:/Train Simulator/Data/ModuleTemplate.json"
  const [json, setJSON] = useState<any>(null);

  const rawData = fs.readFileSync(jsonPath, "utf-8");

  const getModule = async () => {
    try{
      const res = await getScoringDetail(type as string);
      console.log("asd",res.judul_penilaian)
      return res;
    }
    catch (error) {
      console.error(`Error fetching Scoring list:`, error);
    }
  }
  const [jsonToWrite, setJsonToWrite] = useState(() => {
    if (type == "default") {
      return (JSON.parse(rawData));
    }
    else {
      getModule().then((res) => {
        setJSON(res);
      })
      return json;
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getScoringDetail(type);
        console.log("res", res?.judul_penilaian);
        setJsonToWrite(res);
        console.log("json", jsonToWrite);
      } catch (e) {
        console.error(e);
      }
    }; 
    if (type !== "default")
    {
      fetchData();
    }
  }
  , [type]);


  // const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [toastData, setToastData] = useState<ToastData>({
    severity: "error",
    msg: "",
  });

  const handlePrev = () => {
    if (role === "admin") {
      navigate("/admin/scoringlist/coursedetail?id=" + courseID);
    } else {
      navigate("/SixthPage/kcic");
    }
  };
  const handleNext = () => {
    navigate("/");
  };
  const [isLoading, setIsLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [pendingAction, setPendingAction] = useState<Function | null>(null);
  
  const handleModalOpen = (type: string) => {
    setModalType("edit");
    setModalOpen(true);
  }

  const handleConfirm = () => {
    document.getElementById('penilaian-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    setModalOpen(false);
  };
  

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // setNotesOpen(false);
    const { currentTarget } = e;

    try {
      setIsLoading(true);

      // Get input data from form
      const data = new FormData(currentTarget);
      const judulAll = data.getAll("judul");
      const langkahKerjaAll = data.getAll("langkah_kerja");
      const observasiAll = data.getAll("observasi");
      const bobotPoinAll = data.getAll("bobot-poin");
      const bobotDataAll = data.getAll("bobot-data");

      let judulIndex = 0;
      let langkahKerjaIndex = 0;
      let observasiIndex = 0;
      let bobotPoinIndex = 0;
      let bobotDataIndex = 0;

      jsonToWrite?.penilaian.forEach((penilaian: any, i: number) => {
        penilaian.judul = judulAll[judulIndex];
        penilaian.unit = i + 1;

        penilaian.data.forEach((data: any, j: number) => {
          data.langkah_kerja = langkahKerjaAll[langkahKerjaIndex];
          data.no = j + 1;
          data.bobot = bobotDataAll[bobotDataIndex];

          data.poin.forEach((poin: any, k: number) => {
            poin.observasi = observasiAll[observasiIndex];
            poin.id = `K${i + 1}.${j + 1}.${k + 1}`;
            poin.bobot = bobotPoinAll[bobotPoinIndex];

            observasiIndex++;
            bobotPoinIndex++;
          });
          langkahKerjaIndex++;
          bobotDataIndex++;
        });
        judulIndex++;
      });

      // const description = train.toUpperCase();
  
    // Prepare the data object
    
  
    // Prepare the form data
    const formData = new FormData();
    formData.append('file', new Blob([JSON.stringify(jsonToWrite, null, 2)], { type: 'application/json' }), 'data.json');
    formData.append('courseId', courseID);
    formData.append('title', jsonToWrite?.judul_penilaian);
    formData.append('description', train);
    console.log("form", formData);


    // Create the course
    if (mode === "new") {
      await createScoringAsAdmin(formData);
    } else {
      await editScoringAsAdmin(type as string, formData);
    }
    setToastData({
      severity: "success",
      msg: `Successfully saved json.`,
    });
    } catch (e) {
      console.error(e);
      setToastData({
        severity: "error",
        msg: `Failed to save json. Please try again later.`,
      });
      setOpen(true);
    } finally {
      // handlePrev();
      // setIsLoading(false);
      navigate("/admin/scoringlist/coursedetail?id=" + courseID);
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>
  ) => {
    const currentVal = Number(e.target.value);
    if (currentVal > 10) e.target.value = (10).toString();
    if (currentVal < 1) e.target.value = (1).toString();
  };

  const bottom = useRef(null);

  useEffect(() => {
    setJsonToWrite(jsonToWrite);
  }, [jsonToWrite]);

  return (
    <>
      <Container w={1000}>
        <div className="p-8">
          <div className="flex flex-col gap-4 w-full">
            <h1
              className="w-full text-center pt-9 pr-8 pl-8"
              style={{ fontSize: "2rem", fontWeight: "bold" }}
            >
              {/* Penilaian Kereta: {sourceKCIC.train_type} */}
              Penilaian Kereta
              {/* Penilaian Kereta: KCIC */}
              {/* {trainType} */}
              <IconButton
                aria-label="add unit kompetensi"
                size="large"
                color="success"
                className="mb-1"
                onClick={() => {
                  const newNilai = {
                    unit: jsonToWrite?.penilaian?.length + 1,
                    judul: "",
                    disable: false,
                    data: new Array<any>(),
                  };
                  jsonToWrite.penilaian.push(newNilai);
                  setJsonToWrite({ ...jsonToWrite });

                  flushSync;
                  // bottom.current.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <AddBox fontSize="inherit" />
              </IconButton>
            </h1>
            <div className="flex flex-col justify-center items-center">
            <TextField
              className="w-1/3 text-center pr-8 pl-8"
              style={{ fontSize: "2.75rem", fontWeight: "bold" }}
              // defaultValue={jsonToWrite?.judul_penilaian}
              value={jsonToWrite?.judul_penilaian}
              onChange={(e) => {jsonToWrite.judul_penilaian = e.target.value; setJsonToWrite({ ...jsonToWrite });}}
            >
            </TextField>
            </div>
            <Box component="form" id="penilaian-form" onSubmit={handleSubmit}>
              <div>
                {jsonToWrite?.penilaian.map((nilai: any, i: number) => {
                  const { disable: nilaiDisabled } = nilai;

                  return (
                    <div key={nilai.unit} className="pt-8">
                      <section
                        className={`flex p-2 gap-4 w-full border border-solid border-slate-200 rounded-lg min-h-[40px] ${
                          nilaiDisabled ? "bg-red-200" : ""
                        }`}
                      >
                        <IconButton
                          aria-label="hide penilaian"
                          onClick={() => {
                            nilai.disable = !nilaiDisabled;
                            nilai.data.forEach((data: any) => {
                              data.disable = nilai.disable;
                              data.poin.forEach(
                                (poin: any) => (poin.disable = nilai.disable)
                              );
                            });
                            setJsonToWrite({ ...jsonToWrite });
                          }}
                        >
                          {nilaiDisabled ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                        <h2
                          className=" self-center mx-1"
                          style={{ fontSize: "1.5rem", fontWeight: "bold" }}
                        >
                          Unit Kompetensi {nilai.unit}:
                        </h2>
                        <TextField
                          defaultValue={nilai.judul}
                          type="string"
                          className="flex-auto  mx-1"
                          size="small"
                          name="judul"
                          inputProps={{
                            readOnly: nilaiDisabled,
                          }}
                          multiline
                        />
                        <IconButton
                          color="success"
                          onClick={() => {
                            const newData = {
                              no: nilai.data.length + 1,
                              langkah_kerja: "",
                              disable: nilaiDisabled,
                              poin: new Array<any>(),
                            };
                            nilai.data.push(newData);
                            setJsonToWrite({ ...jsonToWrite });
                          }}
                        >
                          <AddBox />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => {
                            jsonToWrite.penilaian.splice(i, 1);
                            setJsonToWrite({ ...jsonToWrite });
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </section>

                      <div>
                        {nilai.data.map((data: any, j: number) => {
                          const { disable: dataDisabled } = data;

                          return (
                            <div key={data.no} className="ml-12">
                              <section
                                className={`mt-8 flex flex-row gap-4  p-2 border border-solid border-slate-200 rounded-lg min-h-[40px] ${
                                  dataDisabled ? "bg-red-200" : ""
                                }`}
                              >
                                <IconButton
                                  aria-label="hide data"
                                  onClick={() => {
                                    if (!nilaiDisabled) {
                                      data.disable = !dataDisabled;
                                      data.poin.forEach(
                                        (poin: any) =>
                                          (poin.disable = data.disable)
                                      );
                                      setJsonToWrite({ ...jsonToWrite });
                                    }
                                  }}
                                >
                                  {dataDisabled ? (
                                    <VisibilityOff />
                                  ) : (
                                    <Visibility />
                                  )}
                                </IconButton>

                                <p className="mx-1 self-center px-3">
                                  {j + 1}.
                                </p>

                                {/* langkah kerja */}
                                <Tooltip
                                  title="Langkah Kerja"
                                  placement="top-start"
                                  slotProps={{
                                    popper: {
                                      modifiers: [
                                        {
                                          name: "offset",
                                          options: {
                                            offset: [0, -14],
                                          },
                                        },
                                      ],
                                    },
                                  }}
                                >
                                  <TextField
                                    defaultValue={data.langkah_kerja}
                                    type="string"
                                    className="w-full mx-1"
                                    size="small"
                                    // disabled={dataDisabled}
                                    name="langkah_kerja"
                                    inputProps={{
                                      readOnly: dataDisabled,
                                    }}
                                    multiline
                                  >
                                    {data.langkah_kerja}
                                  </TextField>
                                </Tooltip>

                                <Tooltip
                                  title="Bobot nilai"
                                  placement="top"
                                  slotProps={{
                                    popper: {
                                      modifiers: [
                                        {
                                          name: "offset",
                                          options: {
                                            offset: [0, -14],
                                          },
                                        },
                                      ],
                                    },
                                  }}
                                >
                                  <TextField
                                    defaultValue={data.bobot}
                                    type="number"
                                    size="small"
                                    className="w-24 mx-2"
                                    name="bobot-data"
                                    inputProps={{
                                      readOnly: dataDisabled,
                                      min: 1,
                                      max: 10,
                                    }}
                                    onBlur={handleBlur}
                                  />
                                </Tooltip>

                                <IconButton
                                  color="success"
                                  onClick={() => {
                                    const newPoin = {
                                      observasi: "",
                                      id: `K${i + 1}.${j + 1}.${
                                        data.poin.length + 1
                                      }`,
                                      nilai: 0,
                                      disable: dataDisabled,
                                    };
                                    data.poin.push(newPoin);
                                    setJsonToWrite({ ...jsonToWrite });
                                  }}
                                >
                                  <AddBox />
                                </IconButton>

                                <IconButton
                                  color="error"
                                  onClick={() => {
                                    nilai.data.splice(j, 1);
                                    setJsonToWrite({ ...jsonToWrite });
                                  }}
                                >
                                  <Delete />
                                </IconButton>
                              </section>

                              <div>
                                {data.poin.map((poin: any, k: number) => {
                                  const { disable: poinDisabled } = poin;

                                  // poin observasi
                                  return (
                                    <div
                                      key={poin.id}
                                      className={`flex flex-row gap-4 my-2 ml-12 items-center rounded-lg p-2 border border-solid border-slate-200 min-h-[40px] ${
                                        poinDisabled ? "bg-red-200" : ""
                                      }`}
                                    >
                                      <IconButton
                                        aria-label="hide poin"
                                        onClick={() => {
                                          if (!dataDisabled) {
                                            poin.disable = !poinDisabled;
                                            setJsonToWrite({ ...jsonToWrite });
                                          }
                                        }}
                                      >
                                        {poinDisabled ? (
                                          <VisibilityOff />
                                        ) : (
                                          <Visibility />
                                        )}
                                      </IconButton>

                                      <p className="mx-1 self-center px-3">
                                        {k + 1}.
                                      </p>

                                      <Tooltip
                                        title="Poin Observasi"
                                        placement="top-start"
                                        slotProps={{
                                          popper: {
                                            modifiers: [
                                              {
                                                name: "offset",
                                                options: {
                                                  offset: [0, -14],
                                                },
                                              },
                                            ],
                                          },
                                        }}
                                      >
                                        <TextField
                                          defaultValue={poin.observasi}
                                          type="string"
                                          className="w-full"
                                          size="small"
                                          // disabled={poinDisabled}
                                          name="observasi"
                                          inputProps={{
                                            readOnly: poinDisabled,
                                          }}
                                          multiline
                                        />
                                      </Tooltip>

                                      <Tooltip
                                        title="Bobot nilai"
                                        placement="top"
                                        slotProps={{
                                          popper: {
                                            modifiers: [
                                              {
                                                name: "offset",
                                                options: {
                                                  offset: [0, -14],
                                                },
                                              },
                                            ],
                                          },
                                        }}
                                      >
                                        <TextField
                                          defaultValue={poin.bobot}
                                          type="number"
                                          size="small"
                                          className="w-24"
                                          name="bobot-poin"
                                          inputProps={{
                                            readOnly: poinDisabled,
                                            min: 1,
                                            max: 10,
                                          }}
                                          onBlur={handleBlur}
                                        />
                                      </Tooltip>

                                      <IconButton
                                        aria-label="delete poin"
                                        color="error"
                                        onClick={() => {
                                          data.poin.splice(k, 1);
                                          setJsonToWrite({ ...jsonToWrite });
                                        }}
                                        // disabled
                                      >
                                        <Delete />
                                      </IconButton>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Box>
          </div>

          <div className="flex w-full justify-center items-center fixed bottom-0 left-0 shadow-lg">
            <div className="w-[600px] rounded-full flex px-4 py-3 mb-4 border-2 border-solid border-blue-400 bg-slate-50">
              {/* nav */}
              <div className="flex gap-4 justify-between w-full">
                <Button
                  type="button"
                  color="error"
                  variant="text"
                  sx={{
                    color: "#df2935",
                    "&:hover": {
                      color: "#ec625e",
                    },
                  }}
                  onClick={() => {
                    handlePrev();
                  }}
                >
                  Batal
                </Button>
                {
                  mode === "edit" && (
                <Button
                  variant="text"
                  // type="submit"
                  // form="penilaian-form"
                  onClick={() => {
                    handleModalOpen("edit");
                  }}
                  sx={{
                    color: "#00a6fb",
                    "&:hover": {
                      color: "#00a6fb",
                    },
                  }}
                >
                  Simpan
                </Button>
                  )
                }
                {
                  mode === "new" && (
                    <Button
                  variant="text"
                  type="submit"
                  form="penilaian-form"
                  // onClick={() => {
                  //   handleSubmit;
                  // }}
                  sx={{
                    color: "#00a6fb",
                    "&:hover": {
                      color: "#00a6fb",
                    },
                  }}
                >
                  Buat
                </Button>
                  )
                }
              </div>
            </div>
          </div>
          <ConfirmationModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onConfirm={handleConfirm}
            type={modalType}
            item={type}
          />
        </div>

        <footer ref={bottom}></footer>
      </Container>
    </>
  );
}

export default EditKCIC;
