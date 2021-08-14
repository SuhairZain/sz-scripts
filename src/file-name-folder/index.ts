import { program } from "commander";
import { cliParseInt } from "../cli/parsers";

import { sum } from "./sum";

program
  .version("0.0.1")
  .requiredOption("-f, --first <number>", "first number", cliParseInt)
  .requiredOption("-s, --second <number>", "second number", cliParseInt);

program.parse(process.argv);

const options = program.opts();

const { first, second } = options;

console.log(sum(first, second));
