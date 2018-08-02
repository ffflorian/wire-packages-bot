interface Command {
  name: string;
  parseArguments: boolean;
  description: string;
  type: MessageType;
}

enum MessageType {
  BOWER,
  CRATES,
  HELP,
  NO_ARGUMENTS,
  NO_COMMAND,
  NPM,
  SERVICES,
  TYPES,
  UNKNOWN_COMMAND,
  UPTIME,
}

const commands: Command[] = [
  {
    description: 'Display this message.',
    name: 'help',
    parseArguments: false,
    type: MessageType.HELP,
  },
  {
    description: 'List the available services.',
    name: 'services',
    parseArguments: false,
    type: MessageType.SERVICES,
  },
  {
    description: 'Get the current uptime of this bot.',
    name: 'uptime',
    parseArguments: false,
    type: MessageType.UPTIME,
  },
  {
    description: 'Search for a package on npm.',
    name: 'npm',
    parseArguments: true,
    type: MessageType.NPM,
  },
  {
    description: 'Search for a package on Bower.',
    name: 'bower',
    parseArguments: true,
    type: MessageType.BOWER,
  },
  {
    description: 'Search for type definitions on TypeSearch.',
    name: 'types',
    parseArguments: true,
    type: MessageType.TYPES,
  },
  {
    description: 'Search for a package on crates.io.',
    name: 'crates',
    parseArguments: true,
    type: MessageType.CRATES,
  },
];

class CommandService {
  static formatCommands(): string {
    return commands
      .sort((a, b) => a.name.localeCompare(b.name))
      .reduce((prev, command) => prev + `\n- **/${command.name}**: ${command.description}`, '');
  }

  static parseCommand(message: string): [MessageType, string] {
    const messageMatch = message.match(/\/(\w+)(?: (.*))?/);

    if (messageMatch && messageMatch.length) {
      const parsedCommand = messageMatch[1].toLowerCase();
      const parsedArguments = messageMatch[2];

      for (const command of commands) {
        if (command.name === parsedCommand) {
          if (command.parseArguments && !parsedArguments) {
            return [MessageType.NO_ARGUMENTS, '']
          }
          return [command.type, command.parseArguments ? parsedArguments : ''];
        }
      }
    }
    return [MessageType.NO_COMMAND, ''];
  }
}

export { CommandService, MessageType };
