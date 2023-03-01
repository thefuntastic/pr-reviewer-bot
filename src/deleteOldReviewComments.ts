import * as github from '@actions/github';

type Octokit = ReturnType<typeof github.getOctokit>;

type Params = {
  botNick: string | null;
  octokit: Octokit;
  owner: string;
  repo: string;
  commentBody: string;
  pullRequest: number;
};

export async function deleteOldReviewComments({
  octokit,
  owner,
  repo,
  commentBody,
  pullRequest,
  botNick,
}: Params) {
  if (botNick === null) {
    return;
  }

  // Delete existing review comments from this bot
  const existingReviews = await octokit.pulls.listReviewComments({
    owner,
    repo,
    pull_number: pullRequest,
  });

  await Promise.all(
    existingReviews?.data
      .filter(
        review =>
          review.user.login === botNick && review.body.includes(commentBody)
      )
      .map(async review =>
        octokit.pulls.deleteReviewComment({
          owner,
          repo,
          comment_id: review.id,
        })
      ) || []
  );
}
