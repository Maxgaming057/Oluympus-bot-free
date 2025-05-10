const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");

module.exports = {
    category: 'economy',
    aliases: ['takecoins'],
    data: new SlashCommandBuilder()
        .setName('removecoins')
        .setDescription('Add coins to a user')
        .addUserOption(option => option
            .setName('user')
            .setDescription('The user you want to remove coins from!')
            .setRequired(true)
        )
        .addIntegerOption(options => options
            .setName('amount')
            .setDescription('The amount of coins to remove')
            .setRequired(true)
            .setMaxValue(1)
            .setMaxValue(9999999999)
        ),
    async execute(moi, args, client, { type, send }) {

        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Removecoins.permissions)) {
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
                            usage: `${await Utility.getPrefix(moi.guild.id)}removecoins [user] [amount]`
                        }
                    })
                ]
            }, true)
        }

        const userCoins = await Utility.db.findOne('economy', { userid: user.id, guildid: moi.guild.id });

        if (!userCoins) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Removecoins.Nocoins,
                        variables: {
                            memberUser: `<@${user.id}>`,
                            memberUsername: user.username,
                            memberAvatar: user.displayAvatarURL({ size: 1024 }),
                            memberId: user.id,
                            serverIcon: moi.guild.iconURL({ size: 1024 }),
                            coins: amount,
                            staffUser: `<@${moi.member.user.id}>`,
                            staffUsername: moi.member.user.username,
                            staffAvatar: moi.member.user.displayAvatarURL({ size: 1024 }),
                            staffId: moi.member.user.id,
                        }
                    })
                ]
            }, true)
        }

        if (userCoins.balance < amount && userCoins.bank < amount) {
            send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Removecoins.Nocoins,
                        variables: {
                            memberUser: `<@${user.id}>`,
                            memberUsername: user.username,
                            memberAvatar: user.displayAvatarURL({ size: 1024 }),
                            memberId: user.id,
                            serverIcon: moi.guild.iconURL({ size: 1024 }),
                            coins: amount,
                            staffUser: `<@${moi.member.user.id}>`,
                            staffUsername: moi.member.user.username,
                            staffAvatar: moi.member.user.displayAvatarURL({ size: 1024 }),
                            staffId: moi.member.user.id,
                        }
                    })
                ]
            }, true)
            return;
        }

        
        if (userCoins.balance >= amount) {
            const newBal = userCoins.balance - amount;
            await Utility.db.update('economy', { balance: newBal }, { userid: user.id, guildid: moi.guild.id });
        }
        
        else {
            const remainingAmount = amount - userCoins.balance; 
            const newBank = userCoins.bank - remainingAmount;
            await Utility.db.update('economy', { bank: newBank }, { userid: user.id, guildid: moi.guild.id });

            const newBal = 0;
            await Utility.db.update('economy', { balance: newBal }, { userid: user.id, guildid: moi.guild.id });
        }
        
        send(type, moi, {
            embeds: [
                Utility.embed({
                    ...Utility.lang.Removecoins.Embed,
                    variables: {
                        memberUser: `<@${user.id}>`,
                        memberUsername: user.username,
                        memberAvatar: user.displayAvatarURL({ size: 1024 }),
                        memberId: user.id,
                        serverIcon: moi.guild.iconURL({ size: 1024 }),
                        coins: amount,
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