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


            const projectName = process.env.PROJECT_NAME
            const bettererResultsFileName = process.env.BETTERER_RESULTS_FILE_NAME

            const pullRequestNumber = Number(process.env.PR_NUMBER)
            const githubRunId = process.env.GITHUB_RUN_ID
            const repository = process.env.REPOSITORY
            const owner = process.env.OWNER
            const bettererFailed = process.env.BETTERER_RUN_STATUS !== 'success'
            const bettererPassed = !bettererFailed

            const pleaseReviewBettererResultsMessage = `| ⚠️ Typescript code quality changes detected |\n| - |\n| Project: \`${projectName}\` |\n| I've detected changes in \`${bettererResultsFileName}\` please review them, and either **[ fix the issues ]** or **[ accept new issues as new baseline ]** |\n| [🔗 Click here to review changes and read instructions](https://github.com/${owner}/${repository}/actions/runs/${githubRunId}?check_suite_focus=true)`
            const acceptedBettererResultsMessage = `| ✅️ Typescript code quality fixed! |\n| - |\n| Project: \`${projectName}\` |\n| Thank you for fixing TypeScript issues ❤️, changing status to approved! |\n| [🔗 Link to CI job with more information](https://github.com/${owner}/${repository}/actions/runs/${githubRunId}?check_suite_focus=true)`

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
            const updatePullRequestReviewMutation = `mutation($pullRequestReviewId:String!,$body:String!) {
              updatePullRequestReview(input: {pullRequestReviewId: $pullRequestReviewId, body: $body}) {
                pullRequestReview {
                  id
                  state
                  updatedAt
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


            if (bettererFailed && !containsBotReview(reviews, "CHANGES_REQUESTED") && !containsBotReview(reviews, "APPROVED")) {
                console.log("🚨 1 => Started: Request changes")
                const requestChangesResult = await github.graphql(addPullRequestReviewMutation, {
                    event: "REQUEST_CHANGES",
                    body: pleaseReviewBettererResultsMessage,
                    pullRequestId: pullRequestId,
                })
                console.log(JSON.stringify(requestChangesResult, null, 2))
                console.log("✅ 1 => End")
            }

            if (bettererFailed && containsBotReview(reviews, "CHANGES_REQUESTED")) {
                console.log("🚨 2 => Started: Update last comment")
                const review = containsBotReview(reviews, "CHANGES_REQUESTED")
                const updateResult = await github.graphql(updatePullRequestReviewMutation, {
                    pullRequestReviewId: review.node.id,
                    body: pleaseReviewBettererResultsMessage
                })
                console.log(JSON.stringify(updateResult, null, 2))
                console.log("✅ 2 => End")
            }

            if (bettererFailed && containsBotReview(reviews, "APPROVED")) {
                console.log("🚨 3 => Started: Request changes")
                const requestChangesResult = await github.graphql(addPullRequestReviewMutation, {
                    event: "REQUEST_CHANGES",
                    body: pleaseReviewBettererResultsMessage,
                    pullRequestId: pullRequestId,
                })
                console.log(JSON.stringify(requestChangesResult, null, 2))
                console.log("✅ 3 => End")
            }

            if (bettererPassed && containsBotReview(reviews, "CHANGES_REQUESTED")) {
                console.log("🚨 4 => Started: Approve")
                const requestChangesResult = await github.graphql(addPullRequestReviewMutation, {
                    event: "APPROVE",
                    body: acceptedBettererResultsMessage,
                    pullRequestId: pullRequestId,
                })
                console.log(JSON.stringify(requestChangesResult, null, 2))
                console.log("✅ 4 => End")
            }





        }
    }




}

asd()




const dismissPullRequestReviewMutation = `mutation($pullRequestReviewId:String!,$message:String!) {
              dismissPullRequestReview(input: {pullRequestReviewId: $pullRequestReviewId, message: $message}) {
                pullRequestReview {
                  state
                  updatedAt
                }
              }
            }`;

const submitPullRequestReviewMutation = `mutation($pullRequestReviewId:String,$pullRequestId:String,$body:String!, $event:String) {
              submitPullRequestReview(input: {pullRequestReviewId: $pullRequestId, pullRequestId: $pullRequestId, body: $body, event: $event}) {
                pullRequestReview {
                  id
                  state
                  updatedAt
                }
              }
            }`;
const submitAllPullRequestReviewsMutation = `mutation($pullRequestId:String,$body:String!, $event:String) {
              submitPullRequestReview(input: {pullRequestId: $pullRequestId, body: $body, event: $event}) {
                pullRequestReview {
                  id
                  state
                  updatedAt
                }
              }
            }`;
const deletePullRequestReviewMutation = `mutation($pullRequestReviewId:String!) {
              deletePullRequestReview(input: {pullRequestReviewId: $pullRequestReviewId}) {
                pullRequestReview {
                  id
                  state
                  updatedAt
                }
              }
            }`;
const removeAssigneesFromAssignableMutation = `mutation($assignableId:String!, $assigneeIds:[ID!]!) {
              removeAssigneesFromAssignable(input: {assignableId: $assignableId, assigneeIds: $assigneeIds, event: $event}) {
                pullRequestReview {
                  id
                  state
                  updatedAt
                }
              }
            }`;



// // const requestChangesResulta = await github.graphql(deletePullRequestReviewMutation, {
// //     pullRequestReviewId: containsBotReview(reviews, "CHANGES_REQUESTED").node.id,
// // })
// const requestChangesResulta = await github.graphql(addPullRequestReviewMutation, {
//     event: "REQUEST_CHANGES",
//     body: "a",
//     // commitOID: "MDY6Q29tbWl0MTU4MDA4NjY1OmIyMDIyZGEyODdhYThhOGMzMWRiNjA1NTc3NmFiYmRmZmUwZTdiMzA",
//     pullRequestId: pullRequestId,
// })
// const uestChangesResulta = await github.graphql(addPullRequestReviewMutation, {
//     event: "APPROVE",
//     body: "a",
//     // commitOID: "MDY6Q29tbWl0MTU4MDA4NjY1OmIyMDIyZGEyODdhYThhOGMzMWRiNjA1NTc3NmFiYmRmZmUwZTdiMzA",
//     pullRequestId: pullRequestId,
// })
// const requestChangesRes2ulta = await github.graphql(addPullRequestReviewMutation, {
//     event: "REQUEST_CHANGES",
//     body: "a",
//     // commitOID: "MDY6Q29tbWl0MTU4MDA4NjY1OmIyMDIyZGEyODdhYThhOGMzMWRiNjA1NTc3NmFiYmRmZmUwZTdiMzA",
//     pullRequestId: pullRequestId,
// })
//
// // const requestChangesResult2 = await github.graphql(dismissPullRequestReviewMutation, {
// //     // event: "REQUEST_CHANGES",
// //     message: "Dismissed",
// //     pullRequestReviewId: containsBotReview(reviews, "APPROVED").node.id,
// // })
//
// // const requestChangesResult2 = await github.graphql(submitAllPullRequestReviewsMutation, {
// //     // event: "ACCEPT",
// //     body: "❌ 1 => Request changes",
// //     pullRequestId: pullRequestId,
// //     // commitOID: "MDY6Q29tbWl0MTU4MDA4NjY1OmIyMDIyZGEyODdhYThhOGMzMWRiNjA1NTc3NmFiYmRmZmUwZTdiMzA",
// // })
//
// // const requestChangesResult2 = await github.graphql(addPullRequestReviewMutation, {
// //     event: "REQUEST_CHANGES",
// //     body: "❌ 1 => Requeasdasddasst changes",
// //     pullRequestId: pullRequestId,
// //     commitOID: "MDY6Q29tbWl0MTU4MDA4NjY1OmIyMDIyZGEyODdhYThhOGMzMWRiNjA1NTc3NmFiYmRmZmUwZTdiMzA",
// // })
//
// // console.log(JSON.stringify(requestChangesResult2, null, 2))
//
// // const requestChangesResult2 = await github.graphql(dismissPullRequestReviewMutation, {
// //     // event: "ACCEPT",
// //     message: "Dismissed",
// //     pullRequestId: pullRequestId,
// //     // pullRequestReviewId: containsBotReview(reviews, "APPROVED").node.id,
// // })
// //
// // console.log(JSON.stringify(requestChangesResult2, null, 2))
// //
