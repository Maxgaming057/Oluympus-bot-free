const chalk = require("chalk");
const fs = require("fs");
const yaml = require('js-yaml');
const log = require("../modules/log");
const { ChannelType } = require("discord.js");
const { foundChannel } = require("../modules/utils");
const ms = require("ms");
const Utility = require("../modules/Utility");
const content = fs.readFileSync('./config/config.yml', 'utf-8');
const data = yaml.load(content);
const settings = data.Status;
module.exports = async (guild) => {
    const { config, interval, category } = settings;
    if(settings.enabled) {
        Utility.log(`info`, `[ Discord Status ] has been enabled!`)
        setTimeout(() => {
            config.forEach(async set => {
                const channel = await guild.channels.cache.get(set.channel);
                const cat = await foundChannel(guild, category)
                const value = set.value
                .replace(/{humansTotal}/g, guild.members.cache.filter((u) => !u.user.bot).size)
                .replace(/{botsTotal}/g, guild.members.cache.filter((u) => u.user.bot).size)
                .replace(/{totalMembers}/g, guild.members.cache.size)
                .replace(/{channelsTotal}/g, guild.channels.cache.size)
                .replace(/{rolesTotal}/g, guild.roles.cache.size)
                .replace(/{emojisTotal}/g, guild.emojis.cache.size)
                .replace(/{textChannels}/g, guild.channels.cache.filter((c) => c.type === ChannelType.GuildText).size)
                .replace(/{voiceChannels}/g, guild.channels.cache.filter((c) => c.type === ChannelType.GuildVoice).size)
                .replace(/{categoryChannels}/g, guild.channels.cache.filter((c) => c.type === ChannelType.GuildCategory).size)
                .replace(/{forumChannels}/g, guild.channels.cache.filter((c) => c.type === ChannelType.GuildForum).size)
                .replace(/{directoryChannels}/g, guild.channels.cache.filter((c) => c.type === ChannelType.GuildDirectory).size)
                .replace(/{highestRole}/g, guild.roles.cache.sort((a, b) => b.rawPosition - a.rawPosition).first().name)
                .replace(/{lowestRole}/g, guild.roles.cache.sort((a, b) => a.rawPosition - b.rawPosition).first().name)
    
                if(channel) {
                    await channel.setName(value).catch((e) => { })
                    if(cat && cat.type === ChannelType.GuildCategory) {
                        channel.setParent(cat).catch((e) => { })
                    }
                } 
            })
        }, 5000);
        setInterval(async () => {
                config.forEach(async set => {
                    const channel = await guild.channels.cache.get(set.channel);
                    const cat = await foundChannel(guild, category)
                    const value = set.value
                    .replace(/{humansTotal}/g, guild.members.cache.filter((u) => !u.user.bot).size)
                    .replace(/{botsTotal}/g, guild.members.cache.filter((u) => u.user.bot).size)
                    .replace(/{totalMembers}/g, guild.members.cache.size)
                    .replace(/{channelsTotal}/g, guild.channels.cache.size)
                    .replace(/{rolesTotal}/g, guild.roles.cache.size)
                    .replace(/{emojisTotal}/g, guild.emojis.cache.size)
                    .replace(/{textChannels}/g, guild.channels.cache.filter((c) => c.type === ChannelType.GuildText).size)
                    .replace(/{voiceChannels}/g, guild.channels.cache.filter((c) => c.type === ChannelType.GuildVoice).size)
                    .replace(/{categoryChannels}/g, guild.channels.cache.filter((c) => c.type === ChannelType.GuildCategory).size)
                    .replace(/{forumChannels}/g, guild.channels.cache.filter((c) => c.type === ChannelType.GuildForum).size)
                    .replace(/{directoryChannels}/g, guild.channels.cache.filter((c) => c.type === ChannelType.GuildDirectory).size)
                    .replace(/{highestRole}/g, guild.roles.cache.sort((a, b) => b.rawPosition - a.rawPosition).first().name)
                    .replace(/{lowestRole}/g, guild.roles.cache.sort((a, b) => a.rawPosition - b.rawPosition).first().name)
        
                    if(channel) {
                        await channel.setName(value).catch((e) => { })
                        if(cat && cat.type === ChannelType.GuildCategory) {
                            channel.setParent(cat).catch((e) => { })
                        }
                    } 
                });  
        }, ms(interval) < 300000 ? ms('5m') : ms(interval))
    }

}