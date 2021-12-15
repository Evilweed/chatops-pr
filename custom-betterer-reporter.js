'use strict'
Object.defineProperty(exports, '__esModule', {value: true})
exports.reporter = void 0

function good(message) {
    return `\x1b[32m\-\x1b[0m ${message}`
}

function bad(message) {
    return `\x1b[31m\+\x1b[0m ${message}`
}

function log(message) {
    console.log(message)
}

function bright(message) {
    return `\x1b[1m${message}\x1b[0m`
}

function green(message) {
    return `\x1b[32m${message}\x1b[0m`
}

function brightGreen(message) {
    return `\x1b[1m\x1b[32m${message}\x1b[0m`
}

function red(message) {
    return `\x1b[31m${message}\x1b[0m`
}

function brightRed(message) {
    return `\x1b[1m\x1b[31m${message}\x1b[0m`
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
            return new Promise((resolve) => {
                resolve()
            })
        },
        suiteEnd(suiteSummary) {
            // console.log(JSON.stringify(suiteSummary, null, 2))
            let currentProblemTestName
            const changesSummaryList = {
                fixed: [],
                new: [],
                existing: [],
            }
            if (suiteSummary) {
                if (suiteSummary.runSummaries && suiteSummary.runSummaries.length > 0) {
                    suiteSummary.runSummaries.forEach((run) => {
                        if (run.diff) {
                            const {diff} = run.diff
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
            const hasFixed = changesSummaryList.fixed.length
            const hasNew = changesSummaryList.new.length

            const fixedIssuesCount = changesSummaryList.fixed.length || '0'
            log(" ")
            log(bright(`✅ Fixed issues ( ${fixedIssuesCount} )`))
            log("")

            changesSummaryList.fixed.forEach((problem, index) => {
                if (problem.testName !== currentProblemTestName) {
                    currentProblemTestName = problem.testName
                }
                log(brightGreen(`    ${index + 1}: ${problem.errorMessage}`))
                log(green(`          ${problem.filePath}:${problem.lineNumber}`))
                log("")
            })

            currentProblemTestName = null

            const newIssuesCount = changesSummaryList.new.length || '0'
            log(bright(`🔥 New issues ( ${newIssuesCount} )`))
            log("")

            changesSummaryList.new.forEach((problem, index) => {
                if (problem.testName !== currentProblemTestName) {
                    currentProblemTestName = problem.testName
                }
                log(brightRed(`    ${index + 1}: ${problem.errorMessage}`))
                log(red(`          ${problem.filePath}:${problem.lineNumber}`))
                log("")
            })


            if( hasFixed || hasNew )
                log(bright(`RESULTS`))

            hasFixed && log(good(brightGreen(`✅ You have fixed \`${fixedIssuesCount}\` issues!`)))

            if (hasNew) {
                log(bad(brightRed(`🔥 You have added \`${newIssuesCount}\` issues!\n\n`)))
                log(bright(`READ THIS CAREFULLY `))
                log(red(
                    `We are trying to migrate to strict TypeScript to dramatically reduce amount of issues we ship with our code. To achieve this goal we need to keep our better every day. Please take this into account and try to fix the TypeScript issues you have added now.`
                ))

                log(brightRed(`\nCase: You can fix issues`))
                log(red(`Use the list above, and go back to code and fix the detected issues.`))
                log(brightRed(`\nCase: You don't have time to fix issues`))
                log(red(
                    `If however you do not have time right now to fix those issues, you can regenerate "betterer.results" file to include your newly introduced errors, and make Betterer check green.`
                ))
                log(red(
                    `To do that, add "betterer:update" comment in your Pull Request, and CI bot will update the results file, commit it to your PR, and notify you. \n`
                ))
            }

            return new Promise((resolve) => resolve())
        },
    }

    function renderError(error) {
        console.error(JSON.stringify(error, null, 2))
    }
}
