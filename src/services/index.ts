import { config } from "@/config";
import axios from "axios";

const services = axios.create({
  baseURL: config.API_URL,
});
export default services;
