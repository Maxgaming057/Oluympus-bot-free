const { SlashCommandBuilder } = require("discord.js");
const embed = require("../../../utils/modules/embed");
const fs = require('fs');
const yaml = require('js-yaml')
const content = fs.readFileSync('./config/messages.yml', 'utf-8');
const data = yaml.load(content);
const { hasPerms } = require('../../../utils/modules/utils')
const ms = require("ms");
const Database = require('../../../utils/database/OlympusDatabase')
const db = new Database()
const client = require('../../../index');
const Utility = require("../../../utils/modules/Utility");

client.on('messageCreate', async (message) => {

    if (message.author.bot) return;
    if (!message.guild) return;
    
    const importedConfig = data.Antilink;

    if (!Utility.clientConfig.Antilink.enabled) return;
    if(hasPerms(message.member, message.guild, Utility.clientConfig.Antilink.permission)) return;
    if(message.author.id == message.guild.ownerId) return;

    const links = message.content.match(/https?:\/\/[^\s]+|discord\.gg[^\s]*/gi);

    if (links) {
        const whitelistedLinks = Array.isArray(Utility.clientConfig.Antilink.whitelisted)? Utility.clientConfig.Antilink.whitelisted : [];
        let linksToBan = [];

        links.forEach(link => {
            const domain = link.replace(/^https?:\/\/(?:www\.)?/, '')
            const finalDomain = domain.split('/')[0];
            if(whitelistedLinks.includes(finalDomain)) {
                return;
            } else {
                linksToBan.push(link);
            }
        });

        if(linksToBan.length > 0) {
            client.emit('linkDetect', message.member, linksToBan);
            message.delete().catch(e => { });
            message.channel.send({
                embeds: [
                    embed({
                        ...importedConfig.Embed,
                        variables: {
                            memberUser: `<@${message.author.id}>`,
                            memberUsername: message.author.username,
                            memberId: message.author.id,
                            serverName: message.guild.name,
                            serverIcon: message.guild.iconURL({ size: 1024 }),
                            message: message.content,
                            messageLinks: linksToBan.map(c => `${c}`).join(' , ')
                        }
                    })
                ]
            }).then((msg) => {
                setTimeout(() => {
                    msg.delete().catch((e) => { });
                }, 3000);
            })
        }
    }
})

client.on('messageUpdate', async (oldMessage, newMessage) => {

    if (newMessage.author.bot) return;
    if (!newMessage.guild) return;
    if (!newMessage.content) return;
    if (!oldMessage.content) return;
    
    const importedConfig = data.Antilink;

    if (!Utility.clientConfig.Antilink.enabled) return;
    if(hasPerms(newMessage.member, newMessage.guild, Utility.clientConfig.Antilink.permission)) return;
    if(newMessage.author.id == newMessage.guild.ownerId) return;

    const links = newMessage.content.match(/https?:\/\/[^\s]+|discord\.gg[^\s]*/gi);

    if (links) {
        const whitelistedLinks = Array.isArray(Utility.clientConfig.Antilink.whitelisted)? Utility.clientConfig.Antilink.whitelisted : [];
        let linksToBan = [];

        links.forEach(link => {
            const domain = link.replace(/^https?:\/\/(?:www\.)?/, '')
            const finalDomain = domain.split('/')[0];
            if(whitelistedLinks.includes(finalDomain)) {
                return;
            } else {
                linksToBan.push(link);
            }
        });

        if(linksToBan.length > 0) {
            client.emit('linkDetect', newMessage.member, linksToBan);
            newMessage.delete().catch(e => { });
            newMessage.channel.send({
                embeds: [
                    embed({
                        ...importedConfig.Embed,
                        variables: {
                            memberUser: `<@${newMessage.author.id}>`,
                            memberUsername: newMessage.author.username,
                            memberId: newMessage.author.id,
                            serverName: newMessage.guild.name,
                            serverIcon: newMessage.guild.iconURL({ size: 1024 }),
                            message: newMessage.content,
                            messageLinks: linksToBan.map(c => `${c}`).join(' , ')
                        }
                    })
                ]
            }).then((msg) => {
                setTimeout(() => {
                    msg.delete().catch((e) => { });
                }, 3000);
            })
        }
    }
})
