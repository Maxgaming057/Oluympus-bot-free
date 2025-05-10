const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");

module.exports = {
    category: 'general',
    aliases: ['inv', 'invited'],
    data: new SlashCommandBuilder()
        .setName('invites')
        .setDescription('Check user invites')
        .addUserOption(
            option => option
               .setName('user')
               .setDescription('The user you want to check')
               .setRequired(false)
        ),
    async execute(moi, args, client, { type, send }) {
        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.InvitesCmd.permission)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Permission
                    })
                ]
            }, true);
        }

        const user = await Utility.getUser(moi, type, args[0]) || moi.member.user;
        const invites = await Utility.db.findOne('invite', { id: user.id, guild: moi.guild.id });

        if (!invites) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                       ...Utility.lang.InvitesCmd.NoInvites,
                        variables: {
                            memberUsername: user.username,
                            memberId: user.id,
                            member: `<@${user.id}>`,
                            serverIcon: moi.guild.iconURL({ size: 1024 }),
                            memberpfp: user.displayAvatarURL({ size: 1024 }),
                            server: moi.guild.name
                        }
                    })
                ]
            });
        }
        
        const realInvites = JSON.parse(invites.real);
        const fakeInvites = JSON.parse(invites.fake);

        send(type, moi, {
            embeds: [
                Utility.embed({
                   ...Utility.lang.InvitesCmd.Embed,
                    variables: {
                        memberUsername: user.username,
                        memberId: user.id,
                        member: `<@${user.id}>`,
                        serverIcon: moi.guild.iconURL({ size: 1024 }),
                        memberpfp: user.displayAvatarURL({ size: 1024 }),
                        server: moi.guild.name,
                        real: realInvites.length,
                        fake: fakeInvites.length,
                        bonus: invites.bonus,
                        total: realInvites.length + fakeInvites.length
                    }
                })
            ]
        });
    }
};
