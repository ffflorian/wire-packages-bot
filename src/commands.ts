interface Command {
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
    name: 'types',
    description: 'Search for type definitions on TypeSearch.',
  },
  {
    name: 'crates',
    description: 'Search for a package on crates.io.',
  },
];

const formatCommands = (): string =>
  commands.sort((a, b) => a.name.localeCompare(b.name)).reduce(
    (prev, command) =>
      prev +
      `\n- **/${command.name}**: ${command.description}`,
    '',
  );

export { commands, formatCommands };
