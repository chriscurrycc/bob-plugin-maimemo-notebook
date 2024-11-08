#!/usr/bin/env node

const fs = require("fs");
const archiver = require("archiver");
const path = require("path");

const outputPath = path.resolve(
  __dirname,
  "../dist/bobplugin-maimemo-notebook.bobplugin"
);

function zipAndRename() {
  const output = fs.createWriteStream(outputPath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  output.on("close", () => {
    console.log(`Compress finish：${outputPath}`);
  });

  archive.on("error", (err) => {
    throw err;
  });

  archive.pipe(output);
  archive.directory("dist/", false);
  archive.finalize();
}

zipAndRename();
