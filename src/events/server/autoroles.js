const { SlashCommandBuilder } = require("discord.js");
const embed = require("../../../utils/modules/embed");
const fs = require('fs');
const yaml = require('js-yaml')
const content = fs.readFileSync('./config/messages.yml', 'utf-8');
const data = yaml.load(content);
const { hasPerms, foundChannel, foundRole } = require('../../../utils/modules/utils')
const ms = require("ms");
const Database = require('../../../utils/database/OlympusDatabase');
const Utility = require("../../../utils/modules/Utility");
const { error } = require("console");
const db = new Database()

module.exports = {
    name: 'guildMemberAdd',
    once: false,
    async execute(member, client) {
        const importedConfig = Utility.clientConfig.JoinRoles
        if (importedConfig.enabled === false) return;

        if (Array.isArray(importedConfig.roles) || importedConfig.roles.length > 0) {
            for (const rr of importedConfig.roles) {
                const role = await foundRole(member.guild, rr);
                if (!role) return;
                member.roles.add(role).catch((error) => {
                    Utility.log('error', error.message)
                })
            }
        }

    }
}