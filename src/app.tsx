import React, { useEffect } from "react";
import { RouterProvider, createHashRouter } from "react-router-dom";

import ReactDOM from "react-dom/client";
import Home from "./pages/Home";
import FirstPage from "./pages/Login";
import AppMenu from "./pages/AppMenu";
import ThirdPage from "./pages/Simulation";
import FourthPage from "./pages/Database";
import FifthPage from "./pages/Settings";
import SixthPage from "./pages/ScoringKCIC";
import SeventhPage from "./pages/ScoringLRT";
import EighthPage from "./pages/EditKCIC";
import NinthPage from "./pages/EditLRT";
import TenthPage from "./pages/ReviewKCIC";
import EleventhPage from "./pages/ReviewLRT";
import TwelvethPageKCIC from "./pages/SettingsModulKCIC";
import TwelvethPageLRT from "./pages/SettingsModulLRT";
import ThirteenPage from "./pages/EditSettingsLRT"; // not used
import FourteenPage from "./pages/Modul";
import Fiveteen from "./pages/SettingsSecond";
import Admin from "./pages/AdminStart";
import Instructor from "./pages/InstructorList";
import Trainee from "./pages/TraineeList";
import UserLog from "./pages/UserLog";
import FinishKCIC from "./pages/FinishKCIC";
import FinishLRT from "./pages/FinishLRT";
import ScoringStart from "./pages/ScoringStart";
import Course from "./pages/CourseList";
import ScoringList from "./pages/ScoringList";

import { ToastContainer } from "react-toastify";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";

import { SettingsProvider } from "./context/settings.js";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// import { AuthProvider } from "./context/auth.js";
import { AuthProvider } from "./context/auth";

const routerData = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/FirstPage",
    element: <FirstPage />,
  },
  {
    path: "/SecondPage",
    element: <AppMenu />,
  },
  {
    path: "/ThirdPage",
    element: <ThirdPage />,
  },
  {
    path: "/FourthPage",
    element: <FourthPage />,
  },
  {
    path: "FourthPage/UserLog",
    element: <UserLog />,
  },
  {
    path: "/FifthPage",
    element: <FifthPage />,
  },
  {
    path: "/SixthPage/kcic",
    element: <SixthPage />,
  },
  {
    path: "/SixthPage/lrt",
    element: <SeventhPage />,
  },
  {
    path: "/Sixthpage/kcic/edit",
    element: <EighthPage />,
  },
  {
    path: "/Sixthpage/lrt/edit",
    element: <NinthPage />,
  },
  {
    path: "/FifthPage/kcic",
    element: <TenthPage />,
  },
  {
    path: "/FifthPage/lrt",
    element: <EleventhPage />,
  },
  {
    path: "/FifthPage/modul/kcic",
    element: <TwelvethPageKCIC />,
  },
  {
    path: "/FifthPage/modul/lrt",
    element: <TwelvethPageLRT />,
  },
  {
    path: "/FifthPage/edit/lrt/config",
    element: <ThirteenPage />,
  },
  {
    path: "/Modul",
    element: <FourteenPage />,
  },
  {
    path: "/Modul/learning",
    element: <Fiveteen />,
  },
  {
    path: "/admin",
    element: <Admin />,
  },
  {
    path: "/admin/instructorlist",
    element: <Instructor />,
  },
  {
    path: "/admin/traineelist",
    element: <Trainee />,
  },
  {
    path: "/finishkcic",
    element: <FinishKCIC />,
  },
  {
    path: "/scoringStart",
    element: <ScoringStart />,
  },
  {
    path: "/finishLRT",
    element: <FinishLRT />,
  },
  {
    path: "/admin/courselist",
    element: <Course />,
  },
  {
    path: "/admin/scoringlist",
    element: <ScoringList />,
  },
];

const router = createHashRouter(
  routerData.map((route) => ({
    ...route,
    element: <AuthProvider>{route.element}</AuthProvider>,
    // element: <div>{route.element}</div>,
  }))
);

const App = () => {
  // Add a beforeunload event listener to handle when the entire application is closing
  useEffect(() => {}, []);

  return (
    <main className="flex justify-center items-center min-h-screen min-w-screen bg-gray-200">
      <RouterProvider router={router} />
      <ToastContainer theme="colored" />
    </main>
  );
};

export default App;
