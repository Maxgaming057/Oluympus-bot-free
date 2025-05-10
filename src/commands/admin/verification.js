const { SlashCommandBuilder, ChannelType } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");
const { ActionRowBuilder, ButtonBuilder } = require("@discordjs/builders");

module.exports = {
    category: 'admin',
    aliases: ['verify'],
    data: new SlashCommandBuilder()
        .setName('verification')
        .setDescription('Send a verification panel in the channel!')
        .addChannelOption(options => options.setName('channel').setDescription('Channel to send verification ?').setRequired(false).addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        ),
    async execute(moi, args, client, { type, send }) {

        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Verification.permissions)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Permission
                    })
                ]
            }, true)
        }

        let channel;
        if (type === 'interaction') {
            channel = moi.options.getChannel('channel') || moi.channel;
        } else {
            channel = moi.mentions.channels.first() ||
                (args[0] ? moi.guild.channels.cache.find(c => c.name === args[0] || c.id === args[0]) : null);
        }
        if (!channel) {
            channel = moi.channel;
        }

        const button = Utility.lang.Verification.Button;

        channel.send({
            embeds: [
                Utility.embed({
                    ...Utility.lang.Verification.VerificationPanel,
                    variables: {
                        serverIcon: moi.guild.iconURL({ size: 1024 }),
                    }
                })
            ], components: Utility.buildbuttons(button)
        }).catch((e) => {
            Utility.log('error', e)
        })

        send(type, moi, {
            embeds: [
                Utility.embed({
                    ...Utility.lang.Verification.Embed,
                    variables: {
                        serverIcon: moi.guild.iconURL({ size: 1024 }),
                        channel: `<#${channel.id}>`
                    }
                })
            ]
        })

    }
}

