import { defineConfig } from "cypress"

export default defineConfig({
  e2e: {
  experimentalRunAllSpecs: true,
  experimentalWebKitSupport: true,
  defaultCommandTimeout: 30000,
  baseUrl: 'https://qa-v2.vtvl.io/'
  },
})