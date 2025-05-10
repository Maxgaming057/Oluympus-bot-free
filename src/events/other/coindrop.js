const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ComponentType } = require("discord.js");
const embed = require("../../../utils/modules/embed");
const fs = require('fs');
const yaml = require('js-yaml')
const content = fs.readFileSync('./config/messages.yml', 'utf-8');
const data = yaml.load(content);
const { hasPerms, foundRole } = require('../../../utils/modules/utils')
const log = require("../../../utils/modules/log")
const ms = require("ms");
const Database = require('../../../utils/database/OlympusDatabase');
const Utility = require("../../../utils/modules/Utility");
const db = new Database()
const messages = new Map()
const settings = data.Coindrop
const config = Utility.clientConfig.Coindrop
module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message, client) {

        if (!message.guild || message.author.bot) return;
        if (config.enabled === false) return

        messages.set(message.channel.id, (messages.get(message.channel.id) || 0) + 1);
        if (messages.get(message.channel.id) >= config.onmessages) {
            messages.delete(message.channel.id)
            const amount = Math.floor(Math.random() * config.maxamount) + 1
            const mss = await message.channel.send({
                embeds: [
                    embed({
                        ...settings.Embed,
                        variables: {
                            memberIcon: message.author.displayAvatarURL({ size: 1024 }),
                            memberUsername: message.author.username,
                            memberId: message.author.id,
                            serverIcon: message.guild.iconURL({ size: 1024 }),
                            serverName: message.guild.name,
                            serverId: message.guild.id,
                            memberUser: `<@${message.author.id}>`,
                            amount: amount
                        }
                    })
                ], components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('coindropclaim')
                            .setLabel(settings.Button.label)
                            .setStyle(settings.Button.style)
                            .setEmoji(settings.Button.emoji)
                    )
                ]
            }).catch((e) => { })

            const collector = await message.channel.createMessageComponentCollector({ ComponentType: ComponentType.Button, time: 5000 })

            collector.on('collect', async (i) => {
                if (i.customId === 'coindropclaim') {
                    i.update({
                        embeds: [
                            embed({
                                ...settings.Claimed,
                                variables: {
                                    memberIcon: i.user.displayAvatarURL({ size: 1024 }),
                                    memberUsername: i.user.username,
                                    memberId: i.user.id,
                                    serverIcon: i.guild.iconURL({ size: 1024 }),
                                    serverName: i.guild.name,
                                    serverId: i.guild.id,
                                    memberUser: `<@${i.user.id}>`,
                                    amount: amount,
                                }
                            })
                        ], components: []
                    }).catch((e) => { })
                    await collector.stop()
                    messages.delete(message.channel.id)
                    const money = await db.findOne('economy', { userid: i.user.id, guildid: i.guild.id })

                    if (!money) {
                        await db.insert('economy', { userid: i.user.id, guildid: i.guild.id, balance: 0, bank: amount })
                    } else {
                        const bank = money.bank + amount;
                        await db.update('economy', { bank: bank }, { userid: i.user.id, guildid: i.guild.id })
                    }

                }
            })

            collector.on('end', (collected) => {
                if(collected.size === 0) {
                    messages.delete(message.channel.id)
                    mss.edit({embeds: [embed({...settings.Timeout})], components: [] })
                    return
                } else {
                    messages.delete(message.channel.id)
                }
                
            })
        }
    }
}
setInterval(() => {
    if (config.logaction) {
        messages.delete()
        log('info', `[ Coin Drop ] Reseted system on timeout success.`)
    } else {
        messages.delete()
    }
}, 600000); // Reset every 10m