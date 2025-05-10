const { SlashCommandBuilder } = require("discord.js");
const embed = require("../../../utils/modules/embed");
const fs = require('fs');
const yaml = require('js-yaml')
const content = fs.readFileSync('./config/messages.yml', 'utf-8');
const data = yaml.load(content);
const { hasPerms, foundChannel } = require('../../../utils/modules/utils')
const ms = require("ms");
const Database = require('../../../utils/database/OlympusDatabase')
const db = new Database()
const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: 'punishmentCreated',
    once: false,
    async execute(member, type, duration, reason, staff) {

        const importedConfig = data.Logs.Punishment
        const channel = foundChannel(member.guild, Utility.clientConfig.Logs.Punishment.channel);
        if(Utility.clientConfig.Logs.Punishment.enabled == false) return;
        if(!channel) return;

        channel.send({embeds: [
            embed({
                ...importedConfig.Embed,
                variables: {
                    member: `<@${member.user.id}>`,
                    memberpfp: member.user.displayAvatarURL({ size: 1024 }),
                    serverIcon: member.guild.iconURL({ size: 1024 }),
                    memberUser: member.user.username,
                    memberId: member.user.id,
                    duration: duration ? duration : 'Permanent',
                    type: type,
                    reason: reason,
                    staff: `<@${staff.user.id}>`,
                    staffpfp: staff.user.displayAvatarURL({ size: 1024 }),
                    staffUsername: staff.user.username,
                    staffId: staff.user.id,
                }
            })
        ]}).catch((e) = { })

       
    }
}