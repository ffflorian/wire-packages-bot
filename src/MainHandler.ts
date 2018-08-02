import { MessageHandler } from '@wireapp/bot-api';
import { GenericMessageType, PayloadBundleIncoming } from '@wireapp/core/dist/conversation/root';
import { TextContent } from '@wireapp/core/dist/conversation/content/';
import { CONVERSATION_EVENT } from '@wireapp/api-client/dist/commonjs/event';
import { Connection } from '@wireapp/api-client/dist/commonjs/connection';
import { CommandService, MessageType } from './CommandService';
import { toHHMMSS } from './utils';
import { SearchService } from './SearchService';

const { version }: { version: string } = require('../package.json');

const ALLOWED_USERIDS: string[] = ['4cc1bb8f-1e70-4c9e-b525-a496f2544926', '9bce80c5-ec4c-457e-a966-7eecee1674d9'];

class MainHandler extends MessageHandler {
  private readonly helpText = `**Hello!** 😎 This is packages bot v${version} speaking.\nWith me you can search for all the packages on Bower, npm, TypeSearch and crates.io. 📦\n\nAvailable commands:\n${CommandService.formatCommands()}\n\nMore information about this bot: https://github.com/ffflorian/wire-web-packages-bot`;

  constructor() {
    super();
  }

  async handleEvent(payload: PayloadBundleIncoming) {
    switch (payload.type) {
      case GenericMessageType.TEXT: {
        if (payload.conversation) {
          const messageContent = payload.content as TextContent;
          return this.handleText(payload.conversation, messageContent.text);
        }
      }
      case CONVERSATION_EVENT.CONNECT_REQUEST: {
        if (payload.conversation) {
          const connectRequest = payload.content as Connection;
          return this.handleConnectionRequest(connectRequest.to, payload.conversation)
        }
      }
    }
  }

  async handleText(
    conversationId: string,
    text: string
  ): Promise<void> {
    const [command, content] = CommandService.parseCommand(text);

    switch (command) {
      case MessageType.HELP:
        return this.sendText(conversationId, this.helpText);
      case MessageType.SERVICES:
        return this.sendText(
            conversationId,
            'Available services:\n- **/bower**\n- **/npm**\n- **/crates**\n- **/types**'
          );
      case MessageType.UPTIME:
        return this.sendText(
          conversationId,
          `Current uptime: ${toHHMMSS(process.uptime().toString())}`
        );
      case MessageType.BOWER: {
        await this.sendText(
          conversationId,
          `Searching for "${content}" on Bower ...`
        );
        const result = await SearchService.searchBower(content);
        return this.sendText(
          conversationId,
          result
        );
      }
      case MessageType.NPM: {
        await this.sendText(
          conversationId,
          `Searching for "${content}" on npm ...`
        );
        const result = await SearchService.searchNpm(content);
        return this.sendText(
          conversationId,
          result
        );
      }
      case MessageType.CRATES: {
        await this.sendText(
          conversationId,
          `Searching for "${content}" on crates.io ...`
        );
        const result = await SearchService.searchCrates(content);
        return this.sendText(
          conversationId,
          result
        );
      }
      case MessageType.TYPES: {
        await this.sendText(
          conversationId,
          `Searching for "${content}" on TypeSearch ...`
        );
        const result = await SearchService.searchTypes(content);
        return this.sendText(
          conversationId,
          result
        );
      }
      case MessageType.UNKNOWN_COMMAND:
        return this.sendText(
          conversationId,
          `Sorry, I don't know the command "${text}" yet.`
        );
      case MessageType.NO_ARGUMENTS:
        return this.sendText(conversationId, `Sorry, you didn't give any arguments to the provided command.`);
    }
  }

  async handleConnectionRequest(
    userId: string,
    conversationId: string
  ): Promise<void> {
    if (ALLOWED_USERIDS.includes(userId)) {
      console.log(`Allowing to connect to ${userId}.`);
      await this.sendConnectionResponse(userId, true);
      await this.sendText(conversationId, this.helpText);
    } else {
      console.log(`Refusing to connect to ${userId}.`);
      await this.sendConnectionResponse(userId, false);
    }
  }
}

export { MainHandler };
