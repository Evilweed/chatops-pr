const { graphql } = require("@octokit/graphql");
const dotenv = require('dotenv')

const { error } = dotenv.config({ path: '.env' })
if (error) {
    throw new Error(error.message)
}

const githubWithGraphql = graphql.defaults({
    headers: {
        authorization: `Basic ${btoa(process.env.AUTH_TOKEN)}`,
    },
});
process.env.BETTERER_RUN_STATUS = 'success'
process.env.PROJECT_NAME = 'platform'
process.env.OWNER = 'packhelp'
process.env.REPOSITORY = 'e2e-tests'
process.env.BETTERER_RESULTS_FILE_NAME = '.betterer.results'
process.env.GITHUB_RUN_ID = `${Math.random()*1000}`

console.log(`process.env.AUTH_TOKEN = ${process.env.AUTH_TOKEN}`)
console.log(`process.env.BETTERER_RUN_STATUS = ${process.env.BETTERER_RUN_STATUS}`)
console.log(`process.env.OWNER = ${process.env.OWNER}`)
console.log(`process.env.REPOSITORY = ${process.env.REPOSITORY}`)

const github = {
    graphql: githubWithGraphql
}

const asd = async () => {
            //
    {
        {

            let fixedIssuesCount = 0
            let newIssuesCount = 0
            function getNumber(text) {
                const numbers = text.match(/\d/g)
                const numberOrUndefined = Number(numbers.join(""))
                return numberOrUndefined || 0
            }
            const positiveGifs = [
                "https://i.giphy.com/media/5GoVLqeAOo6PK/giphy.webp",
                "https://i.giphy.com/media/PaSnUZW1EeypulsOwd/giphy.webp",
                "https://i.giphy.com/media/MOWPkhRAUbR7i/giphy.webp",
                "https://i.giphy.com/media/m4jqqr0kXABqw5a4nb/giphy.webp",
                "https://i.giphy.com/media/7aBE32jCr6lOhtuE9v/giphy.webp",
                "https://i.giphy.com/media/LcLmmj5br7gkEzjCcb/giphy.webp",
                "https://i.giphy.com/media/MCKQEmHkUyGf6/giphy.webp",
                "https://i.giphy.com/media/3o72FcJmLzIdYJdmDe/giphy.webp",
                "https://i.giphy.com/media/UO7RnQMiNpmIlHZWRT/giphy.webp",
            ]
            const negativeGifs = [
                "https://i.giphy.com/media/BEob5qwFkSJ7G/giphy.webp",
                "https://i.giphy.com/media/9Y5BbDSkSTiY8/giphy.webp",
                "https://i.giphy.com/media/l1KVaj5UcbHwrBMqI/giphy.webp",
                "https://i.giphy.com/media/M28rUlcjueKUE/giphy.webp",
                "https://i.giphy.com/media/2rtQMJvhzOnRe/giphy.webp",
                "https://i.giphy.com/media/m59zqS6G8jE9Ip4daQ/giphy.webp",
                "https://i.giphy.com/media/3oFzmi3wPYHptlhNT2/giphy.webp",
                "https://i.giphy.com/media/xT5LMAvRY92qUXj7dC/giphy.webp",
                "https://i.giphy.com/media/KxshBpu7r42gemZ5Cy/giphy.webp",
                "https://i.giphy.com/media/3ohrylo2puV7phiwso/giphy.webp",
                "https://i.giphy.com/media/hCp63osBu9CuI/giphy.webp",
            ]
            const randomPositiveGif = positiveGifs[Math.floor(Math.random() * positiveGifs.length)];
            const randomNegativeGif = negativeGifs[Math.floor(Math.random() * negativeGifs.length)];
            let shouldPrint = false
            const output = `${process.env.BETTERER_OUTPUT}`.replace(/\\n/g, '\n');
            console.log(output)
            multilineOutput = output.replace(/\\n/g, '\n');
            newErrors = multilineOutput
                .split('\n')
                .filter(line => {
                    const isFixedIssuesSummary = line[0] === "-"
                    const isNewIssuesSummary = line[0] === "+"
                    if (isFixedIssuesSummary)
                        fixedIssuesCount = getNumber(line)
                    if (isNewIssuesSummary)
                        newIssuesCount = getNumber(line)
                    return isFixedIssuesSummary || isNewIssuesSummary
                }).filter(line => {
                    return line.substring(1)
                })
                .join('\n');
            console.log(multilineOutput)
            // ![avatar](${context.payload.comment.user.avatar_url})
            const gifMessage = `\n\n![Gif!](${fixedIssuesCount > newIssuesCount ? randomPositiveGif : randomNegativeGif})`
            const quickSummary = fixedIssuesCount > newIssuesCount ?
                `❤️ Our codebase gets **BETTER**!` :
                `💩️ Our codebase gets **WORSE**!`
            const summaryMessage = `| ![Avatar](https://avatars.githubusercontent.com/u/${context.payload.comment.user.id}?s=40&v=4) | @${context.payload.comment.user.login} |\n| ------------- | ------------- |\n| **CHANGE TYPE** | **AMOUNT** |\n| ✅ Fixed issues | \`${fixedIssuesCount}\` |\n| ⛔️ New issues | \`${newIssuesCount}\` |\n Result | ${quickSummary} |`
            const botMessage = `**🤖 BOT:** Betterer results file was updated as requested by @${context.payload.comment.user.login}\n\n`
            const nothingToReportMessage = `Seems like there are no changes, sooo... Carry on! 😇`
            const fullMessage = fixedIssuesCount || newIssuesCount ?
                `${botMessage}${summaryMessage}${gifMessage}` :
                `${botMessage}${nothingToReportMessage}`

            const projectName = process.env.PROJECT_NAME

            const pullRequestNumber = Number(process.env.PR_NUMBER)
            const githubRunId = process.env.GITHUB_RUN_ID
            const repository = process.env.OWNER_AND_REPOSITORY.split("/")[1]
            const owner = process.env.OWNER_AND_REPOSITORY.split("/")[0]
            const bettererFailed = process.env.BETTERER_RUN_STATUS !== 'success'
            const bettererPassed = !bettererFailed

            const notEmptyArray = (reviews) => reviews && reviews.length
            const containsBotReview = (reviews, state) =>
                notEmptyArray(reviews) && reviews.find((review) => review.node.state === state ) //&& review.node.author.login === "github-actions"

            const findLatestReviewsQuery = `query latestReviews($owner:String!,$repository:String!,$pullRequestNumber:Int!) {
              repository(owner:$owner,name:$repository) {
                pullRequest(number: $pullRequestNumber) {
                  id
                  latestReviews(last: 50) {
                    edges {
                      node {
                        id
                        state
                        publishedAt
                        submittedAt
                        updatedAt
                        author {
                          login
                        }
                        commit {
                          id
                        }
                        userContentEdits(last: 50) {
                            edges {
                                node {
                                    diff
                                }
                            }
                        }
                      }
                    }
                  }
                }
              }
            }`;


            const addPullRequestReviewMutation = `mutation($pullRequestId:String!,$body:String!, $event:String, $commitOID:String $comments:[DraftPullRequestReviewComment]) {
              addPullRequestReview(input: {pullRequestId: $pullRequestId, body: $body, event: $event, commitOID: $commitOID, comments: $comments}) {
                pullRequestReview {
                  id
                  state
                  updatedAt
                }
              }
            }`;

            const pullRequestResponse = await github.graphql(findLatestReviewsQuery, {
                owner: owner,
                repository: repository,
                pullRequestNumber: pullRequestNumber,
            })
            const { edges: reviews } = pullRequestResponse.repository.pullRequest.latestReviews
            const { id: pullRequestId } = pullRequestResponse.repository.pullRequest
            console.log(JSON.stringify(pullRequestResponse, null, 2))
            console.log(JSON.stringify(reviews, null, 2))


            if (fixedIssuesCount || newIssuesCount) {
                console.log("🚨 4 => Started: Approve")
                const requestChangesResult = await github.graphql(addPullRequestReviewMutation, {
                    event: "APPROVE",
                    body: `${fullMessage}`,
                    pullRequestId: pullRequestId,
                })
                console.log(JSON.stringify(requestChangesResult, null, 2))
                console.log("✅ 4 => End")
            }





        }
    }




}

asd()


