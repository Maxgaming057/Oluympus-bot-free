const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");

module.exports = {
    category: 'general',
    aliases: ['voicetop', 'lbvoice'],
    data: new SlashCommandBuilder()
        .setName('vctop')
        .setDescription('Top 10 voice'),
    async execute(moi, args, client, { type, send }) {

        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Voicetop.permission)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...data.Permission
                    })
                ]
            }, true);
        }

        const voice = await Utility.db.get('voice', { guild: moi.guild.id });
        if (!voice || (voice && voice.length === 0)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Voicetop.novoice
                    })
                ]
            }, true);
        }

        const sortedVoice = voice.sort((a, b) => b.time - a.time);
        const top10 = sortedVoice.slice(0, 10);
        let times = '';
        let i = 1;

        top10.forEach(time => {
            const cached = client.users?.cache.get(time.id);
            if(cached && cached.bot) return;
            
            const durationInSeconds = time.time / 1000;
            const days = Math.floor(durationInSeconds / (3600 * 24));
            const hours = Math.floor((durationInSeconds % (3600 * 24)) / 3600);
            const minutes = Math.floor((durationInSeconds % 3600) / 60);
            const seconds = Math.floor(durationInSeconds % 60);

            let durationString = '';

            if (days > 0) {
                durationString += `${days} day${days !== 1 ? 's' : ''}`;
            }

            if (hours > 0) {
                durationString += `${durationString ? ' ' : ''}${hours} hour${hours !== 1 ? 's' : ''}`;
            }

            if (minutes > 0 && days === 0) {
                durationString += `${durationString ? ' ' : ''}${minutes} minute${minutes !== 1 ? 's' : ''}`;
            }

            if (seconds > 0 && days === 0 && hours === 0) {
                durationString += `${durationString ? ' ' : ''}${seconds} second${seconds !== 1 ? 's' : ''}`;
            }

            times += `**${i++}.** <@${time.id}> \`(${client.users.cache.get(time.id)?.username})\` - ${durationString}\n`;
        });

        send(type, moi, {
            embeds: [
                Utility.embed({
                    ...Utility.lang.Voicetop.Embed,
                    variables: {
                        serverIcon: moi.guild.iconURL({ size: 1024 }),
                        voiceTop: times
                    }
                })
            ]
        }, true);
    }
};
