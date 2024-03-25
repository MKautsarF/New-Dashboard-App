export function getFilenameSafeDateString(date: Date): string {
  // Get the date components
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(date.getDate()).padStart(2, "0");

  // Get the time components
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  // Create the formatted file name string
  const fileName = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;

  return fileName;
}

export function formatDurationToString(
  hours: number,
  minutes: number,
  seconds: number
): string {
  const formattedTime = [];

  if (hours > 0) {
    formattedTime.push(`${hours} jam`);
  }

  if (minutes > 0) {
    formattedTime.push(`${minutes} menit`);
  }

  if (seconds > 0) {
    formattedTime.push(`${seconds} detik`);
  }

  return formattedTime.join(" ");
}
