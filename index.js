const express = require('express');
const telegram = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode');
const { courses, abusiveWord } = require('./config');

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
      keyboard: [
        ['/test', '/help'],
        ['/resources', '/courses'],
      ],
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
      'Type /message and then your message will send to our support team'
  );
});

bot.onText(/\/message (.+)/, (msg, match) => {
  console.log('hit on help');
  const chatId = msg.chat.id;
  const resp = match[1];
  bot.sendMessage(ownerId, resp);
  bot.sendMessage(chatId, 'Your response is forwarded to the support team');
});

bot.onText(/\/resources/, (msg) => {
  bot.sendMessage(msg.from.id, 'Here are some resources for you');
});

bot.onText(/\/courses/, (msg) => {
  const chatId = msg.chat.id;
  let response = 'Available courses:\n';
  const courseButtons = courses.map((course, index) => {
    return [
      {
        text: `${course.title} - ${course.price}`,
        callback_data: `course_${index}`,
      },
    ];
  });

  bot.sendMessage(chatId, response, {
    reply_markup: {
      inline_keyboard: courseButtons,
    },
  });
});

bot.on('callback_query', (callbackQuery) => {
  console.log('Callback Query:', callbackQuery);
  const msg = callbackQuery.message;
  const data = callbackQuery.data;
  if (data.startsWith('course_')) {
    const courseIndex = parseInt(data.split('_')[1]);
    const course = courses[courseIndex];

    // Acknowledge the callback query
    bot
      .answerCallbackQuery(callbackQuery.id)
      .then(() => {
        bot.sendMessage(
          msg.chat.id,
          `Executing command for ${course.title}: ${course.command}`
        );
        // Execute the specific command related to the course
        // For example, you can send a message with course details
        bot.sendMessage(
          msg.chat.id,
          `Course Details:\nTitle: ${course.title}\nDescription: ${course.description}\nPrice: ${course.price}`
        );
      })
      .catch((err) => {
        console.error('Error answering callback query:', err);
      });
  }
});

let uploadedFileId;

// Listen for file uploads
bot.on('message', (msg) => {
  if (msg.document) {
    // Capture the file_id of the uploaded file
    uploadedFileId = msg.document.file_id;

    bot.sendMessage(
      msg.chat.id,
      `File uploaded successfully! File ID: ${uploadedFileId}`
    );
  } else if (msg.text === '/getfile') {
    // Forward the file to the same user
    if (uploadedFileId) {
      bot.sendDocument(msg.chat.id, uploadedFileId);
    } else {
      bot.sendMessage(msg.chat.id, 'No file uploaded yet!');
    }
  }
});

// Example: Forwarding the file when a specific route is hit
// Simulating this with a "/forward" command for simplicity
bot.onText(/\/forward/, (msg) => {
  if (uploadedFileId) {
    bot.sendDocument(msg.chat.id, uploadedFileId);
  } else {
    bot.sendMessage(msg.chat.id, 'No file is available to forward!');
  }
});

bot.on('message', (msg) => {
  if (msg.chat.id === parseInt(ownerId)) {
    return bot.sendMessage(msg.chat.id, 'You are the owner of this bot');
  }
  const word = abusiveWord.map((word) => word.word);
  for (let value of word) {
    if (msg.text.toString().toLowerCase().includes(value)) {
      bot.sendMessage(
        msg.chat.id,
        'You cross your limitations you will be banned'
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

// bot.onText(/\/upi/, async (msg) => {
//   // console.log('You hit on the UPI route');
//   const chatId = msg.chat.id;
//   const upiId = 'lucifierboy@axl'; // Replace with your UPI ID
//   const upiUrl = `upi://pay?pa=${upiId}&pn=LucifierBoy&cu=INR`;

//   try {
//     const qrCodePath = path.join(__dirname, 'upi_qr.png');
//     // console.log('Generating QR code for URL:', upiUrl);
//     await qrcode.toFile(qrCodePath, upiUrl);
//     // console.log('QR code generated at:', qrCodePath);

//     bot.sendPhoto(chatId, qrCodePath, {
//       caption: 'Scan this QR code to make a payment via UPI.',
//     });
//   } catch (err) {
//     // console.error('Error generating QR code:', err);
//     bot.sendMessage(chatId, 'Failed to generate QR code. Please try again.');
//   }
// });

// bot.on('message', (msg) => {
//   if (msg.chat.id === parseInt(ownerId)) {
//     return bot.sendMessage(msg.chat.id, 'You are the owner of this bot');
//   }
//   const words = ['bc', 'mc', 'bsdk'];
//   for (let value of words) {
//     if (msg.text.toString().toLowerCase().includes(value)) {
//       bot.sendMessage(
//         msg.chat.id,
//         'You cross your limitations you are will be banned'
//       );
//       bot.sendMessage(
//         ownerId,
//         `Used Abusive language : ${msg.from.username}, ${msg.text}`
//       );
//     }
//   }
// });
