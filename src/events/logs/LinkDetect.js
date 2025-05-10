const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: 'linkDetect',
    once: false,
    async execute(member, links) {

        const channel = Utility.findChannel(member.guild, Utility.clientConfig.Logs.AntiLink.channel);
        if(Utility.clientConfig.Logs.AntiLink.enabled == false) return;
        if(!channel) return;
        
        channel.send({embeds: [
            Utility.embed({
                ...Utility.lang.Logs.Antilink.Embed,
                variables: {
                    member: `<@${member.user.id}>`,
                    memberpfp: member.user.displayAvatarURL({ size: 1024 }),
                    serverIcon: member.guild.iconURL({ size: 1024 }),
                    memberUser: member.user.username,
                    memberId: member.user.id,
                    links: links.map(c => `${c}`).join(' , ')
                }
            })
        ]}).catch((e) = { })
    }
}