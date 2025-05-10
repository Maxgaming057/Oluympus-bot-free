const { AttachmentBuilder } = require("discord.js");
const client = require("../../..");
const embed = require("../../../utils/modules/embed");
const { generateTranscript } = require("../../../utils/modules/transcript");
const { foundChannel, foundMember } = require("../../../utils/modules/utils");
const fs = require('fs');
const yaml = require('js-yaml')
const content = fs.readFileSync('./config/messages.yml', 'utf-8');
const data = yaml.load(content);
const log = require('../../../utils/modules/log')
const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: 'ticketRename',
    once: false,
    async execute(ticket, staff, name, guild, user) {

        const importedConfig = data.Logs.Ticketrename
        if(!ticket || !staff || !name) return;

        const channel = await foundChannel(guild, Utility.clientConfig.Logs.Ticketrename.channel);
        if(!channel) return;
        const member = await foundMember(guild, user);
        if(!member) return

        channel.send({embeds: [
            embed({
               ...importedConfig.Embed,
                variables: {
                    ticketMember: `<@${member.user.id}>`,
                    ticketMemberId: member.user.id,
                    ticketMemberUsername: member.user.username,
                    memberpfp: member.user.displayAvatarURL({ size: 1024 }),
                    serverIcon: member.guild.iconURL({ size: 1024 }),
                    ticketStaff: `<@${staff.id}>`,
                    ticketStaffId: staff.id,
                    ticketStaffUsername: staff.username,
                    staffpfp: staff.displayAvatarURL({ size: 1024 }),
                    ticket: ticket.name,
                    name: name
                }
            })
        ]}).catch(() => { })
        

    
    }
}
