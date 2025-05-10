const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");

module.exports = {
    category: 'mod',
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clear messages from a channel')
        .addIntegerOption(option => option.setName('amount').setDescription('The of messages to clear').setRequired(true).setMinValue(1).setMaxValue(100)),
    async execute(moi, args, client, { type, send }) {

        const amount = type == 'message' ? args[0] : moi.options.getInteger('amount')
        const channel = moi.channel;


        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Clear.permissions)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Permission
                    })
                ]
            }, true)
        }

        if (!amount || isNaN(amount)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Usage,
                        variables: {
                            usage: `${await Utility.getPrefix(moi.guild.id)}clear [amount]`
                        }
                    })
                ], ephemeral: true
            }, true)
        }

        try {
            const messages = await channel.messages.fetch({ limit: amount });
            await channel.bulkDelete(messages).then(async (msg) => {
                await send(type, moi, {
                    embeds: [
                        Utility.embed({
                            ...Utility.lang.Clear.Embed,
                            variables: {
                                amount: msg.size,
                                channel: `<#${channel.id}>`,
                                channelName: channel.name,
                                channelId: channel.id
                            }
                        })
                    ], ephemeral: true
                }, true).then((msg) => {
                    setTimeout(() => {
                        msg.delete().catch(() => { })
                    }, 5000);
                })
            })
        } catch (error) {
            if(type === 'message') moi.delete().catch(() => { })
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Error,
                        variables: {
                            error: error.message,
                            channel: `<#${channel.id}>`,
                            channelName: channel.name,
                            channelId: channel.id
                        }
                    })
                ]
            }, true).then((msg) => {
                setTimeout(() => {
                    msg.delete().catch(() => { })
                }, 5000);
            })
        }
    }
}