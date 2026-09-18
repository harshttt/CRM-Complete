// import js from "@eslint/js";
// import globals from "globals";
// import { defineConfig } from "eslint/config";

// export default defineConfig([
//   { files: ["**/*.{js,mjs,cjs}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.browser } },
//   { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
// ]);


import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs}"], plugins: { js }, ecmaVersion: 2020 ,languageOptions: { ecmaVersion: 2020, sourceType: "module", globals: globals.node, } },
  { files: ["**/*.js"], languageOptions: { ecmaVersion: 2020, sourceType: "module", globals: globals.node, } },
]);


