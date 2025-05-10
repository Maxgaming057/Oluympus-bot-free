const { Events } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: Events.GuildMemberRemove,
    once: false,
    async execute(member) {

        if(Utility.clientConfig.Leave.enabled == false) return;
        const channel = await Utility.findChannel(member.guild, Utility.clientConfig.Leave.channel);
        if(!channel) return;

        const { type } = Utility.clientConfig.Leave
        if(type === 'embed') {
            channel.send({
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Leave.embed,
                        variables: {
                            member: `<@${member.user.id}>`,
                            memberId: member.user.id,
                            memberUsername: member.user.username,
                            server: member.guild.name,
                            memberpfp: member.user.displayAvatarURL({ size: 1024 }),
                            accountCreated: Utility.formatTime('dmyhms', member.user.createdAt),
                            serverpfp: member.guild.iconURL({ size: 1024 })
                        }
                    })
                ]
            }).catch(() => { })
        }

        if(type == 'text') {
            channel.send({
                content: Utility.lang.Leave.text
                .replace(/{member}/g, `<@${member.user.id}>`)
                .replace(/{memberId}/g, member.user.id)
                .replace(/{memberUsername}/g, member.user.username)
                .replace(/{server}/g, member.guild.name)
                .replace(/{accountCreated}/g, Utility.formatTime('dmyhms', member.user.createdAt))
            })
        }
    }
}