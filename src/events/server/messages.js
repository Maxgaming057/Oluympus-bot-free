const Database = require("../../../utils/database/OlympusDatabase");
const db = new Database()

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message, client) {
        if (message.author.bot) return;
        if (!message.guild) return;
        
        const hasMessages = await db.findOne('messages', {userid: message.author.id });
        if(!hasMessages) {
            await db.insert('messages', {
                userid: message.author.id,
                guildid: message.guild.id,
                amount: 1
            })
        } else {
            await db.update('messages', { amount: hasMessages.amount + 1 }, { userid: message.author.id, guildid: message.guild.id})
        }
    }
}