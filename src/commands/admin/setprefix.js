const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");

module.exports = {
    aliases: ['prefix'],
    category: 'admin',
    data: new SlashCommandBuilder()
       .setName('setprefix')
       .setDescription('Set prefix for your server!')
       .addStringOption(option => option.setName('prefix').setDescription('The new prefix').setRequired(true)),
    async execute(moi, args , client, { type , send}) {

        const prefix = type === 'interaction' ? moi.options.getString('prefix') : args[0];

        if(!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Setprefix.permissions)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                       ...Utility.lang.Permission,
                    })
                ]
            })
        }

        if(!prefix) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Usage,
                        variables: {
                            usage: `${await Utility.getPrefix(moi.guild.id)}setprefix [prefix]`
                        }
                    })
                ]
            })
        }

        const hasPrefix = await Utility.db.findOne('prefix', { guild: moi.guild.id });
        if(!hasPrefix) {
            await Utility.db.insert('prefix', {
                guild: moi.guild.id,
                prefix: prefix
            })
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                       ...Utility.lang.Setprefix.Embed,
                        variables: {
                            prefix: prefix
                        }
                    })
                ]
            })
        } else {
            await Utility.db.update('prefix', {
                prefix: prefix
            }, { guild: moi.guild.id })
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                       ...Utility.lang.Setprefix.Embed,
                        variables: {
                            prefix: prefix,
                        }
                    })
                ]
            })
        }


    }
}