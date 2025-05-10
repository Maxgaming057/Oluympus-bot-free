const Utility = require("../modules/Utility");
const events = require("./events");
const fs = require('fs').promises;
const eventModule = require("./events");

async function reloadCommands(client) {
    const commandsFolders = await fs.readdir('./src/commands/');
    for (const folder of commandsFolders) {
        const commandFiles = await fs.readdir(`./src/commands/${folder}`);
        for (const file of commandFiles.filter(file => file.endsWith('.js'))) {
            const commandPath = `../../src/commands/${folder}/${file}`;
            delete require.cache[require.resolve(commandPath)];
            const commandFile = require(commandPath);
            await client.commands.set(commandFile.data.name, { folder, ...commandFile });
        }
    }

    return {
        status: 200,
        message: 'Success',
    };
}

async function reloadAddons(client) {
    const addonFiles = await fs.readdir('./addons');
    for (const file of addonFiles.filter(file => file.endsWith('.js'))) {
        const addonPath = `../../addons/${file}`;
        delete require.cache[require.resolve(addonPath)];
        const addon = require(addonPath);
        if (addon.commands && Array.isArray(addon.commands)) {
            const fileName = file.split('.')[0];
            const db = await Utility.db.findOne('addon', { addon: fileName });
            if (db && db.unloaded === 1) continue;
            addon.commands.forEach(async command => {
                if (command.data.name && command.data.name !== '') {
                    await client.commands.set(command.data.name, command);
                }
            });
        }
    }
    return {
        status: 200,
        message: 'Success',
    };
}

async function reloadEvents(client) {
    const eventNames = client.rest.eventNames();
    await Promise.all(eventNames.map(async (eventName) => {
        const listeners = await client.rest.listeners(eventName);
        await Promise.all(listeners.map(async (listener) => {
            await client.removeListener(eventName, listener, true);
            await events(client);
        }));
    }));

    return {
        status: 200,
        message: 'Success',
    };
}

async function reloadModules(client) {
    const commands = client.commands;
    commands.map(c => {
        if(c.devOnly) return client.commands.delete(c.data.name);
    })

    return {
        status: 200,
        message: 'Success',
    };
}

async function reloadBot(client) {
    await reloadCommands(client);
    await reloadAddons(client);
    await reloadEvents(client);
    await reloadModules(client);
}

module.exports = {
    reloadCommands,
    reloadAddons,
    reloadEvents,
    reloadBot,
    reloadModules
};
