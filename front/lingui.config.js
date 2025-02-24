import { defineConfig } from "@lingui/cli";

export default defineConfig({
  sourceLocale: "en",
  locales: ["fi", "en", "sv"],
  catalogs: [
    {
      path: "<rootDir>/src/locales/{locale}/messages",
      include: ["src"],
    },
  ],
});
