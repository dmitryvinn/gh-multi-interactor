"use strict";
exports.__esModule = true;
exports.processIssues = void 0;
var rest_1 = require("@octokit/rest");
var CLOSED_ITEM_STATE = 'closed';
function processIssues(apiToken, repo, issues, comment) {
    var octokit = new rest_1.Octokit({
        auth: apiToken
    });
    var repoArgs = repo.split("/");
    var orgName = repoArgs[0];
    var repoName = repoArgs[1];
    return Promise.all(issues.filter(function (issue) { return issue; }).map(function (issue) { return processIssue(octokit, orgName, repoName, issue, comment); }));
}
exports.processIssues = processIssues;
function closeIssue(octokit, orgName, repoName, issue) {
    octokit.issues.update({
        owner: orgName,
        repo: repoName,
        issue_number: issue,
        state: CLOSED_ITEM_STATE
    });
}
function postComment(octokit, orgName, repoName, issue, comment) {
    /**
     * Only make comment if comment was specified
     */
    if (comment) {
        octokit.issues.createComment({
            owner: orgName,
            repo: repoName,
            issue_number: issue,
            body: comment
        });
    }
}
function processIssue(octokit, orgName, repoName, issue, comment) {
    return Promise.resolve(postComment(octokit, orgName, repoName, issue, comment)).then(function () { return closeIssue(octokit, orgName, repoName, issue); });
}
