export const getObjectPropertiesAsSingleLine =
  <T>(keysOrder: (keyof T)[], separator: string) =>
  (obj: T) => {
    return keysOrder.map((k) => obj[k]).join(separator);
  };
