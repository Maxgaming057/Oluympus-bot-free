const { AttachmentBuilder } = require("discord.js");
const client = require("../../..");
const embed = require("../../../utils/modules/embed");
const { generateTranscript } = require("../../../utils/modules/transcript");
const { foundChannel, foundMember } = require("../../../utils/modules/utils");
const fs = require('fs');
const yaml = require('js-yaml')
const content = fs.readFileSync('./config/messages.yml', 'utf-8');
const data = yaml.load(content);
const log = require('../../../utils/modules/log');
const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: 'ticketClose',
    once: false,
    async execute(ticket, staff, user, reason, guild) {

        const importedConfig = data.Logs.Ticketclosed
        if(!ticket || !staff || !user ||!reason || !guild) return;

        const channel = await foundChannel(guild, Utility.clientConfig.Logs.Ticketclosed.channel);
        if(!channel) return;

        const ch = client.channels.cache.get(ticket.id)
        const transcriptHTML = await generateTranscript(ch);
        fs.writeFileSync(`./utils/transcripts/${ticket.name}.html`, transcriptHTML)

        fs.readFile(`./utils/transcripts/${ticket.name}.html`, 'utf8', async (err, data) => {
            if (err) {
              log('error', err)
              return;
            }

          const attachment = new AttachmentBuilder(Buffer.from(data), {
              name: `${ticket.name}.html`
          })

          channel.send({embeds: [
            embed({
               ...importedConfig.Embed,
                variables: {
                    ticketMember: `<@${user.id}>`,
                    ticketMemberId: user.id,
                    ticketMemberUsername: user.username,
                    memberpfp: user.displayAvatarURL({ size: 1024 }),
                    serverIcon: guild.iconURL({ size: 1024 }),
                    ticketStaff: `<@${staff.id}>`,
                    ticketStaffId: staff.id,
                    ticketStaffUsername: staff.username,
                    staffpfp: staff.displayAvatarURL({ size: 1024 }),
                    reason: reason,
                    ticket: ticket.name
                }
            })
        ], files: [ attachment ] }).catch(() => { })

        user.send({embeds: [
            embed({
               ...importedConfig.Embed,
                variables: {
                    ticketMember: `<@${user.id}>`,
                    ticketMemberId: user.id,
                    ticketMemberUsername: user.username,
                    memberpfp: user.displayAvatarURL({ size: 1024 }),
                    servericon: guild.iconURL({ size: 1024 }),
                    ticketStaff: `<@${staff.id}>`,
                    ticketStaffId: staff.id,
                    ticketStaffUsername: staff.username,
                    staffpfp: staff.displayAvatarURL({ size: 1024 }),
                    reason: reason,
                    ticket: ticket.name
                }
            })
        ], files: [ attachment ] }).catch(() => { })
        })
    
    }
}
