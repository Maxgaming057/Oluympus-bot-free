const log = require("../modules/log");
const Database = require("./OlympusDatabase");
const db = new Database();
const chalk = require('chalk')
module.exports = async () => {
    log('debug', '[ Database Setup ] Loading ...')
    
    db.createTable('commands', {
        command: "TEXT PRIMARY KEY",
        disabled: "BOLEAN"
    })

    db.createTable('economy', {
        userid: "TEXT PRIMARY KEY",
        guildid: "TEXT",
        balance: "NUMBER",
        bank: "NUMBER"
    })

    db.createTable('jobs', {
        userid: "TEXT PRIMARY KEY",
        guildid: "TEXT",
        job: "TEXT",
        level: "NUMBER",
        tolevel: "NUMBER"
    })
    
    db.createTable('weeklycooldown', {
        userid: "TEXT PRIMARY KEY",
        guildid: "TEXT",
        time: "NUMBER"
    })
    
    db.createTable('dailycooldown', {
        userid: "TEXT PRIMARY KEY",
        guildid: "TEXT",
        time: "NUMBER"
    })

    db.createTable('workcooldown', {
        userid: "TEXT PRIMARY KEY",
        guildid: "TEXT",
        time: "NUMBER"
    })
    
    db.createTable('messages', {
        userid: "TEXT PRIMARY KEY",
        guildId: "TEXT",
        amount: "NUMBER"
    })
    
    db.createTable('voice', {
        id: "TEXT PRIMARY KEY",
        guild: "TEXT",
        time: "INTEGER",
        connectTime: "INTEGER",
        leaveTime: "INTEGER"
    })

    db.createTable('prefix', {
        guild: "TEXT",
        prefix: "TEXT"
    })

    db.createTable('level', {
        id: "TEXT PRIMARY KEY",
        guild: "INTEGER",
        level: "INTEGER",
        xp: "INTEGER",
        currentXp: "INTEGER"
    })

    db.createTable('invite', {
        id: "TEXT PRIMARY KEY",
        guild: "TEXT",
        real: "JSON",
        fake: "JSON",
        bonus: "INTEGER",
    })

    db.createTable('punishment', {
        id: "TEXT PRIMARY KEY",
        guild: "INTEGER",
        punishments: "JSON",
    })

    db.createTable('lockdown', {
        guildid: "TEXT PRIMARY KEY",
        islocked: "BOOLEAN"
    })

    db.createTable('giveaway', {
        id: "TEXT PRIMARY KEY",
        guild: "TEXT",
        channel: "TEXT",
        host: "TEXT",
        ended: "BOOLEAN",
        users: "JSON",
        prize: "TEXT",
        winners: "NUMBER",
        duration: "NUMBER",
        require: 'JSON'
    })

    db.createTable('ticket', {
        id: "TEXT PRIMARY KEY",
        guild: "TEXT",
        opener: "TEXT",
        name: "TEXT",
        staff: "JSON",
        addedusers: 'JSON',
        opentime: "INTEGER",
        closetime: "INTEGER"
    })

    db.createTable('warn', {
        id: "TEXT PRIMARY KEY",
        guild: "TEXT",
        user: "TEXT",
        staff: "TEXT",
        reason: "TEXT",
    })

    db.createTable('ticketban', {
        user: "TEXT PRIMARY KEY",
        guild: "TEXT",
        reason: "TEXT",
    })

    db.createTable('addon', {
        addon: "TEXT PRIMARY KEY",
        unloaded: "BOOLEAN",
    })

    db.createTable('dailystats', {
        guild: "TEXT PRIMARY KEY",
        count: "NUMBER",
    })

    db.createTable('cooldowns', {
        id: "TEXT PRIMARY KEY",
        duration: "NUMBER",
    })
    
    log('success', '[ Database ] is ready!')
}