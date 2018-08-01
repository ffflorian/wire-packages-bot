interface Command {
  alias?: string;
  name: string;
  description: string;
}

const commands: Command[] = [
  {
    name: 'help',
    description: 'Display this message.',
  },
  {
    name: 'services',
    description: 'List the available services.',
  },
  {
    name: 'uptime',
    description: 'Get the current uptime of this bot.',
  },
  {
    name: 'npm',
    description: 'Search for a package on npm.',
  },
  {
    name: 'bower',
    description: 'Search for a package on Bower.',
  },
  {
    name: 'type',
    alias: 'types',
    description: 'Search for type definitions on TypeSearch.',
  },
  {
    alias: 'crates',
    name: 'crate',
    description: 'Search for a package on crates.io.',
  },
];

const formatCommands = (): string =>
  commands.reduce(
    (prev, command) =>
      prev +
      `\n- **/${command.name}**${command.alias ? ' (or **/' + command.alias + '**)' : ''}: ${command.description}`,
    '',
  );

export { commands, formatCommands };
