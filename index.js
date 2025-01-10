const express = require('express');
const telegram = require('node-telegram-bot-api');
const dotenv = require('dotenv');
dotenv.config();
const token = process.env.MY_TOKEN;
const ownerId = process.env.OWNER_ID;
const bot = new telegram(token, { polling: true });
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, `Welcome ${msg.chat.first_name}`, {
    reply_markup: {
      keyboard: [['/test', '/help'], ['/resources'], ["I'm robot"]],
    },
  });
});

bot.onText(/\/test/, (msg) => {
  bot.sendMessage(msg.chat.id, 'I am alive thank you for asking ❤️');
});

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    'You have any issue with anything you can drop your feedback here \n' +
      'Type /help and then your message will send to our support team'
  );
});

bot.onText(/\/help (.+)/, (msg, match) => {
  console.log('hit on help');
  const chatId = msg.chat.id;
  const resp = match[1];
  bot.sendMessage(ownerId, resp);
  bot.sendMessage(chatId, 'Your message is sent to our support team');
});

bot.on('message', (msg) => {
  if (msg.chat.id === parseInt(ownerId)) {
    return bot.sendMessage(msg.chat.id, 'You are the owner of this bot');
  }
  const words = ['bc', 'mc', 'bsdk'];
  for (let value of words) {
    if (msg.text.toString().toLowerCase().includes(value)) {
      bot.sendMessage(
        msg.chat.id,
        'You cross your limitations you are will be banned'
      );
      bot.sendMessage(
        ownerId,
        `Used Abusive language : ${msg.from.username}, ${msg.text}`
      );
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
