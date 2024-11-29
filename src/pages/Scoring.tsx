import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { currentInstructor } from "@/context/auth";
import {
  AlertColor,
  Box,
  Button,
  IconButton,
  TextField,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
} from "@mui/material";
import { AddBox, Delete, Visibility, VisibilityOff } from "@mui/icons-material";
import Container from "@/components/Container";
import { flushSync } from "react-dom";
import fs from "fs";
import { createScoringAsAdmin, createScoringAsInstructor, editScoringAsInstructor } from "@/services/scoring.services";
import { editScoringAsAdmin } from "@/services/scoring.services";
import { getScoringDetail } from "@/services/scoring.services";
import { getScoringByCourse, getScoringByCourseInstructor, getScoringListByCourse, getScoringListByCourseInstructor } from "@/services/scoring.services";
import { toast } from 'react-toastify';

interface ToastData {
  severity: AlertColor;
  msg: string;
}

interface Penilaian {
  unit: number;
  judul: string;
  disable: boolean;
  data: any[];
}

interface Poin {
  observasi: string;
  id: string;
  nilai: number;
  bobot: string;
  disable: boolean;
}

function useQuery() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}

function EditKCIC() {
  const query = useQuery();

  const navigate = useNavigate();
  const type = query.get("type");
  const courseID = query.get("courseID");
  const train = query.get("train");
  const mode = query.get("mode");
  const [formatPrompt, setFormatPrompt] = useState(false);

  const jsonPath = "C:/Train Simulator/Data/ModuleTemplate.json"
  // const jsonPath = "src/config/ModuleTemplate.json"
  const [json, setJSON] = useState<any>(null);

  const [scoringModule, setScoringModule] = useState<any[]>([]);

  const rawData = fs.readFileSync(jsonPath, "utf-8");

  const getModule = async () => {
    try{
      const res = await getScoringDetail(type as string);
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
        setJsonToWrite(res);

      } catch (e) {
        console.error(e);
      }
    };
    if (type !== "default") {
      fetchData();
    }
  }, [type]);

  const [open, setOpen] = useState(false);
  const [toastData, setToastData] = useState<ToastData>({
    severity: "error",
    msg: "",
  });

  const handlePrev = () => {
    if (currentInstructor.isAdmin) {
      navigate("/scoringlist/coursedetail?id=" + courseID);
    } else {
      navigate("/scoringlist/coursedetail?id=" + courseID+"&type="+train);
    }
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = () => {
    document.getElementById('penilaian-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  };

  const handleEmptyFormat = (obj: any) => {
    if (
      obj === null ||
      obj === "" ||
      (Array.isArray(obj) && obj.length === 0)
    ) {
      return true;
    }

    if (typeof obj === "object") {
      for (const key in obj) {
        if (obj.hasOwnProperty(key) && key !== "log_eror") {
          if (handleEmptyFormat(obj[key])) {
            return true;
          }
        }
      }
    }

    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        if (handleEmptyFormat(obj[i])) {
          return true;
        }
      }
    }

    return false;
  };
  

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { currentTarget } = e;

    try {
        setIsLoading(true);

        // Extract form data
        const data = new FormData(currentTarget);
        const judulAll = data.getAll("judul");
        const langkahKerjaAll = data.getAll("langkah_kerja");
        const observasiAll = data.getAll("observasi");
        const bobotPoinAll = data.getAll("bobot-poin");
        const bobotDataAll = data.getAll("bobot-data");

        const newTitle = jsonToWrite?.judul_penilaian || "";

        const existingTitles = scoringModule.map((item) => item.title);

        if (mode === "new") {
          if (existingTitles.includes(newTitle)) {
            toast.error('Judul penilaian sudah tersedia, silahkan pilih judul lainnya', {
              position: 'top-center',
            });
            return;
          }
        }

        if (!newTitle.trim()) {
          toast.error('Judul penilaian tidak boleh kosong', {
            position: 'top-center',
          });
          return;
        }

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

        const isFormatValid = jsonToWrite.penilaian.every((penilaian: any, i: number) => {
          const langkahKerjaCount = penilaian.data.length;
          return langkahKerjaCount > 0 && penilaian.data.every((data: any) => {
              return data.poin.length > 0; // Pastikan ada poin untuk setiap langkah kerja
          });
        });

        if (!isFormatValid) {
            setFormatPrompt(true);
            toast.error('Format data tidak sesuai. Pastikan setiap judul penilaian memiliki unit kompetensi dan setiap unit kompetensi memiliki langkah kerja dan setiap langkah kerja memiliki poin observasi observasi.', {
                position: 'top-center',
            });
            return;
        }

        const formData = new FormData();
        formData.append('file', new Blob([JSON.stringify(jsonToWrite, null, 2)], { type: 'application/json' }), 'data.json');
        formData.append('courseId', courseID);
        formData.append('title', newTitle);
        formData.append('description', train);
        console.log("form", formData);

        if (mode === "new") {
            if (currentInstructor.isAdmin) {
                await createScoringAsAdmin(formData);
            } else {
                await createScoringAsInstructor(formData);
            }
        } else {
            if (currentInstructor.isAdmin) {
                await editScoringAsAdmin(type as string, formData);
            } else {
                await editScoringAsInstructor(type as string, formData);
            }
        }

        setToastData({
            severity: "success",
            msg: `Successfully saved json.`,
        });

        navigate("/scoringlist/coursedetail?id=" + courseID + "&type=" + train);
        
        
    } catch (e) {
        console.error(e);
        setToastData({
            severity: "error",
            msg: `Failed to save json. Please try again later.`,
        });
        setOpen(true);
    } finally {
        setIsLoading(false);
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

  useEffect(() => {
    console.log("INI SCORING", scoringModule);
  }, [scoringModule]);

  useEffect(() => {
    const getModulePenilaianByAdmin = async (
      id: any,
    ) => {
      try {
        setIsLoading(true);
        let res;
        if (currentInstructor.isAdmin) {
          res = await getScoringListByCourse(id);
        } else {
          res = await getScoringListByCourseInstructor(id);
        }
        console.log("Module Penilaian Admin: ", res);
        setScoringModule(res.results);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    const getModulePenilaianByInstructor = async (
      id: any,
    ) => {
      try {
        setIsLoading(true);
        const res = await getScoringListByCourseInstructor(id);
        console.log("Module Penilaian: ", res);
        setScoringModule(res.results);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    if (courseID) {
      if (currentInstructor.isAdmin) {
        getModulePenilaianByAdmin(courseID);
      } else {
        getModulePenilaianByInstructor(courseID);
      }
    }
  }, []);

  const handleAddUnit = () => {
    const newNilai = {
      unit: jsonToWrite?.penilaian?.length + 1,
      judul: `Unit Kompetensi ${jsonToWrite?.penilaian.length + 1}`,
      disable: false,
      data: Array<any>(),
    };
    setJsonToWrite((prev: any) => ({
      ...prev,
      penilaian: [...prev.penilaian, newNilai],
    }));
  };

  const handleJudulUnitChange = (index: number, newJudul: string) => {
    setJsonToWrite((prev: { penilaian: Penilaian[] }) => {
      const updatedPenilaian = [...prev.penilaian];
      updatedPenilaian[index].judul = newJudul; // Update judul untuk unit yang sesuai
      return { ...prev, penilaian: updatedPenilaian };
    });
  };

  const handleDeleteUnit = (index: number) => {
    setJsonToWrite((prev: { penilaian: Penilaian[] }) => {
      const updatedPenilaian = prev.penilaian.filter((_, i: number) => i !== index);
      
      const updatedUnits = updatedPenilaian.map((penilaian, i: number) => ({
        ...penilaian,
        unit: i + 1,
      }));
  
      return { ...prev, penilaian: updatedUnits };
    });
  };

  const handleAddLangkahKerja = (unitIndex: number) => {
    setJsonToWrite((prev: { penilaian: Penilaian[] }) => {
      const updatedPenilaian = [...prev.penilaian];
      const newData = {
        no: updatedPenilaian[unitIndex].data.length + 1,
        langkah_kerja: `Langkah Kerja ${updatedPenilaian[unitIndex].data.length + 1}`,
        bobot: "1",
        disable: updatedPenilaian[unitIndex].disable,
        poin: Array<any>(),
      };
      
      updatedPenilaian[unitIndex].data.push(newData);
  
      updatedPenilaian[unitIndex].data.forEach((data, index) => {
        data.no = index + 1;
      });
  
      return { ...prev, penilaian: updatedPenilaian };
    });
  };

  const handleJudulLangkahKerjaChange = (unitIndex: number, langkahKerjaIndex: number, newJudul: string) => {
    setJsonToWrite((prev: { penilaian: Penilaian[] }) => {
      const updatedPenilaian = [...prev.penilaian];
      updatedPenilaian[unitIndex].data[langkahKerjaIndex].langkah_kerja = newJudul;
      return { ...prev, penilaian: updatedPenilaian };
    });
  };
  
  const handleDeleteLangkahKerja = (unitIndex: number, dataIndex: number) => {
    setJsonToWrite((prev: { penilaian: Penilaian[] }) => {
      const updatedPenilaian = [...prev.penilaian];
      
      updatedPenilaian[unitIndex].data.splice(dataIndex, 1);
      
      updatedPenilaian[unitIndex].data.forEach((data, index) => {
        data.no = index + 1;
      });
  
      return { ...prev, penilaian: updatedPenilaian };
    });
  };

  const handleAddPoinObservasi = (unitIndex: number, langkahKerjaIndex: number) => {
    setJsonToWrite((prev: { penilaian: Penilaian[] }) => {
      const updatedPenilaian = [...prev.penilaian];
      const newPoin = {
        observasi: `Poin Observasi ${updatedPenilaian[unitIndex].data[langkahKerjaIndex].poin.length + 1}`,
        id: `K${unitIndex + 1}.${langkahKerjaIndex + 1}.${updatedPenilaian[unitIndex].data[langkahKerjaIndex].poin.length + 1}`,
        nilai: 0,
        bobot: "1",
        disable: false,
      };
      updatedPenilaian[unitIndex].data[langkahKerjaIndex].poin.push(newPoin);

      return { ...prev, penilaian: updatedPenilaian };
    });
  };
  
  const handleJudulPoinObservasiChange = (unitIndex: number, langkahKerjaIndex: number, poinIndex: number, newJudul: string) => {
    setJsonToWrite((prev: { penilaian: Penilaian[] }) => {
      const updatedPenilaian = [...prev.penilaian];
      updatedPenilaian[unitIndex].data[langkahKerjaIndex].poin[poinIndex].observasi = newJudul; // Update judul poin observasi
      return { ...prev, penilaian: updatedPenilaian };
    });
  };
  
  const handleDeletePoinObservasi = (unitIndex: number, langkahKerjaIndex: number, poinIndex: number) => {
    setJsonToWrite((prev: { penilaian: Penilaian[] }) => {
      const updatedPenilaian = [...prev.penilaian];
      updatedPenilaian[unitIndex].data[langkahKerjaIndex].poin.splice(poinIndex, 1); // Hapus poin observasi berdasarkan indeks
  
      // Memperbarui ID untuk poin observasi yang tersisa
      updatedPenilaian[unitIndex].data[langkahKerjaIndex].poin.forEach((poin: Poin, index: number) => {
        poin.id = `K${unitIndex + 1}.${langkahKerjaIndex + 1}.${index + 1}`; // Memperbarui ID poin
      });
  
      return { ...prev, penilaian: updatedPenilaian };
    });
  };

  return (
    <>
      <Container w={1000}>
        <div className="p-6">
          <div className="flex flex-col gap-4 w-full">
            <h1
              className="w-full text-center pt-9 px-6"
              style={{ fontSize: "2rem", fontWeight: "bold" }}
            >
              Penilaian Kereta
              <IconButton
                aria-label="add unit kompetensi"
                size="large"
                color="success"
                className="mb-1"
                // onClick={() => {
                //   const newNilai = {
                //     unit: jsonToWrite?.penilaian?.length + 1,
                //     judul: `Unit Kompetensi ${jsonToWrite?.penilaian.length + 1}`,
                //     disable: false,
                //     data: Array<any>(),
                //   };
                //   jsonToWrite.penilaian.push(newNilai);
                //   setJsonToWrite({ ...jsonToWrite });

                //   flushSync;
                // }}
                onClick={handleAddUnit}
              >
                <AddBox fontSize="inherit" />
              </IconButton>
            </h1>
            <div className="flex flex-col justify-center items-center">
              <TextField
                className="w-1/3 text-center px-6"
                style={{ fontSize: "2.75rem", fontWeight: "bold" }}
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
                          value={nilai.judul}
                          type="string"
                          className="flex-auto  mx-1"
                          size="small"
                          name="judul"
                          inputProps={{
                            readOnly: nilaiDisabled,
                          }}
                          multiline
                          onChange={(e) => handleJudulUnitChange(i, e.target.value)}
                        />
                        <IconButton
                          color="success"
                          // onClick={() => {
                          //   const newData = {
                          //     no: nilai.data.length + 1,
                          //     langkah_kerja: `Langkah Kerja ${
                          //       nilai.data.length + 1
                          //     }`,
                          //     bobot: "1",
                          //     disable: nilaiDisabled,
                          //     poin: new Array<any>(),
                          //   };
                          //   nilai.data.push(newData);
                          //   setJsonToWrite({ ...jsonToWrite });
                          // }}
                          onClick={() => handleAddLangkahKerja(i)}
                        >
                          <AddBox />
                        </IconButton>
                        <IconButton
                          color="error"
                          // onClick={() => {
                          //   jsonToWrite.penilaian.splice(i, 1);
                          //   setJsonToWrite({ ...jsonToWrite });
                          // }}
                          onClick={() => handleDeleteUnit(i)}
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
                                    value={data.langkah_kerja}
                                    type="string"
                                    className="w-full mx-1"
                                    size="small"
                                    name="langkah_kerja"
                                    inputProps={{
                                      readOnly: dataDisabled,
                                    }}
                                    multiline
                                    onChange={(e) => handleJudulLangkahKerjaChange(i, j, e.target.value)}
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
                                  // onClick={() => {
                                  //   const newPoin = {
                                  //     observasi: `Poin Observasi ${
                                  //       data.poin.length + 1
                                  //     }`,
                                  //     id: `K${i + 1}.${j + 1}.${
                                  //       data.poin.length + 1
                                  //     }`,
                                  //     nilai: 0,
                                  //     bobot: "1",
                                  //     disable: dataDisabled,
                                  //   };
                                  //   data.poin.push(newPoin);
                                  //   setJsonToWrite({ ...jsonToWrite });
                                  // }}
                                  onClick={() => handleAddPoinObservasi(i, j)}
                                >
                                  <AddBox />
                                </IconButton>

                                <IconButton
                                  color="error"
                                  // onClick={() => {
                                  //   nilai.data.splice(j, 1);
                                  //   setJsonToWrite({ ...jsonToWrite });
                                  // }}
                                  onClick={() => handleDeleteLangkahKerja(i, j)}
                                >
                                  <Delete />
                                </IconButton>
                              </section>

                              <div>
                                {data.poin.map((poin: any, k: number) => {
                                  const { disable: poinDisabled } = poin;

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
                                          value={poin.observasi}
                                          type="string"
                                          className="w-full"
                                          size="small"
                                          name="observasi"
                                          inputProps={{
                                            readOnly: poinDisabled,
                                          }}
                                          multiline
                                          onChange={(e) => handleJudulPoinObservasiChange(i, j, k, e.target.value)}
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
                                        // onClick={() => {
                                        //   data.poin.splice(k, 1);
                                        //   setJsonToWrite({ ...jsonToWrite });
                                        // }}
                                        onClick={() => handleDeletePoinObservasi(i, j, k)}
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
                {mode === "edit" && (
                  <Button
                    variant="text"
                    onClick={handleConfirm}
                    sx={{
                      color: "#00a6fb",
                      "&:hover": {
                        color: "#00a6fb",
                      },
                    }}
                  >
                    Simpan
                  </Button>
                )}
                {mode === "new" && (
                  <Button
                    variant="text"
                    type="submit"
                    form="penilaian-form"
                    sx={{
                      color: "#00a6fb",
                      "&:hover": {
                        color: "#00a6fb",
                      },
                    }}
                  >
                    Buat
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* <Dialog open={formatPrompt} onClose={() => setFormatPrompt(false)}>
            <DialogContent className="min-w-[260px] text-lg">
              Format modul penilaian yang anda masukkan masih salah.
              <br></br>Harap lengkapi terlebih dahulu.
            </DialogContent>
            <DialogActions className="flex mb-2 justify-between">
              <Button
                className="mx-2 text-lg"
                onClick={() => {
                  setFormatPrompt(false);
                  setIsLoading(false);
                }}
                color="error"
              >
                Kembali
              </Button>
            </DialogActions>
          </Dialog> */}
        </div>

        <footer ref={bottom}></footer>
      </Container>
    </>
  );
}

export default EditKCIC;
