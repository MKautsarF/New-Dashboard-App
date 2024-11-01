import { atom } from "jotai";

// variabel komponen control panel
export const HardwareStatusAtom = atom({
  mode: 99,
  pintu: 1,
  bridge: 0,
  mouse3d: 1,
  kondisiMotion: 0,
});

//
export const safetyEnabledAtom = atom<boolean>(true);
