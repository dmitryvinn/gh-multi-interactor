import { Octokit } from "@octokit/rest";

const CLOSED_ITEM_STATE = "closed";
const API_LIMIT = 5000 / 2; // 2 API calls, with 5000 total

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
export function processItems(
         apiToken: string,
         orgName: string,
         repoName: string,
         items: number[],
         shouldClose: boolean,
         comment: string
       ) {
         const octokit = new Octokit({
           auth: apiToken,
         });

         if (items.length > API_LIMIT) {
           return console.error(
             `Cannot process more than ${API_LIMIT} GH items at once`
           );
         }
         return Promise.all(
           items
             .filter((item) => item)
             .map((item) =>
               processItem(
                 octokit,
                 orgName,
                 repoName,
                 item,
                 shouldClose,
                 comment
               )
             )
         );
       }

/**
 * Processes a single GH item
 *
 * @param octokit API object
 * @param orgName Organization name
 * @param repoName Repository name
 * @param item GH item to process
 * @param comment Comment
 */
function processItem(
  octokit: Octokit,
  orgName: string,
  repoName: string,
  item: number,
  shouldClose: boolean,
  comment: string
) {
  return Promise.resolve(
    postComment(octokit, orgName, repoName, item, comment)
  ).then(() => {
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
function closeItem(
  octokit: Octokit,
  orgName: string,
  repoName: string,
  item: number
) {
  octokit.issues.update({
    owner: orgName,
    repo: repoName,
    issue_number: item,
    state: CLOSED_ITEM_STATE,
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
function postComment(
  octokit: Octokit,
  orgName: string,
  repoName: string,
  item: number,
  comment: string
) {
  /**
   * Only make comment if comment was specified
   */
  if (comment) {
    octokit.issues.createComment({
      owner: orgName,
      repo: repoName,
      issue_number: item,
      body: comment,
    });
  }
}
