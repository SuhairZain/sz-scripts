import { InvalidArgumentError, program } from "commander";

import { parseFederalFasttagCsv } from "./app";

program
  .version("0.0.1")
  .requiredOption("-s, --source <file>", "The CSV file to parse")
  .option("-t, --target <file>", "The target JSON file name")
  .option("-c, --clipboard", "Should write to clipboard");

program.parse(process.argv);

const options = program.opts();

const { source, target, clipboard: copyToClipboard } = options;

if (!copyToClipboard && !target) {
  throw new InvalidArgumentError(
    `A target must be provided if writeToClipboard is fale`
  );
}

parseFederalFasttagCsv(source, target, copyToClipboard);
