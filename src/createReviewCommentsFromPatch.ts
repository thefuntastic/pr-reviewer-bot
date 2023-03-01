import * as core from '@actions/core';
import * as github from '@actions/github';

import {parseGitPatch} from './parseGitPatch';
import {deleteOldReviewComments} from './deleteOldReviewComments';

type Octokit = ReturnType<typeof github.getOctokit>;

type Params = {
  octokit: Octokit;
  owner: string;
  repo: string;
  commentBody: string;
  gitDiff: string;
  pullRequest: number;
  commitId: string;
  botNick: string | null;
};

export async function createReviewCommentsFromPatch({
  octokit,
  owner,
  repo,
  commentBody,
  gitDiff,
  pullRequest,
  commitId,
  botNick,
}: Params) {
  if (!gitDiff) {
    return;
  }

  const patches = parseGitPatch(gitDiff);

  // Delete existing review comments from this bot
  try {
    await deleteOldReviewComments({
      octokit,
      owner,
      repo,
      commentBody,
      pullRequest,
      botNick,
    });
  } catch (err) {
    core.error(`Something went wrong when deleting old comments : ${err}

${err.stack}`);
  }

  if (!patches.length) {
    return;
  }

  const comments: any[] = [];
  for (const patch of patches) {
    comments.push({
      path: patch.removed.file,
      body: `${commentBody}:

\`\`\`suggestion
${patch.added.lines.join('\n')}
\`\`\`
`,
      side: 'RIGHT',
      start_side: 'RIGHT',
      start_line:
        patch.removed.start !== patch.removed.end
          ? patch.removed.start
          : undefined,
      line: patch.removed.end,
    });
  }

  try {
    await octokit.pulls.createReview({
      owner,
      repo,
      pull_number: pullRequest,
      commit_id: commitId,
      event: 'APPROVE',
      comments,
      mediaType: {
        previews: ['comfort-fade'],
      },
    });
  } catch (err) {
    core.error(`Something went wrong when posting the review: ${err}

${err.stack}`);
    throw err;
  }
}
