'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.reporter = void 0

function brightLog(string) {
    console.log(`\x1b[1m%s\x1b[0m`, string)
}

function greenLog(string) {
    console.log(`\x1b[32m%s\x1b[0m`, string)
}

function brightGreenLog(string) {
    console.log(`\x1b[1m\x1b[32m%s\x1b[0m`, string)
}

function redLog(string) {
    console.log(`\x1b[31m%s\x1b[0m`, string)
}

function brightRedLog(string) {
    console.log(`\x1b[1m\x1b[31m%s\x1b[0m`, string)
}

exports.reporter = createReporter()
function createReporter() {
    const RENDER_OPTIONS = {
        debug: process.env.NODE_ENV === 'test',
    }
    let renderer
    return {
        configError(_, error) {
            renderError(error)
        },
        async contextStart(context) {
            new Promise((resolve) => resolve())
        },
        async contextEnd(contextSummary) {
            new Promise((resolve) => resolve())
        },
        contextError(_, error) {
            console.error(JSON.stringify(error, null, 2))
            new Promise((resolve) => resolve())
        },
        suiteStart(suite) {
            // ;(0, tasks_1.reset)()
            return new Promise((resolve) => {
                resolve()
            })
        },
        suiteEnd(suiteSummary) {
            let currentProblemTestName
            const changesSummaryList = {
                fixed: [],
                new: [],
                existing: [],
            }
            if (suiteSummary) {
                if (suiteSummary.runs && suiteSummary.runs.length > 0) {
                    suiteSummary.runs.forEach((run) => {
                        if (run.diff) {
                            const { diff } = run.diff
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
                                            })
                                        })
                                    }
                                }
                            }
                        }
                    })
                }
            }

            const fixedIssuesCount = changesSummaryList.fixed.length || '0'
            brightLog(`\n✅ Fixed issues (${fixedIssuesCount}):\n`)

            changesSummaryList.fixed.forEach((problem, index) => {
                if (problem.testName !== currentProblemTestName) {
                    currentProblemTestName = problem.testName
                }
                brightGreenLog(`    ${index + 1}: ${problem.errorMessage}`)
                greenLog(`          ${problem.filePath}:${problem.lineNumber}\n`)
            })

            currentProblemTestName = null

            const newIssuesCount = changesSummaryList.new.length || '0'
            brightLog(`🔥 New issues (${newIssuesCount}):\n`)

            changesSummaryList.new.forEach((problem, index) => {
                if (problem.testName !== currentProblemTestName) {
                    currentProblemTestName = problem.testName
                }
                brightRedLog(`    ${index + 1}: ${problem.errorMessage}`)
                redLog(`          ${problem.filePath}:${problem.lineNumber}\n`)
            })
            changesSummaryList.fixed.length && brightGreenLog(`You have fixed ${fixedIssuesCount} issues!`)

            if (changesSummaryList.new.length) {
                brightRedLog(`You have added ${newIssuesCount} issues!\n`)
                brightLog(`\nREAD THIS CAREFULLY: `)
                redLog(
                    `We are trying to migrate to strict TypeScript to dramatically reduce amount of issues we ship with our code. To achieve this goal we need to keep our better every day. Please take this into account and try to fix the TypeScript issues you have added now.`
                )

                brightRedLog(`\nCase: You can fix issues`)
                redLog(`Use the list above, and go back to code and fix the detected issues.`)
                brightRedLog(`\nCase: You don't have time to fix issues`)
                redLog(
                    `If however you do not have time right now to fix those issues, you can regenerate "betterer.results" file to include your newly introduced errors, and make Betterer check green.`
                )
                redLog(
                    `To do that, add "betterer:update" comment in your Pull Request, and CI bot will update the results file, commit it to your PR, and notify you. \n`
                )
            }

            return new Promise((resolve) => resolve())
        },
    }
    function renderError(error) {
        console.error(JSON.stringify(error, null, 2))
    }
}
