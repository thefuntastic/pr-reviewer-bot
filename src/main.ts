import * as github from '@actions/github';
import * as core from '@actions/core';

import { approvePR } from './approvePR';
import { hasLabel } from './checkLabelExists';
import { GithubLabelEvent, parseGithubLabelEvent } from './types/githubEvent';

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

  let parsedEvent: GithubLabelEvent;

  try {
    parsedEvent = parseGithubLabelEvent(GITHUB_EVENT);
  } catch (err: any) {
    core.error(`Could not parse GITHUB_EVENT ${err} ${GITHUB_EVENT}`);
    core.setFailed(err);
    return;
  }

  const labelName = parsedEvent.label.name;
  const prNumber = parsedEvent.pull_request.number;
  const repoName = parsedEvent.repository.name;
  const repoOwner = parsedEvent.repository.owner.login;

  if (parsedEvent.action === "labeled") {
    core.debug(
      `PR #${prNumber} in ${repoOwner}/${repoName} has been labeled with "${labelName}".`
    );
  } else if (parsedEvent.action === "unlabeled") {
    core.debug(
      `PR #${prNumber} in ${repoOwner}/${repoName} has been unlabeled with "${labelName}".`
    );
  }

  const labelExists = hasLabel(labelName, parsedEvent);
  core.debug(`Has lablel: ${labelExists} ${labelName}`);

  // const botNick = core.getInput('botNick') || null;

  if (labelExists) {
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
