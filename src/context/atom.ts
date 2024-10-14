import { atom } from "jotai";

// variabel komponen control panel
export const HardwareStatusAtom = atom({
  mode: 99,
  pintu: 9,
  bridge: 99,
  mouse3d: 99,
  kondisiMotion: 99,
});

//
export const safetyEnabledAtom = atom<boolean>(true);
