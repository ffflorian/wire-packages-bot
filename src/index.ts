require('dotenv').config();

process.on('uncaughtException', error => console.error(`Uncaught exception: ${error.message}`, error));
process.on('unhandledRejection', error =>
  console.error(`Uncaught rejection "${error.constructor.name}": ${error.message}`, error)
);

import {Bot} from '@wireapp/bot-api';
import {MainHandler} from './MainHandler';

(async () => {
  const bot = new Bot({
    email: String(process.env.WIRE_EMAIL),
    password: String(process.env.WIRE_PASSWORD),
  });

  const mainHandler = new MainHandler(String(process.env.LIBRARIES_API_KEY));

  bot.addHandler(mainHandler);

  await bot.start();
})();
