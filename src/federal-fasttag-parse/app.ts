import { createReadStream, promises } from "fs";
import { parse as parseDate, format } from "date-fns";
import csvParse from "csv-parse";
import { write } from "clipboardy";

const { writeFile } = promises;

export const getObjectPropertiesAsSingleLine =
  <T>(keysOrder: (keyof T)[], separator: string) =>
  (obj: T) => {
    return keysOrder.map((k) => obj[k]).join(separator);
  };

export interface IRawTransactionCommon {
  "Transaction Date/Time": string;
  "Transaction Amount (Rs.)": string;
}

export interface IRawRechargeTransaction extends IRawTransactionCommon {
  "Transaction Type": "Recharge";
}

export interface IRawUsageTransaction extends IRawTransactionCommon {
  "Transaction Type": "SALE";
  "Toll Plaza ID": string;
}

export type IRawTransaction = IRawRechargeTransaction | IRawUsageTransaction;

export interface ITransaction {
  date: string;
  usageAmount: number;
  rechargeAmount: number;
  plazaId: string;
}

export const getTransactionFromRawTransaction = (
  transaction: IRawTransaction
): ITransaction => {
  const transAmount = transaction["Transaction Amount (Rs.)"];
  const transTime = transaction["Transaction Date/Time"];

  const amount = Number.parseFloat(transAmount);
  const date = format(
    parseDate(transTime, "dd-MM-yyyy HH:mm:ss", new Date()),
    "dd-MM-yyyy"
  );

  return transaction["Transaction Type"] === "Recharge"
    ? { date, usageAmount: 0, plazaId: "", rechargeAmount: amount }
    : {
        date,
        rechargeAmount: 0,
        usageAmount: amount,
        plazaId: transaction["Toll Plaza ID"],
      };
};

export const parseFederalFasttagCsv = async (
  sourceFile: string,
  targetFile: string,
  copyToClipboard: boolean
) => {
  const output: ITransaction[] = [];

  const parser = createReadStream(sourceFile).pipe(csvParse({ columns: true }));
  for await (const record of parser) {
    const transaction: IRawTransaction = record;
    const parsedTransaction = getTransactionFromRawTransaction(transaction);

    output.push(parsedTransaction);
  }

  if (targetFile) {
    await writeFile(targetFile, JSON.stringify(output.reverse()));
  }

  if (copyToClipboard) {
    const clipBoardLineStringify =
      getObjectPropertiesAsSingleLine<ITransaction>(
        ["date", "usageAmount", "rechargeAmount", "plazaId"],
        "\t"
      );

    const clipBoardLines = output.map((transaction) =>
      clipBoardLineStringify(transaction)
    );
    await write(clipBoardLines.reverse().join("\n"));
  }
};
