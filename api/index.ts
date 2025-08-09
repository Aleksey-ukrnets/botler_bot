import express from "express";
import TelegramBot from "node-telegram-bot-api";
import process from "process";
import { google } from "googleapis";

const app = express();
const bot_key = process.env.API_BOT_KEY;

if (!bot_key) {
  throw new Error("API_BOT_KEY environment variable is required");
}

const bot = new TelegramBot(bot_key, { polling: true });

// Хранилище данных пользователей (в продакшене лучше использовать базу данных)
interface UserData {
  step: number;
  sources: string[];
  marketplaces?: string;
  socialNetworks?: string;
  telegramReason?: string;
  contacts?: string;
}

const userData: { [key: number]: UserData } = {};

// Приветственное сообщение
const welcomeMessage = `👋 Привет! Я помощник команды Botler — конструктора Telegram-магазинов.

Сейчас мы ищем активных продавцов в Telegram, чтобы провести короткое интервью (15–20 минут) и понять, как сделать наш продукт ещё удобнее.

Интервью пройдёт по телефону или в Zoom, в удобное для вас время.
В знак благодарности — запишем вас в группу альфа-тестирования с бесплатным доступом ко всем функциям платформы на 3 года! 😊

Давайте начнём с пары вопросов, чтобы понять, будет ли вам интересно 💬`;

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  // Инициализируем данные пользователя
  userData[chatId] = {
    step: 0,
    sources: [],
  };

  bot.sendMessage(chatId, welcomeMessage).then(() => {
    // Переходим к первому вопросу
    askFirstQuestion(chatId);
  });
});

// Первый вопрос - источники клиентов
function askFirstQuestion(chatId: number) {
  userData[chatId].step = 1;

  const keyboard = {
    inline_keyboard: [
      [{ text: "▫️ Telegram", callback_data: "source_telegram" }],
      [{ text: "▫️ Сайт", callback_data: "source_website" }],
      [{ text: "▫️ Маркетплейсы", callback_data: "source_marketplaces" }],
      [{ text: "▫️ Соц сети", callback_data: "source_social" }],
      [
        {
          text: "▫️ Еще не продаю, но планирую начать",
          callback_data: "source_planning",
        },
      ],
      [
        {
          text: "▫️ Не планирую продавать онлайн",
          callback_data: "source_no_plans",
        },
      ],
      [{ text: "✅ Готово", callback_data: "sources_done" }],
    ],
  };

  bot.sendMessage(
    chatId,
    "1. Укажите ваши источники клиентов (можно выбрать несколько):",
    {
      reply_markup: keyboard,
    }
  );
}

// Второй вопрос
function askSecondQuestion(chatId: number) {
  userData[chatId].step = 2;

  bot.sendMessage(
    chatId,
    "2. Как вы пришли к тому, чтобы начать продажи в Telegram? 🤔\n\nНапишите ваш ответ:"
  );
}

// Третий вопрос
function askThirdQuestion(chatId: number) {
  userData[chatId].step = 3;

  bot.sendMessage(
    chatId,
    "3. Укажите ваши контакты для связи (почта, телеграм, соц сеть, телефон) 📞\n\nНапишите ваши контакты:"
  );
}

// Обработчик callback кнопок
bot.on("callback_query", (callbackQuery) => {
  const msg = callbackQuery.message;
  const chatId = msg?.chat.id;
  const data = callbackQuery.data;

  if (!chatId || !userData[chatId]) return;

  const user = userData[chatId];

  if (user.step === 1) {
    // Обработка выбора источников клиентов
    if (data === "sources_done") {
      if (user.sources.length === 0) {
        bot.answerCallbackQuery(callbackQuery.id, {
          text: "Выберите хотя бы один источник клиентов",
          show_alert: true,
        });
        return;
      }

      // Проверяем, нужно ли запросить дополнительную информацию
      if (user.sources.includes("Маркетплейсы") && !user.marketplaces) {
        bot.sendMessage(chatId, "Укажите, какие маркетплейсы вы используете:");
        user.step = 1.1; // Промежуточный шаг
        return;
      }

      if (user.sources.includes("Соц сети") && !user.socialNetworks) {
        bot.sendMessage(
          chatId,
          "Укажите, какие социальные сети вы используете:"
        );
        user.step = 1.2; // Промежуточный шаг
        return;
      }

      // Переходим ко второму вопросу
      askSecondQuestion(chatId);
    } else {
      // Добавляем/убираем источник
      const sourceMap: { [key: string]: string } = {
        source_telegram: "Telegram",
        source_website: "Сайт",
        source_marketplaces: "Маркетплейсы",
        source_social: "Соц сети",
        source_planning: "Еще не продаю, но планирую начать",
        source_no_plans: "Не планирую продавать онлайн",
      };

      const sourceName = sourceMap[data || ""];
      if (sourceName) {
        const index = user.sources.indexOf(sourceName);
        if (index > -1) {
          user.sources.splice(index, 1);
        } else {
          user.sources.push(sourceName);
        }

        // Обновляем клавиатуру с отметками
        updateSourcesKeyboard(chatId, user.sources);
      }
    }
  }

  bot.answerCallbackQuery(callbackQuery.id);
});

// Функция обновления клавиатуры с отметками
function updateSourcesKeyboard(chatId: number, selectedSources: string[]) {
  const keyboard = {
    inline_keyboard: [
      [
        {
          text: selectedSources.includes("Telegram")
            ? "✅ Telegram"
            : "▫️ Telegram",
          callback_data: "source_telegram",
        },
      ],
      [
        {
          text: selectedSources.includes("Сайт") ? "✅ Сайт" : "▫️ Сайт",
          callback_data: "source_website",
        },
      ],
      [
        {
          text: selectedSources.includes("Маркетплейсы")
            ? "✅ Маркетплейсы"
            : "▫️ Маркетплейсы",
          callback_data: "source_marketplaces",
        },
      ],
      [
        {
          text: selectedSources.includes("Соц сети")
            ? "✅ Соц сети"
            : "▫️ Соц сети",
          callback_data: "source_social",
        },
      ],
      [
        {
          text: selectedSources.includes("Еще не продаю, но планирую начать")
            ? "✅ Еще не продаю, но планирую начать"
            : "▫️ Еще не продаю, но планирую начать",
          callback_data: "source_planning",
        },
      ],
      [
        {
          text: selectedSources.includes("Не планирую продавать онлайн")
            ? "✅ Не планирую продавать онлайн"
            : "▫️ Не планирую продавать онлайн",
          callback_data: "source_no_plans",
        },
      ],
      [{ text: "✅ Готово", callback_data: "sources_done" }],
    ],
  };

  bot
    .editMessageReplyMarkup(keyboard, {
      chat_id: chatId,
      message_id: userData[chatId].step === 1 ? undefined : undefined,
    })
    .catch(() => {
      // Если не удалось отредактировать, отправляем новое сообщение
      bot.sendMessage(
        chatId,
        "1. Укажите ваши источники клиентов (можно выбрать несколько):",
        {
          reply_markup: keyboard,
        }
      );
    });
}

// Обработчик текстовых сообщений
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text.startsWith("/")) return;
  if (!userData[chatId]) return;

  const user = userData[chatId];

  // Обработка дополнительной информации о маркетплейсах
  if (user.step === 1.1) {
    user.marketplaces = text;

    // Проверяем, нужно ли запросить информацию о соц сетях
    if (user.sources.includes("Соц сети") && !user.socialNetworks) {
      bot.sendMessage(chatId, "Укажите, какие социальные сети вы используете:");
      user.step = 1.2;
    } else {
      // Переходим ко второму вопросу
      askSecondQuestion(chatId);
    }
    return;
  }

  // Обработка дополнительной информации о соц сетях
  if (user.step === 1.2) {
    user.socialNetworks = text;
    // Переходим ко второму вопросу
    askSecondQuestion(chatId);
    return;
  }

  // Обработка ответа на второй вопрос
  if (user.step === 2) {
    user.telegramReason = text;
    askThirdQuestion(chatId);
    return;
  }

  // Обработка ответа на третий вопрос (контакты)
  if (user.step === 3) {
    user.contacts = text;
    finishSurvey(chatId);
    return;
  }
});

// Настройка Google Sheets API
const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(
  /\\n/g,
  "\n"
);

// Функция инициализации Google Sheets API
async function initGoogleSheets() {
  if (
    !GOOGLE_SHEETS_ID ||
    !GOOGLE_SERVICE_ACCOUNT_EMAIL ||
    !GOOGLE_PRIVATE_KEY
  ) {
    throw new Error("Не настроены переменные окружения для Google Sheets API");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: GOOGLE_PRIVATE_KEY,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  return sheets;
}

// Функция сохранения данных в Google Sheets
async function saveToGoogleSheets(chatId: number, user: UserData) {
  try {
    const sheets = await initGoogleSheets();

    // Подготавливаем данные для записи
    const rowData = [
      new Date().toLocaleString("ru-RU"),
      chatId.toString(),
      user.sources.join(", "),
      user.marketplaces || "",
      user.socialNetworks || "",
      user.telegramReason || "",
      user.contacts || "",
    ];

    // Проверяем, есть ли заголовки в таблице
    const headerCheck = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: "A1:G1",
    });

    // Если заголовков нет, добавляем их
    if (!headerCheck.data.values || headerCheck.data.values.length === 0) {
      const headers = [
        "Дата и время",
        "ID пользователя",
        "Источники клиентов",
        "Маркетплейсы",
        "Социальные сети",
        "Как пришли к Telegram",
        "Контакты",
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId: GOOGLE_SHEETS_ID,
        range: "A1",
        valueInputOption: "RAW",
        requestBody: {
          values: [headers],
        },
      });
    }

    // Добавляем данные пользователя
    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: "A:G",
      valueInputOption: "RAW",
      requestBody: {
        values: [rowData],
      },
    });

    console.log(
      `✅ Данные сохранены в Google Sheets: https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_ID}`
    );
  } catch (error) {
    console.error("❌ Ошибка при сохранении в Google Sheets:", error);
    throw error;
  }
}

// Завершение опроса
async function finishSurvey(chatId: number) {
  const user = userData[chatId];

  // Сохраняем данные в Google Sheets
  try {
    await saveToGoogleSheets(chatId, user);
  } catch (error) {
    console.error("❌ Ошибка при сохранении в Google Sheets:", error);
  }

  // Формируем итоговое сообщение с результатами
  let summary = "🎉 Спасибо за участие в опросе!\n\n";
  summary += "📋 Ваши ответы:\n\n";
  summary += `1️⃣ Источники клиентов: ${user.sources.join(", ")}\n`;

  if (user.marketplaces) {
    summary += `   📦 Маркетплейсы: ${user.marketplaces}\n`;
  }

  if (user.socialNetworks) {
    summary += `   📱 Соц сети: ${user.socialNetworks}\n`;
  }

  summary += `\n2️⃣ Как пришли к Telegram: ${user.telegramReason}\n\n`;
  summary += `3️⃣ Контакты: ${user.contacts}\n\n`;
  summary +=
    "✅ Мы свяжемся с вами в ближайшее время для проведения интервью!\n\n";
  summary +=
    "🎁 Не забудьте - вас ждёт бесплатный доступ к платформе на 3 года!";

  bot.sendMessage(chatId, summary);

  // Логируем результаты
  console.log("📊 Survey completed for user:", chatId);
  console.log("📄 Results:", JSON.stringify(user, null, 2));

  // Очищаем данные пользователя
  delete userData[chatId];
}

// Express routes для Vercel
app.get("/", (_req, res) => res.send("Botler Survey Bot is running!"));

app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;
