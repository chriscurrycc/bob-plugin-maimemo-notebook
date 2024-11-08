import typescript from "@rollup/plugin-typescript";
import copy from "rollup-plugin-copy";

export default {
  input: "src/index.ts",
  output: {
    file: "dev/bobplugin-maimemo-notebook.bobplugin/main.js",
    format: "cjs",
  },
  plugins: [
    typescript(),
    copy({
      targets: [
        { src: "public/*", dest: "dev/bobplugin-maimemo-notebook.bobplugin" }, // 复制 public 文件夹内容到 .bobplugin 文件夹
      ],
    }),
  ],
  watch: {
    include: "src/**",
    clearScreen: false,
  },
};
