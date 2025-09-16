import TelegramBot from 'node-telegram-bot-api';

class TelegramDB {
  constructor(token, chatId) {
    this.bot = new TelegramBot(token);
    this.chatId = chatId;
    this.storage = {};
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    try {
      console.log('Restoring data from Telegram...');
      const updates = await this.bot.getUpdates({ limit: 100 });
      
      updates.forEach(update => {
        if (update.message?.text?.startsWith('#')) {
          const text = update.message.text;
          const collection = text.split('\n')[0].substring(1);
          const jsonStr = text.substring(text.indexOf('\n') + 1);
          
          try {
            const data = JSON.parse(jsonStr);
            if (!this.storage[collection]) {
              this.storage[collection] = [];
            }
            this.storage[collection].push(data);
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

  async save(collection, data) {
    await this.init();
    
    if (!this.storage[collection]) {
      this.storage[collection] = [];
    }
    this.storage[collection].push(data);
    
    try {
      const message = `#${collection}\n${JSON.stringify(data, null, 2)}`;
      await this.bot.sendMessage(this.chatId, message);
    } catch (error) {
      console.error('Telegram send error:', error);
    }
    
    return data.id;
  }

  async getAll(collection) {
    await this.init();
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