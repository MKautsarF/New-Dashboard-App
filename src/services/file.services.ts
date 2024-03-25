import { config } from "@/config";
import services from ".";

export const processFile = async (filename: string, trainType: string) => {
  const res = await services.get(
    `${config.PDF_URL}?file=${filename}&type=${trainType}`
  );

  return res.data;
};

export const processFileExcel = async (filename: string, trainType: string) => {
  const res = await services.get(
    `${config.EXCEL_URL}?file=${filename}&type=${trainType}`
  );

  return res.data;
};

export const standbyCCTV = async (filename: string, mode: string) => {
  const res = await services.get(
    `${config.CCTV_URL}?file=${filename}&type=${mode}`
  );

  return res.data;
};
