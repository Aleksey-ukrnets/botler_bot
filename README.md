# Botler Survey Bot

Telegram бот-опросник для команды Botler — конструктора Telegram-магазинов.

## Функционал

Бот проводит опрос из 3 вопросов:

1. **Источники клиентов** - множественный выбор с дополнительными полями ввода для маркетплейсов и соц сетей
2. **Причина выбора Telegram** - текстовый ответ
3. **Контакты** - текстовый ответ

Все ответы автоматически сохраняются в Google Sheets таблицу.

## Установка и запуск

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd botler_test_bot
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка переменных окружения

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Настройте переменные:

- `API_BOT_KEY` - токен бота от [@BotFather](https://t.me/BotFather)
- `GOOGLE_SHEETS_ID` - ID Google Sheets таблицы
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` - email сервисного аккаунта
- `GOOGLE_PRIVATE_KEY` - приватный ключ для Google API

Подробная инструкция по настройке Google Sheets API в файле `GOOGLE_SHEETS_SETUP.md`.

### 4. Запуск в режиме разработки

```bash
npm run dev
```

### 5. Сборка для продакшена

```bash
npm run build
npm start
```

## Деплой на Vercel

### 1. Подготовка

```bash
npm i -g vercel
```

### 2. Деплой

```bash
vercel
```

### 3. Настройка переменных окружения

Добавьте в настройках проекта на Vercel:

- `API_BOT_KEY`
- `GOOGLE_SHEETS_ID`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`

### 4. Установка webhook

После деплоя установите webhook для бота:

```bash
npm run set-webhook https://your-app.vercel.app/api/webhook
```

## Структура проекта

```
├── api/
│   └── index.ts              # Основной файл бота
├── scripts/
│   └── set-webhook.js        # Скрипт установки webhook
├── .env.example              # Пример переменных окружения
├── .gitignore               # Исключения для Git
├── package.json             # Зависимости и скрипты
├── tsconfig.json            # Конфигурация TypeScript
├── vercel.json              # Конфигурация для Vercel
├── GOOGLE_SHEETS_SETUP.md   # Инструкция по настройке Google Sheets
└── README.md               # Документация
```

## Как работает бот

1. Пользователь отправляет `/start`
2. Бот показывает приветственное сообщение
3. Задает 3 вопроса последовательно
4. Сохраняет ответы в Google Sheets
5. Показывает итоговую сводку

## Технологии

- **Node.js** + **TypeScript**
- **node-telegram-bot-api** - для работы с Telegram Bot API
- **googleapis** - для работы с Google Sheets API
- **Express.js** - веб-сервер для Vercel
- **Vercel** - платформа для деплоя
