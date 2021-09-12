import { format, parse } from "date-fns";

export const getObjectPropertiesAsSingleLine =
  <T>(keysOrder: (keyof T)[], separator: string) =>
  (obj: T) => {
    return keysOrder.map((k) => obj[k]).join(separator);
  };

export const DATE_ONLY_FORMAT = "dd-MM-yyyy";

export const formatDate = format;

export const parseDate = parse;
