import {MessageHandler} from '@wireapp/bot-api';
import {GenericMessageType, PayloadBundleIncoming, ReactionType} from '@wireapp/core/dist/conversation/root';
import {TextContent} from '@wireapp/core/dist/conversation/content/';
import {CONVERSATION_EVENT} from '@wireapp/api-client/dist/commonjs/event';
import {Connection} from '@wireapp/api-client/dist/commonjs/connection';
import {CommandService, MessageType} from './CommandService';
import {toHHMMSS} from './utils';
import {SearchService} from './SearchService';

const {version}: {version: string} = require('../package.json');

const ALLOWED_USERIDS: string[] = ['4cc1bb8f-1e70-4c9e-b525-a496f2544926', '9bce80c5-ec4c-457e-a966-7eecee1674d9'];

class MainHandler extends MessageHandler {
  private searchService: SearchService;
  private readonly helpText = `**Hello!** 😎 This is packages bot v${version} speaking.\nWith me you can search for all the packages on Bower, npm, TypeSearch and crates.io. 📦\n\nAvailable commands:\n${CommandService.formatCommands()}\n\nMore information about this bot: https://github.com/ffflorian/wire-web-packages-bot`;

  constructor(LIBRARIES_API_KEY: string) {
    super();
    this.searchService = new SearchService(LIBRARIES_API_KEY);
  }

  async handleEvent(payload: PayloadBundleIncoming) {
    switch (payload.type) {
      case GenericMessageType.TEXT: {
        if (payload.conversation) {
          const messageContent = payload.content as TextContent;
          return this.handleText(payload.conversation, messageContent.text, payload.id);
        }
      }
      case CONVERSATION_EVENT.CONNECT_REQUEST: {
        if (payload.conversation) {
          const connectRequest = payload.content as Connection;
          return this.handleConnectionRequest(connectRequest.to, payload.conversation);
        }
      }
    }
  }

  async handleText(conversationId: string, text: string, messageId: string): Promise<void> {
    const [command, content] = CommandService.parseCommand(text);

    switch(command) {
      case MessageType.UNKNOWN_COMMAND:
      case MessageType.NO_ARGUMENTS:
      case MessageType.NO_COMMAND:
        break;
      default:
        await this.sendReaction(conversationId, messageId, ReactionType.LIKE);
    }

    switch (command) {
      case MessageType.HELP:
        return this.sendText(conversationId, this.helpText);
      case MessageType.SERVICES:
        return this.sendText(
          conversationId,
          'Available services:\n- **/bower**\n- **/npm**\n- **/crates**\n- **/types**'
        );
      case MessageType.UPTIME:
        return this.sendText(conversationId, `Current uptime: ${toHHMMSS(process.uptime().toString())}`);
      case MessageType.BOWER: {
        await this.sendText(conversationId, `Searching for "${content}" on Bower ...`);
        const result = await this.searchService.searchBower(content);
        return this.sendText(conversationId, result);
      }
      case MessageType.NPM: {
        await this.sendText(conversationId, `Searching for "${content}" on npm ...`);
        const result = await this.searchService.searchNpm(content);
        return this.sendText(conversationId, result);
      }
      case MessageType.CRATES: {
        await this.sendText(conversationId, `Searching for "${content}" on crates.io ...`);
        const result = await this.searchService.searchCrates(content);
        return this.sendText(conversationId, result);
      }
      case MessageType.TYPES: {
        return this.sendText(conversationId, `Not implemented yet.`);
      }
      case MessageType.UNKNOWN_COMMAND:
        return this.sendText(conversationId, `Sorry, I don't know the command "${content}" yet.`);
      case MessageType.NO_ARGUMENTS:
        return this.sendText(conversationId, `Sorry, you didn't give any arguments to the provided command.`);
    }
  }

  async handleConnectionRequest(userId: string, conversationId: string): Promise<void> {
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

export {MainHandler};
