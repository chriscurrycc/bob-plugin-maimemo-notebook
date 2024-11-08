import typescript from "@rollup/plugin-typescript";
import copy from "rollup-plugin-copy";
import terser from "@rollup/plugin-terser";
import { exec } from "child_process";

export default {
  input: "src/index.ts",
  output: {
    file: "dist/main.js",
    format: "cjs",
  },
  plugins: [
    typescript(),
    terser(),
    copy({
      targets: [{ src: "public/*", dest: "dist" }],
    }),
    {
      name: "zip",
      writeBundle() {
        exec("scripts/zip.js", (err, stdout, stderr) => {
          if (err) {
            console.error(`Compress zip error: ${err}`);
            return;
          }
          console.log(stdout);
          console.error(stderr);
        });
      },
    },
  ],
};
