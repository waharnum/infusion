/* eslint-env node */
"use strict";
var fluid = require("infusion");
var gpii = fluid.registerNamespace("gpii");
var demos = fluid.registerNamespace("demos");

require("gpii-webdriver");
gpii.webdriver.loadTestingSupport();

var isOverviewPanelVisible = function () {
    return $(".fl-overviewPanel-closeControl").attr("aria-expanded");
};

demos.keyboardA11y = [
    {
        func:     "{testEnvironment}.webdriver.get",
        args:     ["http://build.fluidproject.org/infusion/demos/keyboard-a11y/"]
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
        listener: "{testEnvironment}.webdriver.executeScript",
        args:     [isOverviewPanelVisible]
    },
    {
        event:    "{testEnvironment}.webdriver.events.onExecuteScriptComplete",
        listener: "jqUnit.assertEquals",
        args:     ["The overview panel is visible...", "{arguments}.0", "false"]
    }
];

fluid.defaults("demos.accessibilityReports", {
    gradeNames: ["gpii.test.webdriver.caseHolder", "gpii.test.webdriver.hasAxeContent"],
    scriptPaths: {
        axe: "/home/vagrant/sync/node_modules/axe-core/axe.js"
    },
    sequenceStart: demos.keyboardA11y,
    rawModules: [{
        name: "Building accessibility reports...",
        tests: [
            {
                name: "Running aXe report...",
                type: "test",
                sequence: [
                    {
                        func: "{testEnvironment}.webdriver.get",
                        args: ["@expand:gpii.test.webdriver.resolveFileUrl({that}.options.injectUrl)"]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onGetComplete",
                        listener: "{testEnvironment}.webdriver.executeScript",
                        args:     ["{that}.options.scriptContent.axe"]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onExecuteScriptComplete",
                        listener: "{testEnvironment}.webdriver.executeAsyncScript",
                        args:     [gpii.test.webdriver.axe.runAxe]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onExecuteAsyncScriptComplete",
                        listener: "gpii.test.webdriver.axe.checkResults",
                        args:     ["{arguments}.0"]
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
