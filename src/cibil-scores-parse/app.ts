import { read, write } from "clipboardy";
import { InvalidArgumentError } from "commander";
import {
  DATE_ONLY_FORMAT,
  formatDate,
  getObjectPropertiesAsSingleLine,
  parseDate,
} from "../helpers/formatting";

export interface IScore {
  date: Date;
  value: number;
}

export interface IScoreClipboard {
  date: string;
  value: number;
}

const DATE_REGEX = /[A-Z]{1}[a-z]{2} [\d]{1,2}, [\d]{4}/;
const VALUE_REGEX = /^[\d]{3}$/;

export const readClipboardAndParseCibilScores = async () => {
  const scoresString = await read();

  const clipBoardLineStringify =
    getObjectPropertiesAsSingleLine<IScoreClipboard>(["date", "value"], "\t");

  let score: IScore = { date: new Date(), value: 0 };

  const filteredLines = scoresString
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => !!l);

  const dateLines = filteredLines.filter((l) => DATE_REGEX.test(l));
  const valueLines = filteredLines.filter((l) => VALUE_REGEX.test(l));

  if (dateLines.length !== valueLines.length) {
    throw new InvalidArgumentError("Different number of dates and scores");
  }

  const scores: IScore[] = [];

  for (let i = 0; i < dateLines.length; i++) {
    const dateStr = dateLines[i];
    const valueStr = valueLines[i];

    scores.push({
      date: parseDate(dateStr, "MMM d, yyyy", new Date()),
      value: Number.parseInt(valueStr),
    });
  }

  const clipBoardLines = scores.map((score) =>
    clipBoardLineStringify({
      ...score,
      date: formatDate(score.date, DATE_ONLY_FORMAT),
    })
  );

  await write(clipBoardLines.join("\n"));
};
