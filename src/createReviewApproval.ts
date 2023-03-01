import * as core from '@actions/core';
import * as github from '@actions/github';

type Octokit = ReturnType<typeof github.getOctokit>;

type Params = {
  octokit: Octokit;
  owner: string;
  repo: string;
  pullRequest: number;
  commitId: string;
};

export async function createReviewApproval({
  octokit,
  owner,
  repo,
  pullRequest,
  commitId,
}: Params) {
  try {
    await octokit.pulls.createReview({
      owner,
      repo,
      pull_number: pullRequest,
      commit_id: commitId,
      event: 'APPROVE',
    });
  } catch (err) {
    core.error(
      `Something went wrong when posting the review: ${err} ${err.stack}`
    );
    throw err;
  }
}
