import { MessageHandler } from '@wireapp/bot-api';
import { formatCommands } from './commands';

const { version }: { version: string } = require('../package.json');

const ALLOWED_USERIDS: string[] = ['4cc1bb8f-1e70-4c9e-b525-a496f2544926', '9bce80c5-ec4c-457e-a966-7eecee1674d9'];

enum MessageType {
  FORECAST = 'forecast',
  HELP = 'help',
  SERVICE = 'service',
  NO_COMMAND = 'no_command',
  UPTIME = 'uptime',
  UNKNOWN_COMMAND = 'unknown_command'
}

const toHHMMSS = (input: string): string => {
  const pad = (t: number) => (t < 10 ? '0' + t : t);

  const uptime = parseInt(input, 10);
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime - hours * 3600) / 60);
  const seconds = uptime - hours * 3600 - minutes * 60;

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

class MainHandler extends MessageHandler {
  private readonly helpText = `**Hello!** 😎 This is packages bot v${version} speaking. With me you can search for all the packages on Bower, npm, TypeSearch and crates. 📦\n\nAvailable commands:\n${formatCommands()}\n\nMore information about this bot: https://github.com/ffflorian/wire-web-packages-bot`;

  constructor() {
    super();
  }

  private parseMessage(text: string): [MessageType, string] {
    const parsedCommand = text.match(/\/(\w+)(?: (.*))?/);

    if (parsedCommand && parsedCommand.length) {
      const command = parsedCommand[1];
      const content = parsedCommand[2] || '';

      switch (command) {
        case MessageType.HELP:
          return [MessageType.HELP, ''];
        case MessageType.SERVICE:
        case MessageType.FORECAST:
        case MessageType.UPTIME:
          return [command, content];
        default:
          return [MessageType.UNKNOWN_COMMAND, ''];
      }
    }
    return [MessageType.NO_COMMAND, ''];
  }


  async handleText(
    conversationId: string,
    fromUserId: string,
    text: string
  ): Promise<void> {
    const [command, content] = this.parseMessage(text);

    switch (command) {
      case MessageType.HELP: {
        await this.sendText(conversationId, this.helpText);
        break;
      }
      case MessageType.SERVICE: {
        let response;
        if (!content) {
          return this.sendText(
            conversationId,
            `You did not provide a city. Try e.g. \`/weather Berlin\`.`
          );
        }
        this.sendText(
            conversationId,
            'Which service would you like to use?'
          );
        }
      case MessageType.UPTIME: {
        return this.sendText(
          conversationId,
          `Current uptime: ${toHHMMSS(process.uptime().toString())}`
        );
      }
      case MessageType.UNKNOWN_COMMAND: {
        return this.sendText(
          conversationId,
          `Sorry, I don't know the command "${text}" yet.`
        );
      }
    }
  }

  async handleConnectionRequest(
    userId: string,
    conversationId: string
  ): Promise<void> {
    if (ALLOWED_USERIDS.includes(userId)) {
      console.log(`Allowing to connect to ${userId}.`);
      await this.sendConnectionRequestAnswer(userId, true);
      await this.sendText(conversationId, this.helpText);
    } else {
      console.log(`Refusing to connect to ${userId}.`);
      await this.sendConnectionRequestAnswer(userId, false);
    }
  }
}

export { MainHandler };
