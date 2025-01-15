import { DateTime } from "luxon";

export default function nextDate(
  interval: number,
  intervalUnit: string,
  currentDate: Date | string | number
): Date {
  const dateTime = DateTime.fromJSDate(
    typeof currentDate === "string" || typeof currentDate === "number"
      ? new Date(currentDate)
      : currentDate
  );

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
