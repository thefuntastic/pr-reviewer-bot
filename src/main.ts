import fs from 'fs/promises';
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


async function run(): Promise<void> {
  if (!octokit) {
    core.debug('No octokit client');
    return;
  }

  if (!GITHUB_EVENT_PATH) {
    core.debug('No GITHUB_EVENT_PATH environment vaiable set');
    return;
  }

  let parsedEvent: GithubLabelEvent;

  try {
    const eventData = await fs.readFile(GITHUB_EVENT_PATH, 'utf-8');
    core.debug(eventData);
    parsedEvent = parseGithubLabelEvent(eventData);
  } catch (err: any) {
    core.error(`Could not parse GITHUB_EVENT ${err} ${GITHUB_EVENT_PATH}`);
    core.setFailed(err);
    return;
  }

  // Note, when labels are batch updated, only the first label is provided. Therefore this can't be relied on, and we must poll available labels instead.
  const triggeredLabel = parsedEvent.label.name;
  const prNumber = parsedEvent.pull_request.number;
  const repoName = parsedEvent.repository.name;
  const repoOwner = parsedEvent.repository.owner.login;

  if (parsedEvent.action === "labeled") {
    core.debug(
      `PR #${prNumber} in ${repoOwner}/${repoName} has been labeled with "${triggeredLabel}".`
    );
  } else if (parsedEvent.action === "unlabeled") {
    core.debug(
      `PR #${prNumber} in ${repoOwner}/${repoName} has been unlabeled with "${triggeredLabel}".`
    );
  }

  const labelExists = hasLabel(labelName, parsedEvent);
  core.debug(`Has label: ${labelExists} ${labelName}`);

  // const botNick = core.getInput('botNick') || null;

  if (labelExists) {
    try {
      await approvePR({
        octokit,
        owner,
        repo,
        // @ts-ignore
        pullRequest: parsedEvent.pull_request.number,
        commitId: parsedEvent.pull_request.head.sha,
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
