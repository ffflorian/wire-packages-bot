interface BasicCommand {
  command: string;
  description: string;
  parseArguments: boolean;
  type: MessageType;
}

interface AnswerCommand {
  command: string;
  type: MessageType;
}

enum MessageType {
  ANSWER_NO,
  ANSWER_YES,
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

const answerCommands: AnswerCommand[] = [
  {
    command: 'yes',
    type: MessageType.ANSWER_YES,
  },
  {
    command: 'no',
    type: MessageType.ANSWER_NO,
  },
]

const basicCommands: BasicCommand[] = [
  {
    command: 'help',
    description: 'Display this message.',
    parseArguments: false,
    type: MessageType.HELP,
  },
  {
    command: 'services',
    description: 'List the available services.',
    parseArguments: false,
    type: MessageType.SERVICES,
  },
  {
    command: 'uptime',
    description: 'Get the current uptime of this bot.',
    parseArguments: false,
    type: MessageType.UPTIME,
  },
  {
    command: 'npm',
    description: 'Search for a package on npm.',
    parseArguments: true,
    type: MessageType.NPM,
  },
  {
    command: 'bower',
    description: 'Search for a package on Bower.',
    parseArguments: true,
    type: MessageType.BOWER,
  },
  {
    command: 'types',
    description: 'Search for type definitions on TypeSearch.',
    parseArguments: true,
    type: MessageType.TYPES,
  },
  {
    command: 'crates',
    description: 'Search for a package on crates.io.',
    parseArguments: true,
    type: MessageType.CRATES,
  },
];

const CommandService = {
  formatCommands(): string {
    return basicCommands
      .sort((a, b) => a.command.localeCompare(b.command))
      .reduce((prev, command) => prev + `\n- **/${command.command}**: ${command.description}`, '');
  },
  parseCommand(message: string): [MessageType, string] {
    const messageMatch = message.match(/\/(\w+)(?: (.*))?/);

    for (const answerCommand of answerCommands) {
      if (message.toLowerCase() === answerCommand.command) {
        return [answerCommand.type, ''];
      }
    }

    if (messageMatch && messageMatch.length) {
      const parsedCommand = messageMatch[1].toLowerCase();
      const parsedArguments = messageMatch[2];

      for (const command of basicCommands) {
        if (command.command === parsedCommand) {
          if (command.parseArguments && !parsedArguments) {
            return [MessageType.NO_ARGUMENTS, ''];
          }
          return [command.type, command.parseArguments ? parsedArguments : ''];
        }
      }
      return [MessageType.UNKNOWN_COMMAND, parsedCommand];
    }
    return [MessageType.NO_COMMAND, ''];
  }
}

export {CommandService, MessageType};
