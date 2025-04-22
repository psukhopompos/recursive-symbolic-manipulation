// eslint.config.js - Keep the improved version
// @ts-check

import js from "@eslint/js";
// Remove TS-related imports if not using TS anywhere
// import * as importPlugin from "eslint-plugin-import";
import globals from "globals";
// import tseslint from "typescript-eslint";

export default [ // Use array export format for flat config
  { ignores: ["dist", "node_modules", "public/"] }, // Ignore build output, deps, and static frontend assets
  {
    // Apply JS rules to backend JS files
    files: ["server/**/*.js", "tools/**/*.js"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "commonjs", // Backend uses CommonJS modules
      globals: {
        ...globals.node, // Use Node.js globals
      },
    },
    rules: {
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }], // Warn unused vars, ignore args starting with _
      "no-console": "off", // Allow console logging in backend for now
      "require-await": "warn",
      // Add other backend-specific JS rules here if needed
       "semi": ["warn", "always"], // Enforce semicolons (optional style choice)
       "quotes": ["warn", "single", { "avoidEscape": true }] // Prefer single quotes (optional style choice)
    },
  },
  // If you were using TypeScript, the TS-specific config block would go here
  // {
  //   files: ["**/*.{ts,tsx}"],
  //   extends: [...],
  //   languageOptions: {...},
  //   plugins: {...},
  //   settings: {...},
  //   rules: {...},
  // }
];