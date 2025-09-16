import TelegramBot from 'node-telegram-bot-api';

class TelegramDB {
  constructor(token, chatId) {
    this.bot = new TelegramBot(token);
    this.chatId = chatId;
    this.storage = {}; // Временное хранение в памяти
  }

  async save(collection, data) {
    // Сохраняем в памяти
    if (!this.storage[collection]) {
      this.storage[collection] = [];
    }
    this.storage[collection].push(data);
    
    // Отправляем в Telegram для бэкапа
    try {
      const message = `#${collection}\n${JSON.stringify(data, null, 2)}`;
      await this.bot.sendMessage(this.chatId, message);
    } catch (error) {
      console.error('Telegram send error:', error);
    }
    
    return data.id;
  }

  async getAll(collection) {
    // Возвращаем данные из памяти
    const data = this.storage[collection] || [];
    console.log(`Getting ${collection}: ${data.length} items`);
    return data;
  }

  async update(collection, id, data) {
    await this.save(collection, { ...data, id, _updated: new Date().toISOString() });
    return true;
  }

  async delete(collection, id) {
    await this.save(`${collection}_deleted`, { id, _deleted: new Date().toISOString() });
    return true;
  }
}

export default TelegramDB;