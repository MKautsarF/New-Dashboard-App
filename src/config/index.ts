import { default as dashboardJson } from "./dashboard-config.json";

// export const config = JSON.parse(JSON.stringify(dashboardJson));
import * as fs from "fs";

const dashboardPath = "C:/Train Simulator/Data/dashboard-config.json";

// Function to read the JSON file dynamically
function readDashboardConfig(): any {
  try {
    // Check if the file exists
    if (fs.existsSync(dashboardPath)) {
      const rawData = fs.readFileSync(dashboardPath, "utf-8");
      console.log(
        'Success reading "C:/Train Simulator/Data/dashboard-config.json"'
      );
      return JSON.parse(rawData);
    } else {
      console.log("File does not exist, creating from default config...");
      fs.writeFileSync(
        dashboardPath,
        JSON.stringify(dashboardJson, null, 2),
        "utf-8"
      );
      console.log("File created successfully.");
      return dashboardJson;
    }
  } catch (error) {
    console.error("Error reading dashboard config:", error);
    return null;
  }
}

// Use the function to get the dashboard config
export const config = readDashboardConfig();
