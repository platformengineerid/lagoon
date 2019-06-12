// @flow
const { sendToLagoonLogs } = require('@lagoon/commons/src/logs');
const { addUserToGroup } = require('@lagoon/commons/src/api');

import type { WebhookRequestData } from '../types';

async function gitlabUserProjectAdd(webhook: WebhookRequestData) {
  const { webhooktype, event, uuid, body } = webhook;

  try {
    const { project_path: projectName, user_id: userId, user_email: userEmail, access_level: role } = body;

    const meta = {
      data: body,
      userId,
      userEmail,
      projectName,
      access_level,
    };

    // In Gitlab you can add Users to Projects, in Lagoon this is not directly possible, but instead
    // Lagoon automatically creates a group for each project in this form: `project-$projectname`
    // So if a User is added to a Project in Gitlab, we add the user to this group
    await addUserToGroup(userEmail, `project-${projectName}`, access_level.toUpperCase());

    sendToLagoonLogs(
      'info',
      '',
      uuid,
      `${webhooktype}:${event}:handled`,
      meta,
      `Added user ${userEmail} ${userId} to group project-${projectName}`
    );

    return;
  } catch (error) {
    sendToLagoonLogs(
      'error',
      '',
      uuid,
      `${webhooktype}:${event}:unhandled`,
      { data: body },
      `Could not add user ${userEmail} ${userId} to group project-${projectName}, reason: ${error}`
    );

    return;
  }
}

module.exports = gitlabUserProjectAdd;
