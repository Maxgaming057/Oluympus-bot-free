const chalk = require('chalk');
const fs = require('fs');
const Utility = require('../modules/Utility');


const registeredEvents = new Set();
const commandsArray = [];
const addons = [];
const addonEvents = [];
const all = [];

async function loadCommands(client) {
    const folders = fs.readdirSync('./src/commands/');

    for (const folder of folders) {
        const commands = fs.readdirSync(`./src/commands/${folder}`).filter(file => file.endsWith('.js'));
        if (commands.length === 0) {
            console.log(chalk.red('[INIT] No commands found in: '), chalk.yellow('[Event Init]: No commands exist'));
            continue;
        }

        for (const command of commands) {
            const commandFile = require(`../../src/commands/${folder}/${command}`);
            const cmdData = { folder: folder, ...commandFile };
            if (!commandFile.data.name || commandFile.data.name === '') continue;

            if (client.commands.has(commandFile.data.name)) {
                Utility.error('Error', 'Command already exists: Failed to add command with name: ' + commandFile.data.description);
                break;
            }

            client.commands.set(commandFile.data.name, cmdData);
            commandsArray.push(commandFile.data.toJSON());
        }
    }
}

async function loadAddons(client) {
    const addonPath = './src/addons';
    
    if (!fs.existsSync(addonPath)) {
        console.log(chalk.red('[ADDON] No addons found'), chalk.yellow('[ Addon Init]: No addons exist'));
        return;
    }

    const addonFiles = fs.readdirSync(addonPath).filter(file => file.endsWith('.js'));

    for (const addon of addonFiles) {
        const addonName = addon.split('.')[0];
        const addonModule = require(`../src/addons/${addon}`);
        
        const query = { name: addonName };
        const exists = await Utility.db.findOne('addons', query);
        
        if (exists && exists.disabled === 1) continue;
        
        addons.push(addonModule);
        loadAddonCommands(client, addonModule);
        loadAddonEvents(client, addonModule); 
        executeAddonFunction(addonModule, client);
    }
}

function loadAddonCommands(client, addon) {
    if (addon.commands && Array.isArray(addon.commands)) {
        for (const command of addon.commands) {
            if (!command.data.name || command.data.name === '') continue;

            if (client.commands.has(command.data.name)) {
                Utility.error("Error", "Command already exists: Failed to add command with name: " + command.data.description);
                break;
            }

            client.commands.set(command.data.name, command);
            commandsArray.push(command.data.toJSON());
        }
    }
}

function loadAddonEvents(client, addon) {
    if (Array.isArray(addon.events)) {
        for (const event of addon.events) {
            const { name, once, execute, id } = event;
            const eventKey = name + '-' + id;

            if (!registeredEvents.has(eventKey)) {
                addonEvents.push(eventKey);
                registeredEvents.add(eventKey);

                if (once) {
                    client.once(name, (...args) => execute(...args, client));
                } else {
                    client.on(name, (...args) => execute(...args, client)); 
                }

                if (id) {
                    all.push({ id, execute });
                }
            }
        }
    }
}

function executeAddonFunction(addon, client) {
    if (addon.init) {
        const { name, execute } = addon.init;
        if (!execute || !name) return;
        execute(client);
    }
}

async function resetSlashCommands(client) {
    try {
        const existingCommands = await client.application.commands.fetch();
        const commandsToDelete = existingCommands.filter(command => 
            !commandsArray.some(c => c.name === command.name)
        );

        await Promise.all(commandsToDelete.map(async command => {
            try {
                await client.application.commands.delete(command.id);
            } catch (error) {
                console.log("Failed to delete guild command:", error);
            }
        }));

        await client.application.commands.set(commandsArray);
        const guildCommands = await client.guilds.cache.map(guild => guild);

        await Promise.all(guildCommands.map(async guild => {
            try {
                const existingGuildCommands = await guild.commands.fetch();
                const guildCommandsToDelete = existingGuildCommands.filter(command =>
                    !commandsArray.some(c => c.name === command.name) 
                );

                await Promise.all(guildCommandsToDelete.map(async command => {
                    await guild.commands.delete(command.id);
                }));
            } catch (error) {
                console.log(`Failed to reset commands for guild "${guild.name}":`, error);
            }
        }));

        Utility.log("info", "Commands reset successfully");

    } catch (error) {
        Utility.log("error", "Failed to reset commands", error);
    }
}

module.exports = async client => {
    await loadCommands(client);
    await loadAddons(client);
    await resetSlashCommands(client);

    console.log(
        chalk.red('[ COMMANDS ] Commands Initialized: '),
        chalk.yellow(`[ Init ]: ${commandsArray.length === 1 ? commandsArray.length + ' command' : commandsArray.length + ' commands'}`)
    );

    console.log(
        chalk.red('[ ADDONS ] Addons Initialized: '),
        chalk.yellow(`[ Init ]: ${addons.length === 1 ? addons.length + ' addon' : addons.length + ' addons'}`)
    );

    console.log(
        chalk.red('[ Event State ] Event Status: '),
        chalk.yellow(`[ Init ]: ${addonEvents.length === 1 ? addonEvents.length + ' event' : addonEvents.length + ' events'}`)
    );
};