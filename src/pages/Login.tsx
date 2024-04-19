import { useState } from "react";
// // import "../App.css";
import { useNavigate } from "react-router-dom";
import {
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Container from "@/components/Container";
import { currentInstructor, useAuth } from "../context/auth";
import FullPageLoading from "../components/FullPageLoading";

// login page
function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [inputError, setInputError] = useState(false);
  const [open, setOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [exitPrompt, setExitPrompt] = useState(false);

  const handlePrev = () => {
    navigate("/");
  };
  const handleNext = () => {
    navigate("/SecondPage");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Get form data based on input names
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    // navigate("/SecondPage");
    if (username === "" || password === "") {
      setInputError(true);
      setOpen(true);
      setErrorMsg("Field cannot be empty.");
      return;
    }

    setIsLoading(true);

    try {
      await login(username, password);

      if (username === "admin") {
        currentInstructor.isAdmin = true;
        navigate("/admin");
      } else {
        currentInstructor.isAdmin = false;
        navigate("/SecondPage");
      }
    } catch (e: any) {
      const errMsg = e.response.data.errorMessage;
      console.error(e);
      setOpen(true);
      setErrorMsg(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  return (
    <>
      <Container w={435}>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 justify-center p-8"
        >
          {/* <Logo /> */}
          <TextField
            label="Username"
            name="username"
            required
            variant="standard"
            fullWidth
            error={inputError}
            onFocus={() => setInputError(false)}
          />
          <TextField
            label="Password"
            name="password"
            required
            variant="standard"
            fullWidth
            type={showPassword ? "text" : "password"}
            error={inputError}
            onFocus={() => setInputError(false)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="outlined"
            type="submit"
            onClick={() => handleNext()}
            className="mt-4"
            sx={{
              color: "#00a6fb",
              borderColor: "#ffffff",
              "&:hover": {
                borderColor: "#00a6fb",
                color: "#00a6fb",
                // backgroundColor: "#00a6fb",
                // backgroundColor: "rgba(0, 166, 251, 0.4)", // Lower opacity blue color
              },
            }}
          >
            Login
          </Button>
          <Button
            type="button"
            color="error"
            variant="outlined"
            className="bottom-0 mt-4"
            sx={{
              color: "#df2935",
              borderColor: "#ffffff",
              "&:hover": {
                borderColor: "#df2935",
                // backgroundColor: "#df2935",
                // backgroundColor: "rgba(223, 41, 53, 0.4)", // Lower opacity red color
                color: "#df2935",
              },
            }}
            onClick={() => {
              handlePrev();
            }}
          >
            Back
          </Button>
        </form>
      </Container>

      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
          {errorMsg}
        </Alert>
      </Snackbar>
      <FullPageLoading loading={isLoading} />
    </>
  );
}

export default Login;
