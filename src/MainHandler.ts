import {MessageHandler} from '@wireapp/bot-api';
import {PayloadBundleIncoming, PayloadBundleType, ReactionType} from '@wireapp/core/dist/conversation/root';
import {TextContent} from '@wireapp/core/dist/conversation/content/';
import {Connection} from '@wireapp/api-client/dist/commonjs/connection';
import {CommandService, MessageType} from './CommandService';
import {toHHMMSS} from './utils';
import {SearchService} from './SearchService';

const {version}: {version: string} = require('../package.json');

const ALLOWED_USERIDS: string[] = ['4cc1bb8f-1e70-4c9e-b525-a496f2544926', '9bce80c5-ec4c-457e-a966-7eecee1674d9'];

class MainHandler extends MessageHandler {
  private searchService: SearchService;
  private readonly helpText = `**Hello!** 😎 This is packages bot v${version} speaking.\nWith me you can search for all the packages on Bower, npm, TypeSearch and crates.io. 📦\n\nAvailable commands:\n${CommandService.formatCommands()}\n\nMore information about this bot: https://github.com/ffflorian/wire-packages-bot`;
  private answerCache: {
    [conversationId: string]: {
      content: string;
      page: number;
      type: MessageType;
    }
  };

  constructor(LIBRARIES_IO_API_KEY: string) {
    super();
    this.searchService = new SearchService(LIBRARIES_IO_API_KEY);
    this.answerCache = {};
  }

  async handleEvent(payload: PayloadBundleIncoming) {
    switch (payload.type) {
      case PayloadBundleType.TEXT: {
        if (payload.conversation) {
          const messageContent = payload.content as TextContent;
          return this.handleText(payload.conversation, messageContent.text, payload.id);
        }
      }
      case PayloadBundleType.CONNECTION_REQUEST: {
        if (payload.conversation) {
          const connectRequest = payload.content as Connection;
          return this.handleConnectionRequest(connectRequest.to, payload.conversation);
        }
      }
    }
  }

  private static morePagesText(moreResults: number): string {
    const isOne = moreResults === 1;
    return `\n\nThere ${isOne ? 'is' : 'are'} ${moreResults} more result${isOne ? '' : 's'}. Would you like to see more? Answer with "yes" or "no".`
  }

  async handleText(conversationId: string, text: string, messageId: string): Promise<void> {
    const [command, content] = CommandService.parseCommand(text);

    switch (command) {
      case MessageType.UNKNOWN_COMMAND:
      case MessageType.NO_ARGUMENTS:
      case MessageType.NO_COMMAND:
      case MessageType.ANSWER_YES:
      case MessageType.ANSWER_NO:
        break;
      default:
        await this.sendReaction(conversationId, messageId, ReactionType.LIKE);
    }

    if (this.answerCache[conversationId]) {
      switch(command) {
        case MessageType.ANSWER_YES: {
          await this.sendReaction(conversationId, messageId, ReactionType.LIKE);
          const {type, content, page} = this.answerCache[conversationId];
          return this.answer(conversationId, type, content, page+1);
        }
        case MessageType.ANSWER_NO:
          await this.sendReaction(conversationId, messageId, ReactionType.LIKE);
          delete this.answerCache[conversationId];
          await this.sendText(conversationId, 'Okay.');
          return;
      }
    }

    return this.answer(conversationId, command, content);
  }

  async answer(conversationId: string, command: MessageType, content: string, page = 1) {
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
        let {result, moreResults} = await this.searchService.searchBower(content, page);
        if (moreResults > 0) {
          result += MainHandler.morePagesText(moreResults);
          this.answerCache[conversationId] = {
            content,
            page,
            type: MessageType.BOWER,
          };
        } else {
          delete this.answerCache[conversationId];
        }
        return this.sendText(conversationId, result);
      }
      case MessageType.NPM: {
        await this.sendText(conversationId, `Searching for "${content}" on npm ...`);
        let {result, moreResults} = await this.searchService.searchNpm(content, page);
        if (moreResults > 0) {
          result += MainHandler.morePagesText(moreResults);
          this.answerCache[conversationId] = {
            content,
            page,
            type: MessageType.NPM,
          };
        } else {
          delete this.answerCache[conversationId];
        }
        return this.sendText(conversationId, result);
      }
      case MessageType.CRATES: {
        await this.sendText(conversationId, `Searching for "${content}" on crates.io ...`);
        let {result, moreResults} = await this.searchService.searchCrates(content, page);
        if (moreResults > 0) {
          result += MainHandler.morePagesText(moreResults);
          this.answerCache[conversationId] = {
            content,
            page,
            type: MessageType.CRATES,
          };
        } else {
          delete this.answerCache[conversationId];
        }
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
