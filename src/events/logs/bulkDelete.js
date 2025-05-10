const { Events } = require("discord.js");
const embed = require("../../../utils/modules/embed");
const fs = require('fs');
const yaml = require('js-yaml');
const content = fs.readFileSync('./config/messages.yml', 'utf-8');
const data = yaml.load(content);
const { foundChannel } = require('../../../utils/modules/utils');
const Database = require('../../../utils/database/OlympusDatabase');
const Utility = require("../../../utils/modules/Utility");
const db = new Database();

module.exports = {
    name: Events.MessageBulkDelete,
    once: false,
    async execute(messages) {
        if (!messages.first()?.guild) return;
        const importedConfig = data.Logs.MessageBulkDelete;
        const channel = foundChannel(messages.first().guild, Utility.clientConfig.Logs.MessageBulkDelete.channel);
        if (!channel) return;

        const removed = [];
        const userMessageCount = {};

        messages.forEach(msg => {
            const userId = msg.author.id;
            removed.push({
                id: msg.id,
                author: userId,
                content: msg?.content ? msg.content : 'None',
                date: msg.createdAt.toLocaleString()
            });

            if (!userMessageCount[userId]) {
                userMessageCount[userId] = 0;
            }
            userMessageCount[userId]++;
        });

        const userMessageCountText = Object.entries(userMessageCount)
            .map(([userId, count]) => `<@${userId}> \`(${userId})\`: ${count == 1 ? count + ' ' + Utility.clientConfig.Logs.MessageBulkDelete.singular : count + ' ' + Utility.clientConfig.Logs.MessageBulkDelete.plural} `)
            .join('\n');

        channel.send({
            embeds: [
                embed({
                    ...importedConfig.Embed,
                    variables: {
                        totalMessages: messages.size,
                        channel: `<#${messages.first().channel.id}>`,
                        deleted: userMessageCountText,
                    }
                })
            ]
        }).catch(e => console.error('Error sending message bulk delete log:'));
    }
}
