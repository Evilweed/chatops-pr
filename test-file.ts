// asd
const a = {"query": "query  { repository(owner: \"'$owner'\", name: \"'$repository'\") { pullRequest(number: '$pr') { reviews(first: 100) { edges { node { id } } } } } }"}
