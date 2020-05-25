"use strict";
exports.__esModule = true;
exports.processItems = void 0;
var rest_1 = require("@octokit/rest");
var CLOSED_ITEM_STATE = "closed";
var API_LIMIT = 5000 / 2; // 2 API calls, with 5000 total
/**
 * Processes GH issues and PRs
 *
 * @param apiToken Personal API token
 * @param orgName Organization name
 * @param repoName Repository name
 * @param items Collection of GH Items
 * @param shouldClose True if the items should be closed
 * @param comment Comment to post on the GH items
 */
function processItems(apiToken, orgName, repoName, items, shouldClose, comment) {
    var octokit = new rest_1.Octokit({
        auth: apiToken
    });
    if (items.length > API_LIMIT) {
        return console.error("Cannot process more than " + API_LIMIT + " GH items at once");
    }
    return Promise.all(items
        .filter(function (item) { return item; })
        .map(function (item) {
        return processItem(octokit, orgName, repoName, item, shouldClose, comment);
    }));
}
exports.processItems = processItems;
/**
 * Processes a single GH item
 *
 * @param octokit API object
 * @param orgName Organization name
 * @param repoName Repository name
 * @param item GH item to process
 * @param comment Comment
 */
function processItem(octokit, orgName, repoName, item, shouldClose, comment) {
    return Promise.resolve(postComment(octokit, orgName, repoName, item, comment)).then(function () {
        if (shouldClose) {
            closeItem(octokit, orgName, repoName, item);
        }
    });
}
/**
 * Closes GH item
 *
 * @param octokit API object
 * @param orgName Organization name
 * @param repoName Repository name
 * @param item GH item to close
 */
function closeItem(octokit, orgName, repoName, item) {
    octokit.issues.update({
        owner: orgName,
        repo: repoName,
        issue_number: item,
        state: CLOSED_ITEM_STATE
    });
}
/**
 * Posts comment for the GH item
 *
 * @param octokit API object
 * @param orgName Organization name
 * @param repoName Repository name
 * @param item GH item to comment on
 * @param comment Comment
 */
function postComment(octokit, orgName, repoName, item, comment) {
    /**
     * Only make comment if comment was specified
     */
    if (comment) {
        octokit.issues.createComment({
            owner: orgName,
            repo: repoName,
            issue_number: item,
            body: comment
        });
    }
}
