const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");
const ms = require("ms");
module.exports = {
    category: 'economy',
    aliases: ['weklycoins'],
    data: new SlashCommandBuilder()
        .setName('weekly')
        .setDescription('Claim your weekly rewards'),
    async execute(moi, args, client, { type, send }) {

        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Weekly.permissions)) {
            return send(type, moi, {
                embeds: [
                    embed({
                        ...Utility.lang.Permission
                    })
                ]
            })
        }

        const hasCooldown = await Utility.db.findOne('weeklycooldown', { userid: moi.member.user.id });
        const hasCoins = await Utility.db.findOne('economy', { userid: moi.member.user.id, guildid: moi.guild.id });

        if (hasCooldown && hasCooldown.time - Date.now() > 0) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Cooldown,
                        variables: {
                            time: `<t:${Math.floor((hasCooldown.time) / 1000)}:R>`,
                            serverIcon: moi.guild.iconURL({ size: 1024 })
                        }
                    })
                ]
            }, true)
        }

        const cooldownTime = Date.now() + ms(Utility.lang.Cooldowns.weekly);
        const coins = hasCoins ? hasCoins.balance ? hasCoins.balance : 0 : 0
        if(!hasCooldown) await Utility.db.insert('weeklycooldown', { userid: moi.member.user.id, guildid: moi.guild.id, time: cooldownTime })
        if(hasCooldown) await Utility.db.update('weeklycooldown', { time: cooldownTime } , { userid: moi.member.user.id, guildid: moi.guild.id })

        if (hasCoins) {
            send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Weekly.Embed,
                        variables: {
                            coins: Utility.clientConfig.Coins.weekly,
                            serverIcon: moi.guild.iconURL({ size: 1024 })
                        }
                    })
                ]
            }, true)
            const newCoins = coins + Utility.clientConfig.Coins.weekly;
            await Utility.db.update('economy', { balance: newCoins }, { userid: moi.member.user.id, guildid: moi.guild.id })
            return;
        } else {
            send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Weekly.Embed,
                        variables: {
                            coins: Utility.clientConfig.Coins.weekly,
                            serverIcon: moi.guild.iconURL({ size: 1024 })
                        }
                    })
                ]
            }, true)
            await Utility.db.insert('economy', { userid: moi.member.user.id, guildid: moi.guild.id, balance: Utility.clientConfig.Coins.weekly, bank: 0 })
        }
    }
}
