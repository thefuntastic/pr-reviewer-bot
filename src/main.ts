import * as github from '@actions/github';
import * as core from '@actions/core';

//import { createReviewCommentsFromPatch } from './createReviewCommentsFromPatch';
import { approvePR } from './approvePR';

const { GITHUB_EVENT_PATH } = process.env;
const { owner, repo } = github.context.repo;
const token = core.getInput('github-token') || core.getInput('githubToken');
const octokit = token && github.getOctokit(token);
const labelName = core.getInput('label-name');
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

  // if (GITHUB_EVENT.action !== 'labeled' || GITHUB_EVENT.action !== 'unlabeled') {
  //   core.debug(`Action only intended for labeled and unlabeled events. Current event ${GITHUB_EVENT.action}`);
  //   return;
  // }

  // //This is going to need to be a bit more complicated
  // if (GITHUB_EVENT.label.name !== labelName) {
  //   core.debug('Only unrelated labels have changed');
  //   return;
  // }

  let hasLabel = GITHUB_EVENT.pull_request.labels.includes(function (label: any) {
    label.name === labelName
  })

  core.debug(`Has lablel: ${hasLabel} ${labelName}`);
  core.debug('Hello world');
  //core.debug(GITHUB_EVENT);
  core.debug(github.context.toString());

  // const commentBody =
  //   core.getInput('message') ||
  //   'Something magical has suggested this change for you';

  // const botNick = core.getInput('botNick') || null;

  if (hasLabel) {
    try {
      await approvePR({
        octokit,
        owner,
        repo,
        // @ts-ignore
        pullRequest: github.context.payload.pull_request?.number,
        commitId: GITHUB_EVENT.pull_request?.head.sha,
      });
    } catch (err: any) {
      core.setFailed(`Something went wrong when posting the review: ${err}`);
    }
  } else {
    core.debug('should be removing PR request');
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
