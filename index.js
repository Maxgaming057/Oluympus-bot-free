const yaml = require('yaml');
const fs = require('fs');
const chalk = require('chalk');
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const startup = require('./utils/handlers/startup');
const status = require('./utils/modules/status');
const load = require('./utils/handlers/load');
const errors = require('./utils/handlers/errors');
const db = require('./utils/database/db');
const invites = require('./utils/modules/invites');
const log = require('./utils/modules/log');
const handlegiveaways = require('./utils/handlers/handlegiveaways');
const music = require('./utils/handlers/music');
const Utility = require('./utils/modules/Utility');
const { setVariable } = require('./utils/modules/variables');
const { ResetDatabase } = require('./utils/modules/ResetDb');
const discordstatus = require('./utils/handlers/discordstatus');
const EventEmitter = require('events');

const fileContent = fs.readFileSync('./config/config.yml', 'utf8');
const data = yaml.parse(fileContent);
const package = require('./package.json');
const { backup } = require('./utils/modules/utils');

if (!data || !data.token || typeof data.token !== 'string' || typeof data !== 'object') {
    console.log(
        chalk.red('[ERROR] Invalid configuration') +
        chalk.red(' Please check your config.yml file and try again.')
    );
    return false;
}

const client = new Client({
    intents: Object.values(GatewayIntentBits),
    partials: Object.values(Partials)
});

if (client.guilds.cache.size) {
    console.log(chalk.red('[ERROR] Invalid configuration') + 
                chalk.red(' Please check config and try again.'));
    return false;
}

if (process.env.RESET_DATABASE) {
    ResetDatabase('./utils/handlers/database');
    Utility.log('success', 'Database reset successfully');
    console.log('Database reset complete! Please restart the bot!');
    process.exit(1);
}

EventEmitter.defaultMaxListeners = 30;

client.on('ready', async () => {
    await db();
    await startup(client).catch(async error => {
        console.log(error)
        if (error.retry) {
            log('info', `Starting bot v${package.version}`);
            await discordstatus(client.guilds.cache.size());
            await errors(client);

            let counter = 0;
            setInterval(() => {
                counter = (counter + 1) % data.statuses.length;
                status(data.statuses[counter], client);
            }, 15000);

            await status(data.statuses[counter], client);
            await music(client);
            await load();
            backup(client.guilds.cache.size());
            
            Utility.log('Starting...');
            await handlegiveaways(client.guilds.cache.size());
            await invites(client);

            setVariable({ guild: client.guilds.cache.size() });
            setVariable({ commands: 'commands' });
            setVariable({ events: 'events' });

        } else {
            process.exit(1);
        }
    });
});

process.on('uncaughtException', (error, origin) => {
    if (error.message.includes('Error: Invalid configuration')) {
        Utility.log('error', 
            'Invalid configuration! Please check your config.yml file and try again.\n' +
            'Common issues:\n' +
            '1. Missing or invalid token\n' + 
            '2. Invalid permissions\n' +
            '3. Missing required fields\n' +
            '4. Syntax errors in config\n' +
            'For more help visit: https://docs.example.com/config/'
        );
        process.exit(1);
    }
});

client.commands = new Collection();
client.buttonCommands = [];

client.login(data?.token);

module.exports = client;
