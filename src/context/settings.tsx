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

interface Motion {
  mode: string;
  bridge: string;
  tdmouse: string;
  pintu: string;
  motion: number;
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

interface MotionContextType {
  motion: Motion;
  setMotion: React.Dispatch<React.SetStateAction<Motion>>;
}

// Create the context
const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

// Create the context
const SettingsContextKCIC = createContext<SettingsContextTypeKCIC | undefined>(
  undefined
);

const MotionContext = createContext<MotionContextType | undefined>(undefined);

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

export const useMotion = () => {
  const context = useContext(MotionContext);
  if (!context) {
    throw new Error("useMotion must be used within an MotionProvider");
  }
  return context;
};

// SettingsProvider component that will wrap your application
interface SettingsProviderProps {
  children: ReactNode;
}

interface MotionProviderProps {
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
    useSpeedBuzzer: false,
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
    useSpeedBuzzer: false,
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

export const MotionProvider: React.FC<MotionProviderProps> = ({ children }) => {
  const [motion, setMotion] = useState<Motion>({
    mode: "",
    bridge: "",
    tdmouse: "",
    pintu: "",
    motion: 0,
  });

  const contextValueMotion: MotionContextType = {
    motion,
    setMotion,
  };

  return (
    <MotionContext.Provider value={contextValueMotion}>
      {children}
    </MotionContext.Provider>
  );
};
