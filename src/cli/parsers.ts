import { InvalidArgumentError } from "commander";

export const cliParseInt = (value: any) => {
  const parsedValue = parseInt(value, 10);

  if (isNaN(parsedValue)) {
    throw new InvalidArgumentError("Not a number");
  }

  return parsedValue;
};
