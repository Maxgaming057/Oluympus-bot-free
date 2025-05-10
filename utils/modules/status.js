const chalk = require("chalk");
const { ActivityType, ChannelType } = require('discord.js');
const Utility = require("./Utility");

module.exports = async (status, client) => {
    let tt;
    const statusType = status.type.toLowerCase();
    if (statusType === "playing") tt = ActivityType.Playing;
    else if (statusType === "watching") tt = ActivityType.Watching;
    else if (statusType === "listening") tt = ActivityType.Listening;
    else if (statusType === "competing") tt = ActivityType.Competing;
    else if (statusType === "streaming") tt = ActivityType.Streaming;
    else tt = ActivityType.Watching; // Default case

    const guild = client.guilds.cache.first();
    if (!guild) {
        console.log(chalk.hex('#ef8b81').bold('[ Status Error ] Could not find any guild, bot is shutting down.'));
        process.exit();
        return;
    }

    const members = guild.members.cache;
    const textChannels = guild.channels.cache.filter((ch) => ch.type === ChannelType.GuildText).size;
    const voiceChannels = guild.channels.cache.filter((ch) => ch.type === ChannelType.GuildVoice).size;
    const categoryChannels = guild.channels.cache.filter((ch) => ch.type === ChannelType.GuildCategory).size;

    const allTickets = await Utility.db.findAll('ticket');
    const openTickets = allTickets.filter(ticket => !ticket.closetime);
    const ticketCount = openTickets.length || 0;  

    const activityName = status.name
        .replace(/{members}/g, members.filter((m) => !m.user.bot).size)
        .replace(/{bots}/g, members.filter((m) => m.user.bot).size)
        .replace(/{total}/g, members.size)
        .replace(/{tickets}/g, ticketCount)
        .replace(/{onlineUsers}/g, members.filter((m) => m.presence?.status === "online").size)
        .replace(/{offlineUsers}/g, members.filter((m) => m.presence?.status === "offline").size)
        .replace(/{dndUsers}/g, members.filter((m) => m.presence?.status === "dnd").size)
        .replace(/{idleUsers}/g, members.filter((m) => m.presence?.status === "idle").size)
        .replace(/{textChannels}/g, textChannels)
        .replace(/{voiceChannels}/g, voiceChannels)
        .replace(/{categoryChannels}/g, categoryChannels);

    client.user.setPresence({
        activities: [
            {
                name: activityName,
                type: tt
            },
        ],
        status: status.status,
    });
};