const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");
const ms = require("ms");

module.exports = {
    category: 'economy',
    aliases: ['dailycoins'],
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your daily rewards'),
    async execute(moi, args, client, { type, send }) {

        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Daily.permissions)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Permission
                    })
                ]
            }, true)
        }

        const hasCooldown = await Utility.db.findOne('dailycooldown', { userid: moi.member.user.id, guildid: moi.guild.id });
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

        const cooldownTime = Date.now() + ms(Utility.lang.Cooldowns.daily);
        const coins = hasCoins ? hasCoins.balance ? hasCoins.balance : 0 : 0
        if(!hasCooldown) await Utility.db.insert('dailycooldown', { userid: moi.member.user.id, guildid: moi.guild.id, time: cooldownTime })
        if(hasCooldown) await Utility.db.update('dailycooldown', { time: cooldownTime } , { userid: moi.member.user.id, guildid: moi.guild.id })

        if (hasCoins) {
            send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Daily.Embed,
                        variables: {
                            coins: Utility.clientConfig.Coins.daily,
                            serverIcon: moi.guild.iconURL({ size: 1024 })
                        }
                    })
                ]
            }, true)
            const newCoins = coins + Utility.clientConfig.Coins.daily;
            await Utility.db.update('economy', { balance: newCoins }, { userid: moi.member.user.id, guildid: moi.guild.id })
            return;
        } else {
            send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Daily.Embed,
                        variables: {
                            coins: Utility.clientConfig.Coins.daily,
                            serverIcon: moi.guild.iconURL({ size: 1024 })
                        }
                    })
                ]
            }, true)
            await Utility.db.insert('economy', { userid: moi.member.user.id, guildid: moi.guild.id, balance: Utility.clientConfig.Coins.daily, bank: 0 })
        }
    }
}
