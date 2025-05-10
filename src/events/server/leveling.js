const yaml = require('js-yaml');
const fs = require('fs');
const Database = require('../../../utils/database/OlympusDatabase');
const db = new Database();
const ms = require('ms');
const embed = require("../../../utils/modules/embed");
const Utility = require('../../../utils/modules/Utility');

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message, client) {
        if (message.author.bot) return;
        if (!message.guild) return;

        const fileContents = fs.readFileSync('./config/messages.yml', 'utf8');
        const data = yaml.load(fileContents);
        const LevelData = data.Level;
        const LevelConfig = Utility.clientConfig.Level

        if (LevelConfig && LevelConfig.enabled === true) {
            const hasLevel = await db.findOne('level', { id: message.author.id, guild: message.guild.id });
            
            if (!hasLevel) {
                return db.insert('level', { id: message.author.id, guild: message.guild.id, level: 0, xp: 0, currentXp: 0 });
            }

            const requireXp = hasLevel.level * 150 + (hasLevel.level * 15);
            const xpToAdd = Math.floor(Math.random() * 10) + 1;

            if (hasLevel.currentXp + xpToAdd >= requireXp) {
                const newLevel = hasLevel.level + 1;
                const newXp = (hasLevel.currentXp + xpToAdd) + requireXp;
                
                await db.update('level', { level: newLevel, xp: requireXp + xpToAdd, currentXp: 0 } , { id: message.author.id, guild: message.guild.id });
                
                const channel = await message.guild.channels.cache.find((c) => c.name === LevelConfig.channel) || message.guild.channels.cache.find((c) => c.id === LevelConfig.channel) || (LevelConfig.channel === 'ThisChannel' ? message.channel : null);
        
                if (!channel) return;

                channel.send({
                    content: `${LevelData.mentionUser === true ? `<@${message.author.id}>` : ''}`,
                    embeds: [
                        embed({
                            ...LevelData.embed,
                            variables: {
                                member: `<@${message.author.id}>`,
                                memberUsername: message.author.username,
                                memberId: message.author.id,
                                level: newLevel,
                                xp: hasLevel.currentXp,
                                requireXp: requireXp,
                                currentXp: newXp,
                            }
                        })
                    ]
                }).then((msg) => {
                    if (LevelConfig.deleteLevelUpMessage !== false) {
                        setTimeout(() => {
                            msg.delete().catch(() => { });
                        }, ms(LevelConfig.deleteLevelUpMessage));
                    }
                });

                const reward = LevelConfig.rewards[newLevel];
                if (reward) {
                    let role = message.guild.roles.cache.find((r) => r.name === reward) || message.guild.roles.cache.find((r) => r.id === reward);
                    if (role) {
                        await message.member.roles.add(role).catch(() => { });
                    } else {
                        role = await message.guild.roles.create({
                            name: reward,
                            mentionable: false,
                            hoist: true
                        });

                        await message.member.roles.add(role).catch(() => { });
                    }
                }
            } else {
                await db.update('level', { currentXp: hasLevel.currentXp + xpToAdd }, { id: message.author.id, guild: message.guild.id });
            }
        }
    }
};
