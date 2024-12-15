import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import simpleImportSort from "eslint-plugin-simple-import-sort";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended, 
  { ignores: ["dist/", "**/*.js"] },
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "no-console": ["warn"],
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  }
);
