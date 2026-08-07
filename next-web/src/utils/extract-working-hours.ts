import {DateTime} from "luxon";

export const extractWorkingHours = (time: string, day: DateTime) =>
  DateTime.fromFormat(time, "HH:mm", {
    zone: "Europe/Kyiv",
  }).set({
    year: day.year,
    month: day.month,
    day: day.day,
  }).toLocal();