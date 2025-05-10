const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");

module.exports = {
    category: 'general',
    aliases: ['msg'],
    data: new SlashCommandBuilder()
        .setName('messages')
        .setDescription('Message amount sent by user')
        .addUserOption(
            option => option
               .setName('user')
               .setDescription('The user you want to check')
               .setRequired(false)
        ),
    async execute(moi, args, client, { type, send }) {

        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Messages.permission)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Permission
                    })
                ]
            }, true)
        }

        let count;
        const user = await Utility.getUser(moi, type, args[0]) || moi.member.user;
        const messages = await Utility.db.findOne('messages', { userid: user.id, guildid: moi.guild.id })
        if(!messages) count = 0;
        else count = messages.amount;

        send(type, moi, {
            embeds: [
                Utility.embed({
                   ...Utility.lang.Messages.Embed,
                    variables: {
                        memberUsername: user.username,
                        memberId: user.id,
                        member: `<@${user.id}>`,
                        serverIcon: moi.guild.iconURL({ size: 1024 }),
                        memberpfp: user.displayAvatarURL({ size: 1024 }),
                        amount: count,
                        server: moi.guild.name
                    }
                })
            ]
        })
    }
}