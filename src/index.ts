require('dotenv').config();

process.on('uncaughtException', error =>
  console.error(`Uncaught exception: ${error.message}`, error)
);
process.on('unhandledRejection', error =>
  console.error(
    `Uncaught rejection "${error.constructor.name}": ${error.message}`,
    error
  )
);

import { Bot } from '@wireapp/bot-api';
import { SearchHandler } from './SearchHandler';
import { MainHandler } from './MainHandler';

(async () => {
  const bot = new Bot();

  bot.addHandler(new SearchHandler());
  bot.addHandler(new MainHandler());

  await bot.start(
    String(process.env.WIRE_EMAIL),
    String(process.env.WIRE_PASSWORD)
  );
})();
