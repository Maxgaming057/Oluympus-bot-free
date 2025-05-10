const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");
const fs = require('fs');
const reloadBot = require("../../../utils/handlers/reloadbot");
module.exports = {
    category: 'management',
    aliases: ['load'],
    data: new SlashCommandBuilder()
        .setName('loadaddon')
        .setDescription('Load an addon')
        .addStringOption(option => option
            .setName('addon')
            .setDescription('The addon you want to load!')
            .setRequired(true)
        ),
    async execute(moi, args, client, { type, send }) {

        const addon = type === 'interaction' ? moi.options.getString('addon') : args[0];
        if(!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Loadaddon.permissions)) {
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
                            usage: `${await Utility.getPrefix(moi.guild.id)}loadaddon [addon]`
                        }
                    })
                ]
            }, true);
        }

    
        const hasAddon = fs.existsSync(`./addons/${addon}.js`);

        if(!hasAddon) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                       ...Utility.lang.Loadaddon.AddonNotFound,
                        variables: {
                            addon: addon
                        }
                    })
                ]
            })
        }

        const isLoaded = await Utility.db.findOne('addon', { addon: addon });
        
        if(isLoaded && isLoaded.unloaded === 0) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                       ...Utility.lang.Loadaddon.Isloaded,
                        variables: {
                            addon: addon
                        }
                    })
                ]
            })
        }

        if(isLoaded) {
        await Utility.db.update('addon', { unloaded: false }, { addon: addon });
        await reloadBot.reloadAddons(client)
        await reloadBot.reloadEvents(client)
        await reloadBot.reloadCommands(client)
        return send(type, moi, {
            embeds: [
                Utility.embed({
                   ...Utility.lang.Loadaddon.Embed,
                    variables: {
                        addon: addon
                    }
                })
            ]
        })
        } else {
        await Utility.db.insert('addon', { addon: addon, unloaded: false });
        await reloadBot.reloadAddons(client)
        return send(type, moi, {
            embeds: [
                Utility.embed({
                   ...Utility.lang.Loadaddon.Embed,
                    variables: {
                        addon: addon
                    }
                })
            ]
        })
        }
        
        




    }

}