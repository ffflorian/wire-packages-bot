import {MessageHandler} from '@wireapp/bot-api';
import {PayloadBundleIncoming, PayloadBundleType, ReactionType} from '@wireapp/core/dist/conversation/root';
import {TextContent} from '@wireapp/core/dist/conversation/content/';
import {Connection} from '@wireapp/api-client/dist/commonjs/connection';
import {CommandService, CommandType, ParsedCommand} from './CommandService';
import {toHHMMSS} from './utils';
import {SearchService} from './SearchService';

const {version}: {version: string} = require('../package.json');

const ALLOWED_USERIDS: string[] = ['4cc1bb8f-1e70-4c9e-b525-a496f2544926', '9bce80c5-ec4c-457e-a966-7eecee1674d9'];

class MainHandler extends MessageHandler {
  private searchService: SearchService;
  private readonly helpText = `**Hello!** 😎 This is packages bot v${version} speaking.\nWith me you can search for all the packages on Bower, npm, TypeSearch and crates.io. 📦\n\nAvailable commands:\n${CommandService.formatCommands()}\n\nMore information about this bot: https://github.com/ffflorian/wire-packages-bot`;
  private answerCache: {
    [conversationId: string]: {
      content?: string;
      page: number;
      type: CommandType;
      waitingForContent: boolean;
    };
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
    return `\n\nThere ${isOne ? 'is' : 'are'} ${moreResults} more result${
      isOne ? '' : 's'
    }. Would you like to see more? Answer with "yes" or "no".`;
  }

  async handleText(conversationId: string, text: string, messageId: string): Promise<void> {
    const {commandType, content, rawCommand} = CommandService.parseCommand(text);

    switch (commandType) {
      case CommandType.UNKNOWN_COMMAND:
      case CommandType.NO_COMMAND:
      case CommandType.ANSWER_YES:
      case CommandType.ANSWER_NO:
        break;
      default:
        await this.sendReaction(conversationId, messageId, ReactionType.LIKE);
    }

    if (this.answerCache[conversationId]) {
      const {type, content, page, waitingForContent} = this.answerCache[conversationId];
      if (waitingForContent) {
        await this.sendReaction(conversationId, messageId, ReactionType.LIKE);
        delete this.answerCache[conversationId];
        return this.answer(conversationId, {commandType, rawCommand});
      }
      switch (commandType) {
        case CommandType.ANSWER_YES: {
          await this.sendReaction(conversationId, messageId, ReactionType.LIKE);
          return this.answer(conversationId, {commandType, rawCommand}, page + 1);
        }
        case CommandType.ANSWER_NO: {
          await this.sendReaction(conversationId, messageId, ReactionType.LIKE);
          delete this.answerCache[conversationId];
          await this.sendText(conversationId, 'Okay.');
          return;
        }
      }
    }

    return this.answer(conversationId, {commandType, content, rawCommand});
  }

  async answer(conversationId: string, parsedCommand: ParsedCommand, page = 1) {
    const {content, rawCommand, commandType} = parsedCommand;
    switch (commandType) {
      case CommandType.HELP:
        return this.sendText(conversationId, this.helpText);
      case CommandType.SERVICES:
        return this.sendText(
          conversationId,
          'Available services:\n- **/bower**\n- **/npm**\n- **/crates**\n- **/types**'
        );
      case CommandType.UPTIME:
        return this.sendText(conversationId, `Current uptime: ${toHHMMSS(process.uptime().toString())}`);
      case CommandType.BOWER: {
        if (!content) {
          this.answerCache[conversationId] = {
            page,
            type: CommandType.BOWER,
            waitingForContent: true,
          };
          return this.sendText(conversationId, 'What would you like to search on Bower?');
        }
        await this.sendText(conversationId, `Searching for "${content}" on Bower ...`);
        let {result, moreResults} = await this.searchService.searchBower(content, page);
        if (moreResults > 0) {
          result += MainHandler.morePagesText(moreResults);
          this.answerCache[conversationId] = {
            content,
            page,
            type: CommandType.BOWER,
            waitingForContent: false,
          };
        } else {
          delete this.answerCache[conversationId];
        }
        return this.sendText(conversationId, result);
      }
      case CommandType.NPM: {
        if (!content) {
          this.answerCache[conversationId] = {
            page,
            type: CommandType.NPM,
            waitingForContent: true,
          };
          return this.sendText(conversationId, 'What would you like to search on npm?');
        }
        await this.sendText(conversationId, `Searching for "${content}" on npm ...`);
        let {result, moreResults} = await this.searchService.searchNpm(content, page);
        if (moreResults > 0) {
          result += MainHandler.morePagesText(moreResults);
          this.answerCache[conversationId] = {
            content,
            page,
            type: CommandType.NPM,
            waitingForContent: false,
          };
        } else {
          delete this.answerCache[conversationId];
        }
        return this.sendText(conversationId, result);
      }
      case CommandType.CRATES: {
        if (!content) {
          this.answerCache[conversationId] = {
            page,
            type: CommandType.CRATES,
            waitingForContent: true,
          };
          return this.sendText(conversationId, 'What would you like to search on crates.io?');
        }
        await this.sendText(conversationId, `Searching for "${content}" on crates.io ...`);
        let {result, moreResults} = await this.searchService.searchCrates(content, page);
        if (moreResults > 0) {
          result += MainHandler.morePagesText(moreResults);
          this.answerCache[conversationId] = {
            content,
            page,
            type: CommandType.CRATES,
            waitingForContent: false,
          };
        } else {
          delete this.answerCache[conversationId];
        }
        return this.sendText(conversationId, result);
      }
      case CommandType.TYPES: {
        return this.sendText(conversationId, `Not implemented yet.`);
      }
      case CommandType.UNKNOWN_COMMAND:
        return this.sendText(conversationId, `Sorry, I don't know the command "${rawCommand}" yet.`);
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
