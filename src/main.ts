import * as github from '@actions/github';
import * as core from '@actions/core';

//import { createReviewCommentsFromPatch } from './createReviewCommentsFromPatch';
import {createReviewApproval} from './createReviewApproval';

const {GITHUB_EVENT_PATH} = process.env;
const {owner, repo} = github.context.repo;
const token = core.getInput('github-token') || core.getInput('githubToken');
const octokit = token && github.getOctokit(token);
// @ts-ignore
const GITHUB_EVENT = require(GITHUB_EVENT_PATH);

async function run(): Promise<void> {
  if (!octokit) {
    core.debug('No octokit client');
    return;
  }

  if (!github.context.payload.pull_request) {
    core.debug('Requires a pull request');
    return;
  }

  core.debug(GITHUB_EVENT.action);

  if (GITHUB_EVENT.action !== 'labeled') {
    core.debug('Only interested in labels being added or removed');
    return;
  }

  //This is going to need to be a bit more complicated
  if (GITHUB_EVENT.label.name !== 'bug') {
    core.debug('Only unrelated labels have changed');
    return;
  }

  core.debug('Hello world');
  //core.debug(GITHUB_EVENT);
  core.debug(github.context.toString());

  // const commentBody =
  //   core.getInput('message') ||
  //   'Something magical has suggested this change for you';

  // const botNick = core.getInput('botNick') || null;

  try {
    await createReviewApproval({
      octokit,
      owner,
      repo,
      // @ts-ignore
      pullRequest: github.context.payload.pull_request?.number,
      commitId: GITHUB_EVENT.pull_request?.head.sha,
    });
  } catch (err) {
    core.setFailed(err);
  }

  // // If we have a git diff, then it means that some linter/formatter has changed some files, so
  // // we should fail the build
  // if (!!gitDiff) {
  //   core.setFailed(
  //     new Error(
  //       'There were some changed files, please update your PR with the code review suggestions'
  //     )
  //   );
  // }
}

run();
