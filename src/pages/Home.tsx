import { useState } from "react";
// import "../App.css";
import { useNavigate } from "react-router-dom";
import { Button, Dialog, DialogActions, DialogContent, } from "@mui/material";
import Container from "../components/Container";
import Logo from "@/components/Logo";
import { sendTextToClients } from '@/socket';

function App() {
  const navigate = useNavigate();
  const [exitPrompt, setExitPrompt] = useState(false);

  function offApp() {
    // TODO: close other apps and shutdown all pc (IOS 1 & 2, IG)
    try {
      // standbyCCTV('config', 'off');
      // processFile('config', 'off');
      window.close();

      sendTextToClients(JSON.stringify({ status: 'exit' }));
    } catch (error) {
      console.error(error);
    }
  }

  const handleNext = () => {
    navigate("/FirstPage");
  };

  return (
    <>
      <Container w={600}>
        <div className="gap-2 pt-8 flex flex-col items-center justify-center h-full">
          <Logo />
          <h1 className="flex items-center justify-center text-center">
            High Speed Train <br />&<br />Low Rapid Train Launcher
          </h1>
          <p className="text-center">
            a simulation launcher for High Speed Train & Low Rapid Train
          </p>
        </div>
        <div className="flex flex-col gap-4 justify-center px-12 py-8">
          <Button
            type="button"
            variant="outlined"
            className="h-14"
            onClick={() => handleNext()}
            sx={{
              color: "#f3f3f4",
              backgroundColor: "#00a6fb",
              borderColor: "#f3f3f4",
              "&:hover": {
                borderColor: "#4dc1fc",
                color: "#f3f3f4",
                backgroundColor: "#4dc1fc",
              },
            }}
          >
            Start
          </Button>

          <Button
            type="button"
            variant="outlined"
            color="error"
            sx={{
              borderColor: "#ffffff",
              backgroundColor: "#ffffff",
              "&:hover": {
                borderColor: "#df2935",
                color: "#df2935",
                backgroundColor: "#ffffff",
              },
            }}
            onClick={() => {
              setExitPrompt(true);
            }}
          >
            Exit
          </Button>
        </div>
      </Container>

      {/* Exit prompt */}
      <Dialog open={exitPrompt} onClose={() => setExitPrompt(false)}>
        <DialogContent className="min-w-[260px]">
          Keluar Aplikasi?
        </DialogContent>
        <DialogActions className="flex mb-2 justify-between">
          <Button
            className="mx-2"
            onClick={() => setExitPrompt(false)}
            color="primary"
          >
            Tidak
          </Button>
          <Button className="mx-2" onClick={() => offApp()} variant="contained" color="error">
            Ya
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default App;
