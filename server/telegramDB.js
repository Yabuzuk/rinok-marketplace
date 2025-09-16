import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs';
import path from 'path';

class TelegramDB {
  constructor(token, chatId) {
    this.bot = new TelegramBot(token);
    this.chatId = chatId;
    this.storage = {};
    this.dataFile = path.join(process.cwd(), 'data.json');
    this.loadFromFile();
  }

  loadFromFile() {
    try {
      if (fs.existsSync(this.dataFile)) {
        const data = fs.readFileSync(this.dataFile, 'utf8');
        this.storage = JSON.parse(data);
        console.log('Loaded from file:', Object.keys(this.storage).map(k => `${k}: ${this.storage[k].length}`));
      }
    } catch (error) {
      console.error('Error loading from file:', error);
    }
  }

  saveToFile() {
    try {
      fs.writeFileSync(this.dataFile, JSON.stringify(this.storage, null, 2));
    } catch (error) {
      console.error('Error saving to file:', error);
    }
  }

  async init() {
    if (this.initialized) return;
    
    try {
      console.log('Restoring data from Telegram...');
      
      // Используем getChatHistory для получения старых сообщений
      const messages = await this.getChatHistory();
      
      messages.forEach(message => {
        if (message.text?.startsWith('#')) {
          const text = message.text;
          const collection = text.split('\n')[0].substring(1);
          const jsonStr = text.substring(text.indexOf('\n') + 1);
          
          try {
            const data = JSON.parse(jsonStr);
            if (!this.storage[collection]) {
              this.storage[collection] = [];
            }
            // Проверяем дубликаты по ID
            const exists = this.storage[collection].find(item => item.id === data.id);
            if (!exists) {
              this.storage[collection].push(data);
            }
          } catch (e) {
            console.error('Parse error:', e.message);
          }
        }
      });
      
      console.log('Restored:', Object.keys(this.storage).map(k => `${k}: ${this.storage[k].length}`));
      this.initialized = true;
    } catch (error) {
      console.error('Init error:', error);
      this.initialized = true;
    }
  }

  async getChatHistory() {
    try {
      // Пытаемся получить историю через разные методы
      const response = await fetch(`https://api.telegram.org/bot${this.bot.token}/getChat?chat_id=${this.chatId}`);
      
      // Если не получается через API, используем getUpdates с большим offset
      const updates = await this.bot.getUpdates({ limit: 100, offset: -1000 });
      return updates.map(u => u.message).filter(Boolean);
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }

  async save(collection, data) {
    if (!this.storage[collection]) {
      this.storage[collection] = [];
    }
    this.storage[collection].push(data);
    this.saveToFile();
    
    try {
      const message = `#${collection}\n${JSON.stringify(data, null, 2)}`;
      await this.bot.sendMessage(this.chatId, message);
    } catch (error) {
      console.error('Telegram send error:', error);
    }
    
    return data.id;
  }

  async getAll(collection) {
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