export default function nextDate(
  interval: number,
  intervalUnit: string,
  currentDate: Date
) {
  let intervalInMilliseconds = 0;

  switch (intervalUnit) {
    case "HOURS":
      intervalInMilliseconds = interval * 1000 * 60 * 60;
      break;
    case "DAYS":
      intervalInMilliseconds = interval * 1000 * 60 * 60 * 24;
      break;
    case "WEEKS":
      intervalInMilliseconds = interval * 1000 * 60 * 60 * 24 * 7;
      break;
    case "MONTHS":
      intervalInMilliseconds = interval * 1000 * 60 * 60 * 24 * 30; // 30 days month
      break;
    case "YEARS":
      intervalInMilliseconds = interval * 1000 * 60 * 60 * 24 * 365; // 365 days year
      break;
    default:
      throw new Error(`Unsupported interval unit: ${intervalUnit}`);
  }

  return new Date(currentDate.getTime() + intervalInMilliseconds);
}
