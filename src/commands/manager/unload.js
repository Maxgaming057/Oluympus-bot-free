const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");
const fs = require('fs');
const reloadBot = require('../../../utils/handlers/reloadbot')
module.exports = {
    category: 'management',
    aliases: ['unload'],
    data: new SlashCommandBuilder()
        .setName('unloadaddon')
        .setDescription('Unload an addon')
        .addStringOption(option => option
            .setName('addon')
            .setDescription('The addon you want to unload!')
            .setRequired(true)
        ),
    async execute(moi, args, client, { type, send }) {

        const addon = type === 'interaction' ? moi.options.getString('addon') : args[0];
        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Unloadaddon.permissions)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Permission,
                    })
                ]
            })
        }

        if (!addon) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Usage,
                        variables: {
                            usage: `${await Utility.getPrefix(moi.guild.id)}unloadaddon [addon]`
                        }
                    })
                ]
            }, true);
        }


        const hasAddon = fs.existsSync(`./addons/${addon}.js`);

        if (!hasAddon) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Unloadaddon.AddonNotFound,
                        variables: {
                            addon: addon
                        }
                    })
                ]
            })
        }

        const isLoaded = await Utility.db.findOne('addon', { addon: addon });

        if (isLoaded && isLoaded.unloaded === 1) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Unloadaddon.Isloaded,
                        variables: {
                            addon: addon
                        }
                    })
                ]
            })
        }

        if (isLoaded) {
            await Utility.db.update('addon', { unloaded: true }, { addon: addon });
            await reloadBot.reloadAddons(client)
            await reloadBot.reloadEvents(client)
            await reloadBot.reloadCommands(client)
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Unloadaddon.Embed,
                        variables: {
                            addon: addon
                        }
                    })
                ]
            })
            
        } else {
            const addonPath = require(`../../../addons/${addon}`)
            if(addonPath && Array.isArray(addonPath.commands)) {
                addonPath.commands.forEach(command => {
                    client.commands.delete(command.data.name);
                });
            }
            await Utility.db.insert('addon', { addon: addon, unloaded: true });
            await reloadBot.reloadAddons(client)
            await reloadBot.reloadEvents(client)
            await reloadBot.reloadCommands(client)
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Unloadaddon.Embed,
                        variables: {
                            addon: addon
                        }
                    })
                ]
            })
        }
    }

}