const chalk = require('chalk');
const { ChannelType } = require('discord.js');
const fs = require('fs')
const Database = require('../database/OlympusDatabase');
const Utility = require('./Utility');
const db = new Database()

function hasPerms(member, guild, perms, announce = true) {
    let canExecute = false;

    if (!member || typeof member !== 'object') {
        console.log(chalk.hex('#ef8b81').bold('[ Module ]') + chalk.hex('#ef8b81').bold(' [ Permission Check ]') + chalk.hex('#ef8b81').bold(' Invalid member provided.'));
        return;
    }

    if (!guild || typeof guild !== 'object') {
        console.log(chalk.hex('#ef8b81').bold('[ Module ]') + chalk.hex('#ef8b81').bold(' [ Permission Check ]') + chalk.hex('#ef8b81').bold(' Invalid guild provided.'));
        return;
    }

    if (!perms || !Array.isArray(perms)) {
        console.log(chalk.hex('#ef8b81').bold('[ Module ]') + chalk.hex('#ef8b81').bold(' [ Permission Check ]') + chalk.hex('#ef8b81 ' + `Invalid permission: ${perms}`) + chalk.hex('#ef8b81').bold('Permission must be an array.'));
        return;
    }

    if (perms.includes(member.user.username) || perms.includes(member.user.id)) {
        canExecute = true;
    }

    if (perms.includes("@everyone") || perms.includes("everyone")) {
        canExecute = true;
    }

    for (const role of perms) {
        const foundRole = guild.roles.cache.find((r) => r.name === role) || guild.roles.cache.get(role);
        if (foundRole && member.roles.cache.has(foundRole.id)) {
            canExecute = true;
            break;
        }
    }

    return canExecute;
}

function foundChannel(guild, channel, announce = false) {
    if (!guild || typeof guild !== 'object') {
        if(announce) console.log(chalk.hex('#ef8b81').bold('[ Module ]') + chalk.hex('#ef8b81').bold(' [ Found Channel ]') + chalk.hex('#ef8b81').bold(' Invalid guild provided.'));
        return;
    }

    if (!channel || typeof (channel) !== 'string') {
        if(announce) console.log(chalk.hex('#ef8b81').bold('[ Module ]') + chalk.hex('#ef8b81').bold(' [ Found Channel ]') + chalk.hex('#ef8b81 ' + ` Invalid channel provided.`));
        return;
    }

    const foundChannel = guild.channels.cache.find((c) => c.name === channel) || guild.channels.cache.get(channel);
    if (foundChannel) {
        return foundChannel;
    } else {
        if(announce) console.log(chalk.hex('#ef8b81').bold('[ Module ]') + chalk.hex('#ef8b81').bold(' [ Found Channel ]') + chalk.hex('#ef8b81 ' + ` Channel not found, missing channel: ${channel}`));
        return;
    }
}

function foundRole(guild, role) {
    if (!guild || typeof guild !== 'object') {
        console.log(chalk.hex('#ef8b81').bold('[ Module ]') + chalk.hex('#ef8b81').bold(' [ Found Role ]') + chalk.hex('#ef8b81').bold(' Invalid guild provided.'));
        return;
    }

    if (!role || role && typeof (role) !== 'string') {
        console.log(chalk.hex('#ef8b81').bold('[ Module ]') + chalk.hex('#ef8b81').bold(' [ Found Role ]') + chalk.hex('#ef8b81').bold(' Invalid role provided.'));
        return;
    }

    const foundRole = guild.roles.cache.find((r) => r.name === role) || guild.roles.cache.get(role);
    if (foundRole) {
        return foundRole;
    } else {
        console.log(chalk.hex('#ef8b81').bold('[ Module ]') + chalk.hex('#ef8b81').bold(' [ Found Role ]') + chalk.hex('#ef8b81 ' + ` Role not found, missing role: ${role}`));
        return;
    }
}

function foundMember(guild, user) {
    if (!guild || typeof guild !== 'object') {
        console.log(chalk.hex('#ef8b81').bold('[ Module ]') + chalk.hex('#ef8b81').bold(' [ Found Member ]') + chalk.hex('#ef8b81').bold(' Invalid guild provided.'));
        return;
    }

    if (!user || user && typeof (user) !== 'string') {
        console.log(chalk.hex('#ef8b81').bold('[ Module ]') + chalk.hex('#ef8b81').bold(' [ Found Member ]') + chalk.hex('#ef8b81').bold(' Invalid user provided.'));
        return;
    }

    const foundMember = guild.members.cache.find((m) => m.user.id === user) || guild.members.cache.find((m) => m.user.username === user) || guild.members.cache.find((m) => m.user.username === user.username) || guild.members.cache.find((m) => m.displayName === user.username);
    if (foundMember) {
        return foundMember;
    } else {
        console.log(chalk.hex('#ef8b81').bold('[ Module ]') + chalk.hex('#ef8b81').bold(' [ Found Member ]') + chalk.hex('#ef8b81 ' + ` Member not found, missing member: ${user}`));
        return;
    }
}

function foundEmoji(guild, emoji) {
    if (!guild || typeof guild !== 'object') {
        console.log(chalk.hex('#ef8b81').bold('[ Module ]') + chalk.hex('#ef8b81').bold(' [ Found Emoji ]') + chalk.hex('#ef8b81').bold(' Invalid guild provided.'));
        return;
    }

    if (!emoji || emoji && typeof (emoji) !== 'string') {
        console.log(chalk.hex('#ef8b81').bold('[ Module ]') + chalk.hex('#ef8b81').bold(' [ Found Emoji ]') + chalk.hex('#ef8b81').bold(' Invalid emoji provided.'));
        return;
    }

    const foundEmoji = guild.emojis.cache.find((e) => e.name === emoji) || guild.emojis.cache.get(emoji);
    if (foundEmoji) {
        return foundEmoji;
    } else {
        console.log(chalk.hex('#ef8b81').bold('[ Module ]') + chalk.hex('#ef8b81').bold(' [ Found Emoji ]') + chalk.hex('#ef8b81').bold(' Emoji not found.'));
        return;
    }
}

async function getTickets(guild) {
    if (!guild || typeof guild !== 'object') {
        console.log(chalk.hex('#ef8b81').bold('[ Module ]') + chalk.hex('#ef8b81').bold(' [ Found Emoji ]') + chalk.hex('#ef8b81').bold(' Invalid guild provided.'));
        return;
    }
    const tickets = await Utility.db.get('ticket', { guild: guild.id })
    return tickets;
}

function backup(guild) {
    if (!guild || typeof guild !== 'object') {
        console.log(
            chalk.hex('#ef8b81').bold('[ Module ]') +
            chalk.hex('#ef8b81').bold(' [ Backup ]') +
            chalk.hex('#ef8b81').bold(' Invalid guild provided.')
        );
        return;
    }

    const bac = {
        roles: guild.roles.cache.map(r => r.name),
        emojis: guild.emojis.cache.map(e => ({ name: e.name, id: e.id })),
        serverIcon: guild.iconURL(),
        serverID: guild.id,
        serverSettings: {
            name: guild.name,
            region: guild.region,
            verificationLevel: guild.verificationLevel,
            defaultMessageNotifications: guild.defaultMessageNotifications,
            explicitContentFilter: guild.explicitContentFilter,
            afkTimeout: guild.afkTimeout,
            systemChannel: guild.systemChannel ? guild.systemChannel.name : null
        }
    };

    bac.categories = guild.channels.cache.filter(c => c.type === 'GUILD_CATEGORY').map(c => ({
        id: c.id,
        name: c.name,
        channels: guild.channels.cache
            .filter(channel => channel.parentId === c.id)
            .map(channel => ({ id: channel.id, name: channel.name, type: channel.type }))
    }));

    bac.channels = guild.channels.cache.filter(c => c.type !== 'GUILD_CATEGORY').map(c => ({
        id: c.id,
        name: c.name,
        type: c.type,
        parentId: c.parentId
    }));

    bac.members = guild.members.cache.map(m => m.user.username);

    bac.permissions = guild.roles.cache.map(r => ({
        name: r.name,
        id: r.id,
        permissions: r.permissions.toArray()
    }));

    const backupData = JSON.stringify(bac, null, 2); // Formatirani JSON
    const backupPath = './utils/database/backup.json';

    try {
        fs.writeFileSync(backupPath, backupData);
    } catch (err) {
       return;
    }
}

function loadBackup() {
    const backupPath = './utils/database/backup.json';
    if (!fs.existsSync(backupPath)) {
        console.log(chalk.hex('#ef8b81').bold('[ Module ]') + chalk.hex('#ef8b81').bold(' [ Backup ]') + chalk.hex('#ef8b81').bold(' Backup file not found.'));
        return;
    }
    const backupData = fs.readFileSync(backupPath, 'utf8');
    const backup = JSON.parse(backupData);
    return backup;
}

function formatTime(preset = 'dmy', timestamp) {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const day = date.getDay();
    const month = date.getMonth();
    const year = date.getFullYear();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if(preset === 'dmy') return `${days[day]}, ${months[month]} ${date.getDate()}, ${year}`;
    if(preset === 'hms') return `${hours}:${minutes}:${seconds}`;
    if(preset === 'dmyhms') return `${days[day]}, ${months[month]} ${date.getDate()}, ${year}, ${hours}:${minutes}:${seconds}`;
    if(preset === 'dmyhm') return `${days[day]}, ${months[month]} ${date.getDate()}, ${year}, ${hours}:${minutes}`;
    if(preset === 'dmyh') return `${days[day]}, ${months[month]} ${date.getDate()}, ${year}, ${hours}:${minutes}`;
    if(preset === 'untilDay') return `<t:${parseInt(timestamp)}:F>`
    if(preset === 'untilTime') return `<t:${parseInt(timestamp)}:R>`
    if(preset === 'showAll') return `${days[day]}, ${months[month]} ${date.getDate()}, ${year} , ${hours}:${minutes}:${seconds}`;
    else return `${days[day]}, ${months[month]} ${date.getDate()}, ${year} , ${hours}:${minutes}:${seconds}`;
}

async function getCoins(user) {
    if (!user || typeof user!== 'object') {
        console.log(chalk.hex('#ef8b81').bold('[ Module ]') + chalk.hex('#ef8b81').bold(' [ Coins ]') + chalk.hex('#ef8b81').bold(' Invalid user provided.'));
        return;
    }
    const coins = await db.findOne('economy', { userid: user.id })
    if(!coins || coins && coins.balance === 0) return 0;
    else return coins.balance;
}

function generateCode (length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

function getWinners(userArray, amount) {
    const winners = [];
    const eligibleUsers = userArray.slice();
    
    if (eligibleUsers.length <= amount) {
        return eligibleUsers;
    }
    
    while (winners.length < amount) {
        const winnerIndex = Math.floor(Math.random() * eligibleUsers.length);
        const winner = eligibleUsers.splice(winnerIndex, 1)[0];
        winners.push(winner);
    }
    
    return winners;
}

module.exports = { hasPerms, foundChannel, foundRole, foundMember, foundEmoji, getTickets, backup, loadBackup, formatTime, getCoins, generateCode, getWinners }