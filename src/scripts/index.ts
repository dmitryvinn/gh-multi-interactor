import { Octokit } from "@octokit/rest";

const CLOSED_ITEM_STATE = 'closed'

// TODO: limit for 5K requests, rename to #process function, handle errors
export function processIssues(apiToken: string, repo: string, issues: number[], comment: string) {
  const octokit = new Octokit({
    auth: apiToken,
  });
  const repoArgs = repo.split("/");
  const orgName = repoArgs[0];
  const repoName = repoArgs[1];

  return Promise.all(issues.filter(issue => issue).map((issue) => processIssue(octokit, orgName, repoName, issue, comment)));
}

function closeIssue(
  octokit: Octokit,
  orgName: string,
  repoName: string,
  issue: number) {
  octokit.issues.update({
      owner: orgName,
      repo: repoName,
      issue_number: issue,
      state: CLOSED_ITEM_STATE,
    });
}

function postComment(
  octokit: Octokit,
  orgName: string,
  repoName: string,
  issue: number,
  comment: string
) {
  /**
   * Only make comment if comment was specified
   */
  if (comment) {
  octokit.issues.createComment({
    owner: orgName,
    repo: repoName,
    issue_number: issue,
    body: comment,
  });
  }
}

function processIssue(
  octokit: Octokit,
  orgName: string,
  repoName: string,
  issue: number,
  comment: string
) {
  return Promise.resolve(
    postComment(octokit, orgName, repoName, issue, comment)
  ).then(() => closeIssue(octokit, orgName, repoName, issue));
}