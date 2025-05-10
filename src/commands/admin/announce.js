const { SlashCommandBuilder, ChannelType } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");
const config = Utility.lang.Announcement;
module.exports = {
    category: 'admin',
    aliases: ['ann', 'announce'],
    data: new SlashCommandBuilder()
        .setName('announcement')
        .setDescription('Announce a message in a channel')
        .addChannelOption(option => option.setName('channel').setDescription('The channel to announce in').setRequired(true).addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)),
    async execute(moi, args, client, { type, send }) {

        let channel;
        if (type === 'interaction') channel = moi.options.getChannel('channel')
        if (type === 'message') channel = moi.mentions?.channels.first() || Utility.findChannel(moi.guild, args[0]) || moi.channel
        
        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Announcement.permissions)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                       ...Utility.lang.Permission
                    })
                ]
            }, true)
        }

        let i = 0;
        const message = await send(type, moi, {
            embeds: [
                Utility.embed({
                    ...config.QuestionEmbed,
                    variables: {
                        questionNumber: i + 1,
                        askQuestion: config.questions[i]
                    }
                })
            ]
        }, true)

        const answers = []

        const collector = await moi.channel.createMessageCollector({ time: 180000 })
        collector.on('collect', async (msg) => {
            if (type === 'message' ? msg.author.id != moi.author.id : msg.author.id !== moi.user.id) return;
            if (i >= config.questions.length - 1) { 
                answers.push(msg.content)
                msg.delete().catch((error) => { log('error', error.message) })
                await channel.send({content: Utility.clientConfig.Announcement.mentioneveryone ? '@everyone' : '',
                    embeds: [
                        Utility.embed({
                           ...config.Embed,
                            variables: {
                                title: answers[0],
                                description: answers[1],
                                serverIcon: msg.guild.iconURL({size: 1024 })
                            }
                        })
                    ]
                }).catch((error) => { log('error', error.message) })

                await message.edit({
                    embeds: [
                        Utility.embed({
                            ...config.Sent,
                        })
                    ]
                }).catch((error) => { log('error', error.message) })

                collector.stop();
                return;
            } else {
                answers.push(msg.content);
                msg.delete().catch((error) => { log('error', error.message) })
                i++;
                await message.edit({
                    embeds: [
                        Utility.embed({
                            ...config.QuestionEmbed,
                            variables: {
                                questionNumber: i + 1,
                                askQuestion: config.questions[i]
                            }
                        })
                    ]
                });
            }
        });
    }
    
}