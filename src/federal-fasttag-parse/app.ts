import { createReadStream, promises } from "fs";
import { parse as parseDate, format } from "date-fns";
import csvParse from "csv-parse";
import { write } from "clipboardy";
import { getObjectPropertiesAsSingleLine } from "../helpers/formatting";

const { writeFile } = promises;

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
  date: Date;
  usageAmount: number;
  rechargeAmount: number;
  plazaId: string;
}

export interface ITransactionClipboard extends Omit<ITransaction, "date"> {
  date: string;
}

export const getTransactionFromRawTransaction = (
  transaction: IRawTransaction
): ITransaction => {
  const transAmount = transaction["Transaction Amount (Rs.)"];
  const transTime = transaction["Transaction Date/Time"];

  const amount = Number.parseFloat(transAmount);
  const date = parseDate(transTime, "dd-MM-yyyy HH:mm:ss", new Date());

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
      getObjectPropertiesAsSingleLine<ITransactionClipboard>(
        ["date", "usageAmount", "rechargeAmount", "plazaId"],
        "\t"
      );

    const clipBoardLines = output.map((transaction) =>
      clipBoardLineStringify({
        ...transaction,
        date: format(transaction.date, "dd-MM-yyyy"),
      })
    );
    await write(clipBoardLines.reverse().join("\n"));
  }
};
