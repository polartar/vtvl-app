const { defineConfig } = require("cypress")
const synpressPlugins = require("@synthetixio/synpress/plugins")

module.exports = defineConfig({
  userAgent: "synpress",
  chromeWebSecurity: true,
  defaultCommandTimeout: 30000,
  pageLoadTimeout: 30000,
  requestTimeout: 30000,
  e2e: {
    MAILOSAUR_API_KEY: "your-key-here",
    experimentalRunAllSpecs: true,
    experimentalWebKitSupport: true,
    experimentalOriginDependencies: true,
    testIsolation: true,
    setupNodeEvents(on, config) {
      synpressPlugins(on, config)
      require("cypress-localstorage-commands/plugin")(on, config)
    },
    baseUrl: "https://qa-v2.vtvl.io/",
    supportFile: "cypress/support/e2e.js",
  },
})
