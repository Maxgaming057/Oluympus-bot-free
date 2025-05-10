const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");


module.exports = {
    category: 'giveaway',
    data: new SlashCommandBuilder()
        .setName('gdelete')
        .setDescription('Delete a giveaway')
        .addStringOption(options => options.setName('id').setDescription('Giveaway message id').setRequired(true)),
    async execute(moi, args, client, { type, send }) {

        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Gdelete.permissions)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Permission
                    })
                ]
            }, true)
        }

        if(type === 'message' && !args[0]) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                       ...Utility.lang.Usage,
                       variables: {
                        usage: `${await Utility.getPrefix(moi.guild.id)}gdelete [id]`
                       }
                    })
                ]
            }, true)
        }

        const id = type == 'interaction' ? moi.options.getString('id') : args[0]

        const gw = await Utility.db.findOne('giveaway', { id: id });
        if (!gw) {
            send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Gdelete.Unknown
                    })
                ]
            }, true)
            return;
        }

        send(type, moi, {
            embeds: [
                Utility.embed({
                    ...Utility.lang.Gdelete.Embed,
                    variables: {
                        host: `<@${gw.host}>`,
                        channel: `<#${gw.channel}>`,
                        prize: gw.prize,
                        id: id
                    }
                })
            ]
        })

        await Utility.db.delete('giveaway', { id: id, guild: moi.guild.id })
    }
}