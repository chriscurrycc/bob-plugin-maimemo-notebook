#!/usr/bin/env node

const fs = require("fs");
const archiver = require("archiver");
const path = require("path");

const outputPath = path.resolve(
  __dirname,
  "../dist/bobplugin-maimemo-notebook.bobplugin"
);

function cleanDistFolder() {
  const distPath = path.resolve(__dirname, "../dist");

  fs.readdir(distPath, (err, files) => {
    if (err) throw err;

    files.forEach((file) => {
      const filePath = path.join(distPath, file);

      if (filePath !== outputPath) {
        fs.rm(filePath, { recursive: true, force: true }, (err) => {
          if (err) throw err;
          console.log(`Deleted: ${filePath}`);
        });
      }
    });
  });
}

function zipAndRename() {
  const output = fs.createWriteStream(outputPath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  output.on("close", () => {
    console.log(`Compress finish：${outputPath}`);
    cleanDistFolder();
  });

  archive.on("error", (err) => {
    throw err;
  });

  archive.pipe(output);
  archive.glob("**/*", {
    cwd: path.resolve(__dirname, "../dist"),
    ignore: [path.basename(outputPath)],
  });
  archive.finalize();
}

zipAndRename();
