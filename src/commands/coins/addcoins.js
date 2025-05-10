const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");

module.exports = {
    category: 'economy',
    aliases: ['givecoins'],
    data: new SlashCommandBuilder()
        .setName('addcoins')
        .setDescription('Add coins to a user')
        .addUserOption(option => option
            .setName('user')
            .setDescription('The user you want to add coins to!')
            .setRequired(true)
        )
        .addIntegerOption(options => options
            .setName('amount')
            .setDescription('The amount of coins to add')
            .setRequired(true)
            .setMaxValue(1)
            .setMaxValue(9999999999)
        ),
    async execute(moi, args, client, { type, send }) {

        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Addcoins.permissions)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Permission
                    })
                ]
            }, true)
        }

        const user = await Utility.getUser(moi, type, args[0])
        const amount = type == 'message' ? args[1] : moi.options.getInteger('amount');

        if (!user || !amount || isNaN(amount)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Usage,
                        variables: {
                            usage: `${await Utility.getPrefix(moi.guild.id)}addcoins [user] [amount]`
                        }
                    })
                ]
            }, true)
        }

        if(amount < 1 || amount > 9999999999) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Error,
                        variables: {
                            error: Utility.lang.Addcoins.ErrorAmount
                        }
                    })
                ]
            }, true)
        }

        const hasCoins = await Utility.db.findOne('economy', { userid: user.id, guildid: moi.guild.id })

        if (!hasCoins) {
            send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Addcoins.Embed,
                        variables: {
                            memberUser: `<@${user.id}>`,
                            memberUsername: user.username,
                            memberAvatar: user.displayAvatarURL({ size: 1024 }),
                            memberId: user.id,
                            serverIcon: moi.guild.iconURL({ size: 1024 }),
                            coins: Math.ceil(amount),
                            staffUser: `<@${moi.member.user.id}>`,
                            staffUsername: moi.member.user.username,
                            staffAvatar: moi.member.user.displayAvatarURL({ size: 1024 }),
                            staffId: moi.member.user.id,
                        }
                    })
                ]
            }, true)

            await Utility.db.insert('economy', {
                userid: user.id,
                guildid: moi.guild.id,
                balanca: 0,
                bank: Math.ceil(amount)
            })
            return;
        } else {
            const bankCoins = hasCoins.bank + Math.ceil(amount);
            await Utility.db.update('economy', { bank: bankCoins }, { userid: user.id, guildid: moi.guild.id })
            send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Addcoins.Embed,
                        variables: {
                            memberUser: `<@${user.id}>`,
                            memberUsername: user.username,
                            memberAvatar: user.displayAvatarURL({ size: 1024 }),
                            memberId: user.id,
                            serverIcon: moi.guild.iconURL({ size: 1024 }),
                            coins: Math.ceil(amount),
                            staffUser: `<@${moi.member.user.id}>`,
                            staffUsername: moi.member.user.username,
                            staffAvatar: moi.member.user.displayAvatarURL({ size: 1024 }),
                            staffId: moi.member.user.id,
                        }
                    })
                ]
            }, true)
        }


    }

}
