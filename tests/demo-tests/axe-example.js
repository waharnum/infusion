/* eslint-env node */
"use strict";
var fluid = require("infusion");
var gpii = fluid.registerNamespace("gpii");
var demos = fluid.registerNamespace("demos");

require("gpii-webdriver");
gpii.webdriver.loadTestingSupport();

// TODO: Figure out why providing this on line 46 for invocation doesn't work as
// expected.
demos.isOverviewPanelCollapsed = function () {
    //var collapsed = gpii.webdriver.By.css(".fl-overviewPanel-closeControl").getAttribute("aria-expanded");
    //return collapsed;
    return true;
};

fluid.defaults("demos.accessibilityReports", {
    gradeNames: ["gpii.test.webdriver.caseHolder", "gpii.test.webdriver.hasAxeContent"],
    scriptPaths: {
        axe: "/home/vagrant/sync/node_modules/axe-core/axe.js"
    },
    rawModules: [{
        name: "Building accessibility reports...",
        tests: [
            {
                name: "Running aXe report...",
                type: "test",
                sequence: [
                    {
                        func: "{testEnvironment}.webdriver.get",
                        args:     ["http://localhost:7357/demos/keyboard-a11y/index.html"]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onGetComplete",
                        listener: "{testEnvironment}.webdriver.findElement",
                        args:     [gpii.webdriver.By.css(".fl-overviewPanel-closeControl")]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onFindElementComplete",
                        listener: "{testEnvironment}.webdriver.actionsHelper",
                        args:     [{fn: "click", args: ["{arguments}.0"]}]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onActionsHelperComplete",
                        listener: "{testEnvironment}.webdriver.wait",
                        args:     [demos.isOverviewPanelCollapsed, 250, "Exceeded timeout for overview panel to collapse."]
                    },
                    {
                        event: "{testEnvironment}.webdriver.events.onWaitComplete",
                        listener: "{testEnvironment}.webdriver.executeScript",
                        args: ["{that}.options.scriptContent.axe"]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onExecuteScriptComplete",
                        listener: "{testEnvironment}.webdriver.executeAsyncScript",
                        args: [gpii.test.webdriver.axe.runAxe]
                    },
                    {
                        event: "{testEnvironment}.webdriver.events.onExecuteAsyncScriptComplete",
                        listener: "gpii.test.webdriver.axe.checkResults",
                        args: ["{arguments}.0", "{that}.options.axeOptions"]
                    }
                ]
            }
        ]
    }]
});

fluid.defaults("demos.environment", {
    gradeNames: ["gpii.test.webdriver.testEnvironment"],
    components: {
        accessibilityReports: {
            type: "demos.accessibilityReports"
        }
    }
});

gpii.test.webdriver.allBrowsers({ baseTestEnvironment: "demos.environment" });
