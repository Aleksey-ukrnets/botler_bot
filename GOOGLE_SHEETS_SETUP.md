# Настройка Google Sheets API

## 📋 Пошаговая инструкция

### 1. Создание Google Sheets документа

1. Откройте [Google Sheets](https://sheets.google.com)
2. Создайте новую таблицу
3. Назовите её "Botler Survey Results" или любым другим именем
4. Скопируйте ID таблицы из URL:
   ```
   https://docs.google.com/spreadsheets/d/SHEET_ID/edit
   ```
   Где `SHEET_ID` - это и есть нужный нам ID

### 2. Настройка Google Cloud Console

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите Google Sheets API:
   - Перейдите в "APIs & Services" → "Library"
   - Найдите "Google Sheets API"
   - Нажмите "Enable"

### 3. Создание Service Account

1. В Google Cloud Console перейдите в "APIs & Services" → "Credentials"
2. Нажмите "Create Credentials" → "Service Account"
3. Заполните данные:
   - **Service account name**: `botler-survey-bot`
   - **Service account ID**: автоматически заполнится
   - **Description**: `Service account for Botler survey bot`
4. Нажмите "Create and Continue"
5. Пропустите шаги с ролями (нажмите "Continue" и "Done")

### 4. Создание ключа для Service Account

1. В списке Service Accounts найдите созданный аккаунт
2. Нажмите на него
3. Перейдите на вкладку "Keys"
4. Нажмите "Add Key" → "Create new key"
5. Выберите формат "JSON"
6. Скачайте файл - в нём будут все нужные данные

### 5. Предоставление доступа к таблице

1. Откройте скачанный JSON файл
2. Найдите поле `client_email` - скопируйте email
3. Откройте вашу Google Sheets таблицу
4. Нажмите "Share" (Поделиться)
5. Добавьте скопированный email с правами "Editor"
6. Снимите галочку "Notify people" и нажмите "Share"

### 6. Настройка переменных окружения

Из скачанного JSON файла возьмите:

```bash
# ID вашей Google Sheets таблицы
GOOGLE_SHEETS_ID=1ABC123def456GHI789jkl

# Email из поля "client_email" в JSON
GOOGLE_SERVICE_ACCOUNT_EMAIL=botler-survey-bot@your-project.iam.gserviceaccount.com

# Приватный ключ из поля "private_key" в JSON (весь текст с \n)
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

### 7. Проверка настройки

После настройки всех переменных окружения запустите бота и пройдите опрос. 
Данные должны автоматически появиться в вашей Google Sheets таблице.

## 🔗 Полезные ссылки

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Service Accounts Guide](https://cloud.google.com/iam/docs/service-accounts)
