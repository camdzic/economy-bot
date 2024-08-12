import { ComponentType } from 'discord.js';
import {
  PaginatedMessage,
  PaginatedMessageAction,
  PaginatedMessageActionLink,
  PaginatedMessagePage,
  actionIsButtonOrMenu,
  actionIsLinkButton
} from '@sapphire/discord.js-utilities';

function actionIsButton(
  action: PaginatedMessageAction
): action is Exclude<PaginatedMessageAction, PaginatedMessageActionLink> {
  return action.type === ComponentType.Button;
}

export class ExtendedPaginatedMessage extends PaginatedMessage {
  override addPage(page: PaginatedMessagePage) {
    this.pages.push(page);

    return this;
  }

  override addAction(action: PaginatedMessageAction) {
    if (this.pages.length <= 25) {
      if (actionIsLinkButton(action)) {
        this.actions.set(action.url, action);
      } else if (actionIsButtonOrMenu(action)) {
        this.actions.set(action.customId, action);
      }
    } else {
      if (actionIsButton(action)) {
        this.actions.set(action.customId, action);
      }
    }

    return this;
  }
}
