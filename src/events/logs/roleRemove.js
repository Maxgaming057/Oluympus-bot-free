const { SlashCommandBuilder } = require("discord.js");
const embed = require("../../../utils/modules/embed");
const fs = require('fs');
const yaml = require('js-yaml')
const content = fs.readFileSync('./config/messages.yml', 'utf-8');
const data = yaml.load(content);
const { hasPerms, foundChannel, foundRole } = require('../../../utils/modules/utils')
const ms = require("ms");
const Database = require('../../../utils/database/OlympusDatabase')
const db = new Database()
const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: 'guildMemberUpdate',
    once: false,
    async execute(oldMember, newMember) {

        const importedConfig = data.Logs.RoleRemove
        const channel = foundChannel(oldMember.guild, Utility.clientConfig.Logs.RoleRemove.channel);
        if(Utility.clientConfig.Logs.RoleRemove.enabled == false) return;


        if(oldMember.roles.cache.size > newMember.roles.cache.size) {
            const removedRole = oldMember.roles.cache.find(role => !newMember.roles.cache.has(role.id))
            channel.send({embeds: [
                embed({
                   ...importedConfig.Embed,
                    variables: {
                        member: `<@${newMember.user.id}>`,
                        memberpfp: newMember.user.displayAvatarURL({ size: 1024 }),
                        serverIcon: newMember.guild.iconURL({ size: 1024 }),
                        role: `<@&${removedRole.id}>`,
                        memberUser: newMember.user.username,
                        memberId: newMember.user.id,
                        roleId: removedRole.id,
                        roleName: removedRole.name
                    }
                })
            ]}).catch((e) = { })
        }

    }
}