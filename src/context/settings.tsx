import dayjs, { Dayjs } from "dayjs";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface Trainee {
  name: string;
  nip: string;
  bio: {
    position: string;
    born: string;
    identityNumber: string;
  };
  complition: number;
}

interface Settings {
  berat: number;
  kereta: string;
  line: string;
  score: string;
  stasiunAsal: string;
  stasiunTujuan: string;
  statusHujan: string;
  fog: number;
  jarakPandang: number;
  useMotionBase: boolean;
  useSpeedBuzzer: boolean;
  speedLimit: number;
  waktu: Dayjs;
  trainee: Trainee | null;
}

// Define the shape of your context
interface SettingsContextType {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

// Define the shape of your context
interface SettingsContextTypeKCIC {
  settingsKCIC: Settings;
  setSettingsKCIC: React.Dispatch<React.SetStateAction<Settings>>;
}

// Create the context
const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

// Create the context
const SettingsContextKCIC = createContext<SettingsContextTypeKCIC | undefined>(
  undefined
);

// Custom hook to use the SettingsContext
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within an SettingsProvider");
  }
  return context;
};

// Custom hook to use the SettingsContext
export const useSettingsKCIC = () => {
  const context = useContext(SettingsContextKCIC);
  if (!context) {
    throw new Error(
      "useSettingsKCIC must be used within an SettingsProviderKCIC"
    );
  }
  return context;
};

// SettingsProvider component that will wrap your application
interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
}) => {
  const [settings, setSettings] = useState<Settings>({
    berat: 30,
    kereta: "",
    line: "",
    score: "Default",
    stasiunAsal: "",
    stasiunTujuan: "",
    statusHujan: "Cerah",
    fog: 0,
    jarakPandang: 0,
    useMotionBase: false,
    useSpeedBuzzer: true,
    speedLimit: 70,
    waktu: dayjs("2023-08-17T12:00"),
    trainee: null,
  });

  const contextValue: SettingsContextType = {
    settings,
    setSettings,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export const SettingsProviderKCIC: React.FC<SettingsProviderProps> = ({
  children,
}) => {
  const [settingsKCIC, setSettingsKCIC] = useState<Settings>({
    berat: 30,
    kereta: "",
    line: "",
    score: "Default",
    stasiunAsal: "",
    stasiunTujuan: "",
    statusHujan: "Cerah",
    fog: 0,
    jarakPandang: 0,
    useMotionBase: false,
    useSpeedBuzzer: true,
    speedLimit: 70,
    waktu: dayjs("2023-08-17T12:00"),
    trainee: null,
  });

  const contextValueKCIC: SettingsContextTypeKCIC = {
    settingsKCIC,
    setSettingsKCIC,
  };

  return (
    <SettingsContextKCIC.Provider value={contextValueKCIC}>
      {children}
    </SettingsContextKCIC.Provider>
  );
};
