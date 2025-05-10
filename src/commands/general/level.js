const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");

module.exports = {
    category: 'general',
    aliases: ['rank'],
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('Check user level')
        .addUserOption(
            option => option
               .setName('user')
               .setDescription('The user you want to check')
               .setRequired(false)
        ),
    async execute(moi, args, client, { type, send }) {


        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Levelcmd.permission)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Permission
                    })
                ]
            }, true)
        }


        const user = await Utility.getUser(moi, type, args[0]) || moi.member.user;
        const level = await Utility.db.findOne('level', { id: user.id, guild: moi.guild.id });

        if(!level || !level.level) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                       ...Utility.lang.Levelcmd.nolevel,
                        variables: {
                            user: user.tag
                        }
                    })
                ]
            }, true)
        }

        const requireXp = level.level * 150 + (level.level * 15);
        const currentXp = level.currentXp;

        const xpToLevelUp = requireXp - currentXp;
        const percentageToLevelUp = (currentXp / requireXp) * 100

        send(type, moi, {
            embeds: [
                Utility.embed({
                   ...Utility.lang.Levelcmd.Embed,
                    variables: {
                        memberUsername: user.username,
                        memberId: user.id,
                        member: `<@${user.id}>`,
                        level: level.level,
                        xp: level.xp,
                        serverIcon: moi.guild.iconURL({ size: 1024 }),
                        userpfp: user.displayAvatarURL({ size: 1024 }),
                        neededXp: requireXp + '/' + level.currentXp,
                        percentage: Math.round(percentageToLevelUp, 2) + "%",
                        latestReward: Utility.clientConfig.Level.rewards[level.level]? Utility.clientConfig.Level.rewards[level.level] : Utility.lang.Levelcmd.norewards
                    }
                })
            ]
        }, true)
    }
}