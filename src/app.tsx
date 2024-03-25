import React, { useEffect } from "react";
import { RouterProvider, createHashRouter } from "react-router-dom";

import ReactDOM from "react-dom/client";
import Home from "./pages/Home";
import FirstPage from "./pages/Login";
import SecondPage from "./pages/AppMenu";
import ThirdPage from "./pages/Simulation";
import FourthPage from "./pages/Database";
import FifthPage from "./pages/Settings";
import SixthPage from "./pages/ScoringKCIC";
import SeventhPage from "./pages/ScoringLRT";
import EighthPage from "./pages/EditKCIC";
import NinthPage from "./pages/EditLRT";
import TenthPage from "./pages/ReviewKCIC";
import EleventhPage from "./pages/ReviewLRT";
import { ToastContainer } from "react-toastify";
import "./index.css";

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
    element: <SecondPage />,
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
];

const router = createHashRouter(
  routerData.map((route) => ({
    ...route,
    element: <AuthProvider>{route.element}</AuthProvider>,
    // element: <div>{route.element}</div>,
  }))
);

// ReactDOM.createRoot(document.getElementById("root")!).render(
//   // <React.StrictMode>
//   //   <App />
//   // </React.StrictMode>
//   <React.StrictMode>
//     {/* <AuthProvider> */}
//     <SettingsProvider>
//       <LocalizationProvider dateAdapter={AdapterDayjs}>
//         {/* <AuthProvider> */}
//         <RouterProvider router={router} />
//         {/* </AuthProvider> */}
//       </LocalizationProvider>
//     </SettingsProvider>
//     {/* </AuthProvider> */}
//   </React.StrictMode>
// );

// // Remove Preload scripts loading
// postMessage({ payload: "removeLoading" }, "*");

// // Use contextBridge
// window.ipcRenderer.on("main-process-message", (_event, message) => {
//   console.log(message);
// });
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
