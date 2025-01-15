import { DateTime } from "luxon";

export default function nextDate(
  interval: number,
  intervalUnit: string,
  currentDate: Date
): Date {
  const dateTime = DateTime.fromJSDate(currentDate);

  let newDateTime: DateTime;
  switch (intervalUnit) {
    case "HOURS":
      newDateTime = dateTime.plus({ hours: interval });
      break;
    case "DAYS":
      newDateTime = dateTime.plus({ days: interval });
      break;
    case "WEEKS":
      newDateTime = dateTime.plus({ weeks: interval });
      break;
    case "MONTHS":
      newDateTime = dateTime.plus({ months: interval });
      break;
    case "YEARS":
      newDateTime = dateTime.plus({ years: interval });
      break;
    default:
      throw new Error(`Unsupported interval unit: ${intervalUnit}`);
  }

  return newDateTime.toJSDate();
}
