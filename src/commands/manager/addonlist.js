const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");
const fs = require('fs');

module.exports = {
    category: 'management',
    aliases: ['alist'],
    data: new SlashCommandBuilder()
        .setName('addonlist')
        .setDescription('Check loaded or unloaded addons!'),
    async execute(moi, args, client, { type, send }) {

        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Addonlist.permissions)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Permission,
                    })
                ]
            });
        }

        const allAddons = await Utility.db.findAll('addon');
        const loadedAddons = allAddons.filter(ad => !ad.unloaded);
        const unloadedAddons = allAddons.filter(ad => ad.unloaded);

        let load = loadedAddons.map(ad => ad.addon);
        let unload = unloadedAddons.map(ad => ad.addon);

        const addonFiles = fs.readdirSync('./addons').filter(f => f.endsWith('.js'));
        const dbAddonNames = new Set(allAddons.map(ad => ad.addon));
        const additionalLoadedAddons = [];

        const addonCommands = {};

        for (const file of addonFiles) {
            const fileName = file.split('.')[0];
            if (!dbAddonNames.has(fileName)) {
                additionalLoadedAddons.push(fileName);
            }
            
            try {
                const addonModule = require(`../../../addons/${file}`);
                if (addonModule.commands && Array.isArray(addonModule.commands)) {
                    addonCommands[fileName] = addonModule.commands.map(c => `\`${c.data.name}\``).join(', ');
                }
            } catch (err) {
                console.error(`Failed to load addon ${fileName}:`, err);
            }
        }

        if (additionalLoadedAddons.length > 0) {
            load = [...load, ...additionalLoadedAddons];
        }

        const generateEmbed = (page) => {
            const pageSize = 5;
            const totalPages = Math.ceil(load.length / pageSize);
            const start = (page - 1) * pageSize;
            const end = start + pageSize;

            const currentAddons = load.slice(start, end)
                .map((addon, idx) => {
                    const commands = addonCommands[addon] || 'No commands';
                    return `\`${start + idx + 1}.\` **${addon}**\nCommands: ${commands}`;
                })
                .join('\n\n');

            const currentUnloaded = unload.slice(0, 5).join('\n') || 'No addons unloaded';

            return Utility.embed({
                ...Utility.lang.Addonlist.Embed,
                variables: {
                    loadedAddons: currentAddons || 'No addons loaded',
                    unloadedAddons: currentUnloaded,
                    serverIcon: moi.guild.iconURL({ size: 1024 }),
                    currentPage: page,
                    totalPages
                }
            });
        };

        let currentPage = 1;
        const embed = generateEmbed(currentPage);
        const msg = await send(type, moi, { embeds: [embed] }, true);

        if (load.length > 5) {
            await msg.react('⬅️');
            await msg.react('➡️');

            const filter = (reaction, user) =>
                ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === moi.member.user.id;

            const collector = msg.createReactionCollector({ filter, time: 60000 });

            collector.on('collect', (reaction) => {
                if (reaction.emoji.name === '⬅️' && currentPage > 1) {
                    currentPage--;
                } else if (reaction.emoji.name === '➡️' && currentPage < Math.ceil(load.length / 5)) {
                    currentPage++;
                }

                const newEmbed = generateEmbed(currentPage);
                msg.edit({ embeds: [newEmbed] });
                reaction.users.remove(moi.member.user.id);
            });

            collector.on('end', () => {
                msg.reactions.removeAll().catch(() => { });
            });
        }
    }
};
