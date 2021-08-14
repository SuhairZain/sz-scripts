import {
  getFilePathSegments,
  getFiles,
  getTargetPathAndFileName,
} from "../app";

const getMockedFiles = (dirName: string) => {
  switch (dirName) {
    case "root":
      return ["dirLevel1", "fileLevel1"];
    case "root/dirLevel1":
      return ["dirLevel2", "fileLevel2"];
    case "root/dirLevel1/dirLevel2":
      return ["fileLevel3"];
    default:
      return [];
  }
};

const DIRECTORY_REGEX = /(dirLevel)[\d]$/;

jest.mock("fs", () => ({
  promises: {
    readdir: (dirName: string) => {
      return new Promise<string[]>((res) => {
        res(getMockedFiles(dirName));
      });
    },
    stat: (fileName: string) => {
      return new Promise<{ isDirectory: () => boolean }>((res) => {
        const isDirectory = () => DIRECTORY_REGEX.test(fileName);

        res({ isDirectory });
      });
    },
  },
}));

describe("GIVEN getFiles", () => {
  describe("WHEN given a directory with inner directories", () => {
    let files: string[];

    beforeAll(async () => {
      files = await getFiles("root");
    });

    it("SHOULD return all files, recursively", () => {
      expect(files).toEqual([
        "dirLevel1/dirLevel2/fileLevel3",
        "dirLevel1/fileLevel2",
        "fileLevel1",
      ]);
    });
  });
});

describe("GIVEN getFilePathSegments", () => {
  describe("WHEN given a directory with inner directories", () => {
    let fileSegments: string[];

    beforeAll(async () => {
      fileSegments = getFilePathSegments(
        "./root/dirLevel1/dirLevel2/fileLevel3",
        "/"
      );
    });

    it("SHOULD return the file path segments", () => {
      expect(fileSegments).toEqual([
        "root",
        "dirLevel1",
        "dirLevel2",
        "fileLevel3",
      ]);
    });
  });
});

describe("GIVEN getTargetPathAndFileName", () => {
  describe("WHEN given a file in nested directories", () => {
    let targetFileDir: string;
    let targetFileName: string;

    beforeAll(async () => {
      const targets = getTargetPathAndFileName(
        "./root\\dirLevel1\\dirLevel2\\fileLevel3",
        "./newRoot",
        "\\"
      );

      targetFileDir = targets.targetFileDir;
      targetFileName = targets.targetFileName;
    });

    it("SHOULD return the correct target dir", () => {
      expect(targetFileDir).toBe("newRoot/root/dirLevel1/dirLevel2");
    });

    it("SHOULD return the correct target file name", () => {
      expect(targetFileName).toBe(
        "newRoot/root/dirLevel1/dirLevel2/fileLevel3"
      );
    });
  });
});
