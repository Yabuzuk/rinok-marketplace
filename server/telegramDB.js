import TelegramBot from 'node-telegram-bot-api';

class TelegramDB {
  constructor(token, chatId) {
    this.bot = new TelegramBot(token);
    this.chatId = chatId;
  }

  async save(collection, data) {
    const message = `#${collection}\n${JSON.stringify(data, null, 2)}`;
    const result = await this.bot.sendMessage(this.chatId, message);
    return result.message_id;
  }

  async getAll(collection) {
    try {
      const updates = await this.bot.getUpdates({ limit: 100, offset: -100 });
      console.log(`Found ${updates.length} updates for ${collection}`);
      const messages = updates
        .filter(update => update.message?.text?.startsWith(`#${collection}`))
        .map(update => {
          const text = update.message.text;
          const jsonStr = text.substring(text.indexOf('\n') + 1);
          try {
            return JSON.parse(jsonStr);
          } catch {
            return null;
          }
        })
        .filter(Boolean);
      
      console.log(`Parsed ${messages.length} ${collection} items`);
      return messages;
    } catch (error) {
      console.error('Error getting data:', error);
      return [];
    }
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