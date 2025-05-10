const { SlashCommandBuilder, messageLink } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");

module.exports = {
    category: 'economy',
    aliases: ['bal'],
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check member balance')
        .addUserOption(option => option
            .setName('user')
            .setDescription('The user you want to check the balance of.')
            .setRequired(false)),
    async execute(moi, args, client, { type, send }) {

        const user = await Utility.getUser(moi, type, args[0]) ? await Utility.getUser(moi, type, args[0]) : moi.member.user;
        const money = await Utility.db.findOne('economy', { userid: user.id, guildid: moi.guild.id })

        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Balance.permissions)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Permission
                    })
                ]
            }, true)
        }

        const pocket = money ? money.balance > 0 ? money.balance : 0 : 0
        const bank = money ? money.bank > 0 ? money.bank : 0 : 0

        send(type, moi, {
            embeds: [
                Utility.embed({
                    ...Utility.lang.Balance.Embed,
                    variables: {
                        pocketCoins: pocket,
                        bankCoins: bank,
                        serverIcon: moi.guild.iconURL({ size: 1024 }),
                        authorIcon: user.displayAvatarURL({ size: 1024 }),
                        memberUser: `<@${user.id}>`,
                        memberUsername: user.username,
                        memberId: user.id,
                        totalCoins: pocket + bank
                    }
                })
            ]
        }, true)
    }
}