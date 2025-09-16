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
      // Получаем все обновления без ограничений
      const updates = await this.bot.getUpdates({ limit: 100 });
      console.log(`Total updates: ${updates.length}`);
      
      const messages = updates
        .filter(update => {
          const hasMessage = update.message?.text;
          const startsWithTag = hasMessage && update.message.text.startsWith(`#${collection}`);
          if (startsWithTag) {
            console.log(`Found ${collection} message:`, update.message.text.substring(0, 50));
          }
          return startsWithTag;
        })
        .map(update => {
          const text = update.message.text;
          const jsonStr = text.substring(text.indexOf('\n') + 1);
          try {
            const parsed = JSON.parse(jsonStr);
            console.log(`Parsed ${collection} item:`, parsed.id || 'no-id');
            return parsed;
          } catch (e) {
            console.error('JSON parse error:', e.message);
            return null;
          }
        })
        .filter(Boolean);
      
      console.log(`Final ${collection} count: ${messages.length}`);
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