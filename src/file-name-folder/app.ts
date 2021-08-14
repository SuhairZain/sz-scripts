import { join, sep, normalize } from "path";
import { promises } from "fs";
import makeDir from "make-dir";

const { readdir, stat, rename } = promises;

export const getFiles = async (dir: string) => {
  const files = await readdir(dir);

  const allFiles: string[] = [];
  for (const file of files) {
    const fileNameWithPath = join(dir, file);

    const stats = await stat(fileNameWithPath);

    if (stats.isDirectory()) {
      allFiles.push(
        ...(await getFiles(fileNameWithPath)).map((f) => join(file, f))
      );
    } else {
      allFiles.push(file);
    }
  }

  return allFiles;
};

export const getFilePathSegments = (fileName: string, separator: string) => {
  return normalize(fileName).split(separator);
};

export const getTargetPathAndFileName = (
  file: string,
  targetDir: string,
  separator: string
) => {
  const segments = getFilePathSegments(file, separator);

  const fileName = segments[segments.length - 1];
  const pathWithoutFileName = segments.slice(0, -1).join(sep);

  const targetFileDir = join(targetDir, pathWithoutFileName);
  const targetFileName = join(targetFileDir, fileName);

  return { targetFileDir, targetFileName };
};

export const moveFilesIntoFoldersByPath = async (
  sourceDir: string,
  targetDir: string,
  separator: string
) => {
  const files = await getFiles(sourceDir);

  for (const file of files) {
    const { targetFileDir, targetFileName } = getTargetPathAndFileName(
      file,
      targetDir,
      separator
    );

    await makeDir(targetFileDir);
    await rename(join(sourceDir, file), targetFileName);
  }
};
