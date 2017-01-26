/*

    Test the "get" function with an external URL.

 */
/* eslint-env node */
"use strict";
var fluid = require("infusion");
var gpii = fluid.registerNamespace("gpii");

require("gpii-webdriver");
gpii.webdriver.loadTestingSupport();

fluid.defaults("infusion.demos.webdriver.caseHolder", {
    gradeNames: ["gpii.test.webdriver.caseHolder"],
    rawModules: [{
        name: "Testing a remote Infusion demo...",
        tests: [
            {
                name: "Access the keyboard-a11y demo...",
                type: "test",
                sequence: [
                    {
                        func: "{testEnvironment}.webdriver.get",
                        args:     ["http://build.fluidproject.org/infusion/demos/keyboard-a11y/"]
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onGetComplete",
                        listener: "{testEnvironment}.webdriver.getPageSource",
                        args:     []
                    },
                    {
                        event:    "{testEnvironment}.webdriver.events.onGetPageSourceComplete",
                        listener: "jqUnit.assertNotUndefined",
                        args:     ["There should be page content...", "{arguments}.0"]
                    }                  
                ]
            }
        ]
    }]
});

fluid.defaults("infusion.demos.webdriver.environment", {
    gradeNames: ["gpii.test.webdriver.testEnvironment"],
    components: {
        caseHolder: {
            type: "infusion.demos.webdriver.caseHolder"
        }
    }
});

gpii.test.webdriver.allBrowsers({ baseTestEnvironment: "infusion.demos.webdriver.environment" });
