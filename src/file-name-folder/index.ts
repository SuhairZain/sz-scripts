import { sep } from "path";
import { program } from "commander";

import { moveFilesIntoFoldersByPath } from "./app";

const defaultSeparator = sep === "/" ? "\\" : "/";

program
  .version("0.0.1")
  .requiredOption("-s, --source <file>", "first number")
  .requiredOption("-t, --target <file>", "second number")
  .option("--separator <value>", "The separator to use", defaultSeparator);

program.parse(process.argv);

const options = program.opts();

const { source, target, separator } = options;

moveFilesIntoFoldersByPath(source, target, separator);
