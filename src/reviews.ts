import * as core from '@actions/core';
import * as github from '@actions/github';

type Octokit = ReturnType<typeof github.getOctokit>;

export interface Review {
  id: number;
  user?: { login: string; } | null;
  state: string;
}

export async function getReviews(
  octokit: Octokit,
  owner: string,
  repo: string,
  pullRequest: number,
): Promise<Review[]> {
  try {
    const response = await octokit.rest.pulls.listReviews({
      owner,
      repo,
      pull_number: pullRequest,
    });

    core.debug(`returned lists of reviews from github ${response.data}`)

    return response.data;

  } catch (err: any) {
    core.error(`Something went wrong retrieving reviews: ${err}`);
    throw err;
  }
}



function findReviewByUser(reviews: Review[], username: string): Review | undefined {
  const review = reviews.find(
    (review: Review) => review.user?.login === username
  );

  core.debug(`found review ${review}`);

  return review;
}

export async function findReviewByUserName(octokit: Octokit, owner: string, repo: string, pullNumber: number, username: string): Promise<Review | undefined> {
  const reviews = await getReviews(octokit, owner, repo, pullNumber);
  const review = findReviewByUser(reviews, username);
  return review
}