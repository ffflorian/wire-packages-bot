import { MessageHandler } from '@wireapp/bot-api';
import { formatCommands } from './commands';

const { version }: { version: string } = require('../package.json');

const ALLOWED_USERIDS: string[] = ['4cc1bb8f-1e70-4c9e-b525-a496f2544926', '9bce80c5-ec4c-457e-a966-7eecee1674d9'];

enum MessageType {
  HELP = 'help',
  SERVICES = 'services',
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
  private readonly helpText = `**Hello!** 😎 This is packages bot v${version} speaking.\nWith me you can search for all the packages on Bower, npm, TypeSearch and crates.io. 📦\n\nAvailable commands:\n${formatCommands()}\n\nMore information about this bot: https://github.com/ffflorian/wire-web-packages-bot`;

  constructor() {
    super();
  }

  private parseMessage(text: string): [MessageType, string] {
    console.log({text})
    const parsedCommand = text.match(/\/(\w+)(?: (.*))?/);
    console.log({parsedCommand})

    if (parsedCommand && parsedCommand.length) {
      const command = parsedCommand[1];
      const content = parsedCommand[2] || '';

      switch (command) {
        case MessageType.HELP:
        case MessageType.SERVICES:
          return [command, ''];
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
    userId: string,
    text: string
  ): Promise<void> {
    const [command, content] = this.parseMessage(text);

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
      case MessageType.UNKNOWN_COMMAND:
        return this.sendText(
          conversationId,
          `Sorry, I don't know the command "${text}" yet.`
        );
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
