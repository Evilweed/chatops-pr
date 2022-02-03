const bettererFailed = Number(process.env.BETTERER_EXIT_CODE) > 0
const bettererPassed = !bettererFailed
const notEmptyArray = (reviews) => reviews && reviews.length
const containsBotReview = (reviews, state) =>
    notEmptyArray(reviews) && reviews.find((review) => review.node.state === state && review.node.author.login === "github-actions")
const pullRequestId = Number(process.env.PR_NUMBER)
const queryVariables = {
    owner: process.env.OWNER,
    repository: process.env.REPOSITORY,
    prNumber: pullRequestId,
}
const findLatestReviewsQuery = `query latestReviews($owner:String!,$repository:String!,$prNumber:Int!) {
              repository(owner:$owner,name:$repository) {
                pullRequest(number: $prNumber) {
                  id
                  latestReviews(last: 50) {
                    edges {
                      node {
                        id
                        state
                        author {
                          login
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
                  updatedAt
                }
              }
            }`;
const addPullRequestReviewMutation = `mutation($pullRequestId:Int!,$body:String!, $event:String!) {
              addPullRequestReview(input: {pullRequestId: $pullRequestId, body: $body, event: $event}) {
                pullRequestReview {
                  updatedAt
                }
              }
            }`;
const result = await github.graphql(findLatestReviewsQuery, queryVariables)
const { edges: reviews } = result.repository.pullRequest.latestReviews
console.log(JSON.stringify(result, null, 2))
console.log(JSON.stringify(reviews, null, 2))
console.log(JSON.stringify(reviews, null, 2))

if (bettererFailed && !containsBotReview(reviews, "CHANGES_REQUESTED") && !containsBotReview(reviews, "APPROVED")) {
    console.log("🚨 1 => Started: Request changes")
    const review = containsBotReview(reviews, "CHANGES_REQUESTED")
    console.log("⭐️")
    const updateResult = await github.graphql(addPullRequestReviewMutation, {
        event: "CHANGES_REQUESTED",
        body: "❌ 1 => Request changes",
        pullRequestId: pullRequestId,
    })
    console.log("🌎")
    console.log(JSON.stringify(updateResult, null, 2))
    console.log("✅ 1 => End")
}

if (bettererFailed && containsBotReview(reviews, "CHANGES_REQUESTED")) {
    console.log("🚨 2 => Started: Update last comment")
    const review = containsBotReview(reviews, "CHANGES_REQUESTED")
    console.log("⭐️")
    const updateResult = await github.graphql(updatePullRequestReviewMutation, {
        pullRequestReviewId: review.node.id,
        body: "📝 2 => Update last comment"
    })
    console.log("🌎")
    console.log(JSON.stringify(updateResult, null, 2))
    console.log("✅ 2 => End")
}

if (bettererFailed && containsBotReview(reviews, "APPROVED")) {
    console.log("🚨 3 => Started: Request changes")
}

if (bettererPassed && containsBotReview(reviews, "CHANGES_REQUESTED")) {
    console.log("🚨 4 => Started: Approve")
}
