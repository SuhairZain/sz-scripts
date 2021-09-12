import { program } from "commander";

import { readClipboardAndParseCibilScores } from "./app";

program.version("0.0.1");

program.parse(process.argv);

readClipboardAndParseCibilScores();
