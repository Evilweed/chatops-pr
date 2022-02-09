'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.reporter = void 0;
let githubCore;
try {
    githubCore = require("@actions/core");
}
catch (e) { }
const projectName = process.env.INPUT_PROJECT_NAME || process.env.PROJECT_NAME;
const chatopsResultsFileUpdateCommand = process.env.INPUT_CHATOPS_RESULTS_FILE_UPDATE_COMMAND || process.env.INPUT_CHATOPS_RESULTS_FILE_UPDATE_COMMAND;
const bettererConfigFilePath = process.env.INPUT_BETTERER_CONFIG_FILE_PATH || process.env.INPUT_BETTERER_CONFIG_FILE_PATH;
const bettererResultsFileName = process.env.INPUT_BETTERER_RESULTS_FILE_NAME || process.env.INPUT_BETTERER_RESULTS_FILE_NAME;
const bettererResultsFilePath = process.env.INPUT_BETTERER_RESULTS_FILE_PATH || process.env.INPUT_BETTERER_RESULTS_FILE_PATH;
function good(message) {
    return `\x1b[32m\-\x1b[0m ${message}`;
}
function bad(message) {
    return `\x1b[31m\+\x1b[0m ${message}`;
}
function log(message) {
    console.log(message);
}
function bright(message) {
    return `\x1b[1m${message}\x1b[0m\x1b[49m\x1b[39m`;
}
function green(message) {
    return `\x1b[32m${message}\x1b[0m\x1b[49m\x1b[39m`;
}
function brightGreen(message) {
    return `\x1b[1m\x1b[32m${message}\x1b[0m\x1b[49m\x1b[39m`;
}
function red(message) {
    return `\x1b[31m${message}\x1b[0m\x1b[49m\x1b[39m`;
}
function brightRed(message) {
    return `\x1b[1m\x1b[31m${message}\x1b[0m\x1b[49m\x1b[39m`;
}
function brightYellow(message) {
    return `\x1b[1m\x1b[33m${message}\x1b[0m\x1b[49m\x1b[39m`;
}
exports.reporter = createReporter();
function createReporter() {
    const RENDER_OPTIONS = {
        debug: process.env.NODE_ENV === 'test',
    };
    let renderer;
    return {
        configError(_, error) {
            renderError(error);
        },
        async contextStart(context) {
            new Promise((resolve) => resolve(true));
        },
        async contextEnd(contextSummary) {
            new Promise((resolve) => resolve(true));
        },
        contextError(_, error) {
            console.error(JSON.stringify(error, null, 2));
            new Promise((resolve) => resolve(true));
        },
        suiteStart(suite) {
            return new Promise((resolve) => {
                resolve(true);
            });
        },
        suiteEnd(suiteSummary) {
            // console.log(JSON.stringify(suiteSummary, null, 2))
            let currentProblemTestName;
            let isOnlyBetter;
            let deltaDiff;
            const changesSummaryList = {
                fixed: [],
                new: [],
                existing: [],
            };
            if (suiteSummary) {
                if (suiteSummary.runSummaries && suiteSummary.runSummaries.length > 0) {
                    suiteSummary.runSummaries.forEach((run) => {
                        //     "isBetter": false,
                        //     "isFailed": false,
                        //     "isNew": false,
                        //     "isSame": false,
                        //     "isSkipped": false,
                        //     "isUpdated": false,
                        //     "isWorse": true
                        try {
                            deltaDiff = run.delta.diff;
                        }
                        catch (e) { }
                        const shouldReportItIsOnlyBetter = run.isBetter &&
                            !run.isWorse &&
                            !run.isNew;
                        if (shouldReportItIsOnlyBetter) {
                            isOnlyBetter = true;
                        }
                        if (run.diff) {
                            const { diff } = run.diff;
                            for (const [filePath, changeSummary] of Object.entries(diff)) {
                                for (const [reportType, changes] of Object.entries(changeSummary)) {
                                    if (changes && changes.length > 0) {
                                        changes.forEach((change) => {
                                            changesSummaryList[reportType].push({
                                                testName: run.name,
                                                filePath: filePath,
                                                lineNumber: change[0],
                                                startColumnNumber: change[1],
                                                endColumnNumber: change[2],
                                                errorMessage: change[3],
                                                something: change[4],
                                            });
                                        });
                                    }
                                }
                            }
                        }
                    });
                }
            }
            let fixedIssuesCount = changesSummaryList.fixed.length || 0;
            const newIssuesCount = changesSummaryList.new.length || 0;
            if (isOnlyBetter && deltaDiff < 0) {
                fixedIssuesCount = Math.abs(deltaDiff);
            }
            const hasFixed = fixedIssuesCount;
            const hasNew = newIssuesCount;
            try {
                githubCore.setOutput('fixed_issues_count', fixedIssuesCount);
                githubCore.setOutput('new_issues_count', newIssuesCount);
            }
            catch (e) { }
            log(" ");
            log(bright(`✅ Fixed issues ( ${fixedIssuesCount} )`));
            log("");
            changesSummaryList.fixed.forEach((problem, index) => {
                if (problem.testName !== currentProblemTestName) {
                    currentProblemTestName = problem.testName;
                }
                log(brightGreen(`    ${index + 1}: ${problem.errorMessage}`));
                log(green(`          ${problem.filePath}:${problem.lineNumber}`));
                log("");
            });
            currentProblemTestName = null;
            log(bright(`🔥 New issues ( ${newIssuesCount} )`));
            log("");
            changesSummaryList.new.forEach((problem, index) => {
                if (problem.testName !== currentProblemTestName) {
                    currentProblemTestName = problem.testName;
                }
                log(brightRed(`    ${index + 1}: ${problem.errorMessage}`));
                log(red(`          ${problem.filePath}:${problem.lineNumber}`));
                log("");
            });
            if (hasFixed || hasNew)
                log(bright(`RESULTS`));
            log(good(brightGreen(`✅ You have fixed \`${fixedIssuesCount}\` issues!`)));
            log(bad(brightRed(`🔥 You have added \`${newIssuesCount}\` issues!\n\n`)));
            log(`🛠 Config file with TypeScript rule overrides: ` +
                brightYellow(`"${bettererConfigFilePath}"\n\n`));
            if (hasNew) {
                log(bright(`READ THIS CAREFULLY `));
                log(red(`We are trying to migrate to strict TypeScript to dramatically reduce amount of issues we ship with our code. To achieve this goal we need to keep our better every day. Please take this into account and try to fix the TypeScript issues you have added now.`));
                log(bright(`WHAT CAN I DO NOW?`));
                log(brightRed(`\n🔷 Case: You can fix issues`));
                log(red(`Use the list above, and go back to code and fix the detected issues.`));
                log(brightRed(`\n🔷 Case: You don't have time to fix issues`));
                log(red(`If however you do not have time right now to fix those issues, you can regenerate `) +
                    brightYellow(`"${bettererResultsFilePath}"`) +
                    red(` file to include your newly introduced errors, and make Betterer check green.`));
                log(red(`To do that, add `) +
                    brightYellow(`"${chatopsResultsFileUpdateCommand}"`) +
                    red(` comment in your Pull Request, and CI bot will update the results file, commit it to your PR, and notify you. \n`));
            }
            if (hasFixed && !hasNew) {
                log(bright(`WHAT I HAVE TO DO NOW?`));
                log(brightRed(`\n🔷 Case: Betterer results file needs to be updated`));
                log(red(`Please update the `) +
                    brightYellow(`"${bettererResultsFilePath}"`) +
                    red(` file to save state of good changes\n`));
                log(red(`Every time there are good or bad changes detected, it is necessary to update `) +
                    brightYellow(`"${bettererResultsFilePath}"`) +
                    red(` file so that this new state is saved to repository.\n`));
                log(red(`To do that, add `) +
                    brightYellow(`"${chatopsResultsFileUpdateCommand}"`) +
                    red(` comment in your Pull Request, and CI bot will update the results file, commit it to your PR, and notify you. \n`));
            }
            return new Promise((resolve) => resolve(true));
        },
    };
    function renderError(error) {
        console.error(JSON.stringify(error, null, 2));
    }
}
