import { Dialog, DialogTitle, DialogContent, DialogContentText, TextField, FormControl, InputLabel, Select, MenuItem, DialogActions, Button, Checkbox, FormControlLabel, Slider, InputAdornment, Input } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import { TimePicker } from "@mui/x-date-pickers";
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';


interface ModulDialogProps {
  open: boolean;
  setOpen: () => void;
  mode: 'add' | 'edit';
  payload?: any;
  moduleName: string;
  setModuleName: (name: string) => void;
  train: string;
  setTrain: (train: string) => void;
  trainWeight: string;
  setTrainWeight: (weight: string) => void;
  trainLine: string;
  setTrainLine: (line: string) => void;
  startStation: string;
  setStartStation: (station: string) => void;
  finishStation: string;
  setFinishStation: (station: string) => void;
  rainStatus: string;
  setRainStatus: (status: string) => void;
  time: dayjs.Dayjs | null;
  setTime: (time: dayjs.Dayjs | null) => void;
  motionBase: boolean;
  handleMotionBaseChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  speedBuzzer: boolean;
  handleSpeedBuzzerChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fog: number;
  handleSliderChange: (e: Event, newValue: number | number[]) => void;
  jarakPandang: number;
  speedLimit: string;
  setSpeedLimit: (limit: string) => void;
  error: string;
  handleSpeedLimitChange: (e: any) => void;
  handletWeightChange: (e: any) => void;
  handleRegister: () => void;
  isAddButtonEnabled: boolean;
  sourceSettings: any;
  trainLines: string[];
  startStations: string[];
  finishStations: string[];
  getDisplayStationName: (station: string) => string;
  getPayloadStationName: (station: string) => string;
}

const ModulDialog: React.FC<ModulDialogProps> = ({
  open,
  setOpen,
  mode,
  payload,
  moduleName,
  setModuleName,
  train,
  setTrain,
  trainWeight,
  setTrainWeight,
  trainLine,
  setTrainLine,
  startStation,
  setStartStation,
  finishStation,
  setFinishStation,
  rainStatus,
  setRainStatus,
  time,
  setTime,
  motionBase,
  handleMotionBaseChange,
  speedBuzzer,
  handleSpeedBuzzerChange,
  fog,
  handleSliderChange,
  jarakPandang,
  speedLimit,
  setSpeedLimit,
  error,
  handleSpeedLimitChange,
  handletWeightChange,
  handleRegister,
  isAddButtonEnabled,
  sourceSettings,
  trainLines,
  startStations,
  finishStations,
  getDisplayStationName,
  getPayloadStationName,
}) => {

  const [formattedTime, setFormattedTime] = useState<string>('');

  useEffect(() => {
    if (time && typeof time.format === 'function') {
      const formatted = time.format('HH:00');
      setFormattedTime(formatted);
    }
  }, [time]);

  return (
    <Dialog open={open} onClose={() => setOpen()}>
        <DialogTitle className="px-6 pt-6">
          {mode === 'add' 
            ? 'Tambah Modul Pembelajaran Baru' 
            : `Edit Modul Pembelajaran - ${payload?.module_name || ''}`}
        </DialogTitle>
        <DialogContent className="w-[600px] px-6">
          <DialogContentText>
            {mode === 'add' 
              ? 'Penambahan Modul Pembelajaran' 
              : `Pengeditan Modul Pembelajaran - ${payload?.module_name || ''}`}
          </DialogContentText>
          <TextField
            autoFocus
            margin="normal"
            id="modulName"
            label={<span>Nama Modul Pembelajaran <span style={{ color: 'red' }}>*</span></span>}
            type="text"
            fullWidth
            variant="standard"
            value={moduleName}
            onChange={(e) => setModuleName(e.target.value)}
          />
          <FormControl fullWidth variant="standard" margin="normal">
            <InputLabel id="train-label">Jenis Kereta <span style={{ color: 'red' }}>*</span></InputLabel>
            <Select
              labelId="train-label"
              id="train"
              value={train}
              onChange={(e) => {
                setTrain(e.target.value);
                setTrainLine(''); // Reset trainLine when train changes
                setStartStation(''); // Reset startStation when train changes
                setFinishStation(''); // Reset finishStation when train changes
              }}
            >
              {Object.keys(sourceSettings).map((key) => (
                <MenuItem key={key} value={key}>{key.toUpperCase() === "KCIC" ? "Kereta Cepat" : key.toUpperCase()}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="normal"
            id="Spesifikasi Kereta"
            label={<span>Berat Kereta (ton) <span style={{ color: 'red' }}>*</span></span>}
            type="number"
            fullWidth
            variant="standard"
            value={trainWeight}
            onChange={handletWeightChange}
          />
          
          <FormControl fullWidth variant="standard" margin="normal" disabled={!train}>
            <InputLabel id="train-label">Line Kereta <span style={{ color: 'red' }}>*</span></InputLabel>
            <Select
              labelId="train-line-label"
              id="train-line"
              value={trainLine}
              onChange={(e) => {
                setTrainLine(e.target.value);
                setStartStation(''); // Reset startStation when trainLine changes
                setFinishStation(''); // Reset finishStation when trainLine changes
              }}
              label="Line Kereta"
            >
              {trainLines.map((line) => (
                <MenuItem key={line} value={line}>{line}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth variant="standard" margin="normal" disabled={!trainLine}>
            <InputLabel id="train-label">Stasiun Awal <span style={{ color: 'red' }}>*</span></InputLabel>
            <Select
              labelId="start-station-label"
              id="start-station"
              value={getDisplayStationName(startStation)}
              onChange={(e) => {
                setStartStation(getPayloadStationName(e.target.value));
                setFinishStation('');
              }}
              label="Stasiun Awal"
            >
              {startStations.map((station) => (
                <MenuItem key={station} value={getDisplayStationName(station)}>{getDisplayStationName(station)}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth variant="standard" margin="normal" disabled={!startStation}>
            <InputLabel id="train-label">Stasiun Akhir <span style={{ color: 'red' }}>*</span></InputLabel>
            <Select
              labelId="finish-station-label"
              id="finish-station"
              value={getDisplayStationName(finishStation)}
              onChange={(e) => setFinishStation(getPayloadStationName(e.target.value))}
              label="Stasiun Akhir"
            >
              {finishStations.map((station) => (
                <MenuItem key={station} value={getDisplayStationName(station)}>{getDisplayStationName(station)}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth variant="standard" margin="normal">
            <InputLabel id="train-label">Status Hujan <span style={{ color: 'red' }}>*</span></InputLabel>
            <Select
              labelId="rain-status"
              id="rainStatus"
              value={rainStatus}
              onChange={(e) => {
                setRainStatus(e.target.value);
              }}
              label="Status Hujan"
            >
                <MenuItem value="Cerah">Cerah</MenuItem>
                <MenuItem value="Ringan">Ringan</MenuItem>
                <MenuItem value="Sedang">Sedang</MenuItem>
                <MenuItem value="Deras">Deras</MenuItem>
            </Select>
          </FormControl>
          <div className="mb-2 mt-8 flex items-center w-full">
          <TimePicker
            label={<span>Waktu <span style={{ color: 'red' }}>*</span></span>}
            ampm={false}
            value={time}
            onChange={(newWaktu) => {
              if (newWaktu && typeof newWaktu.format === 'function') {
                setTime(newWaktu); // Set the new time object
              }
            }}
            className="flex-grow"
            timeSteps={{ minutes: 60 }}
          />
          </div>
          <div className="flex items-center justify-center mt-4 space-x-4">
            <FormControlLabel
              control={
                <Checkbox
                  checked={motionBase}
                  onChange={handleMotionBaseChange}
                  name="motionBase"
                />
              }
              label="Motion Base"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={speedBuzzer}
                  onChange={handleSpeedBuzzerChange}
                  name="speedBuzzer"
                />
              }
              label="Speed Buzzer"
            />
          </div>
          <div className="flex items-center mt-5">Jarak Pandang</div>
          <div className="flex items-center mt-3 gap-3">
            <Visibility className="my-[0.5px] mr-2 text-gray-600" />
            <div className="flex-grow">
              <Slider
                className="flex-grow"
                min={0}
                max={100}
                step={0.25}
                value={fog}
                onChange={handleSliderChange}
              />
            </div>
            <Input
              value={jarakPandang}
              readOnly
              className="w-28"
              size="small"
              onFocus={(e) => e.target.select()}
              endAdornment={
                <InputAdornment
                  position="start"
                  className={`${
                    jarakPandang !== 0 ? "text-base" : "text-xs"
                  }`}
                >
                  {jarakPandang !== 0 ? "meter" : "Tidak berkabut"}
                </InputAdornment>
              }
            />
          </div>
          <TextField
            margin="normal"
            id="Speed Limit"
            label={
              <span>
                Speed Limit (km/h) {speedBuzzer && <span style={{ color: 'red' }}>*</span>}
              </span>
            }
            type="number"
            fullWidth
            variant="standard"
            value={speedLimit}
            onChange={handleSpeedLimitChange}
            error={!!error}
            helperText={error}
            disabled={!speedBuzzer}
          />
        </DialogContent>
        <DialogActions className="px-6 pb-4">
          <Button onClick={() => setOpen()} color="error">
            Kembali
          </Button>
          <Button
            onClick={handleRegister} 
            disabled={!isAddButtonEnabled}
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
            variant="contained"
          >
            {mode === 'add' ? 'Tambah' : 'Simpan Perubahan'}
          </Button>
        </DialogActions>
      </Dialog>
  )
}

export default ModulDialog;