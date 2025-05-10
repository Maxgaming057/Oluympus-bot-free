const InvitesTracker = require('@androz2091/discord-invites-tracker');
const Database = require('../database/OlympusDatabase');
const db = new Database()
const fs = require('fs');
const yaml = require('js-yaml');
const embed = require('./embed');
const content = fs.readFileSync('./config/messages.yml', 'utf-8');
const data = yaml.load(content);
module.exports = async (client) => {
    const tracker = InvitesTracker.init(client, {
        fetchGuilds: true,
        fetchVanity: true,
        fetchAuditLogs: true
    });

    tracker.on('guildMemberAdd', async (member, type, invite) => {

        const config = data.Invites

        const welcomeChannel = member.guild.channels.cache.find((c) => c.name === config.channel) || member.guild.channels.cache.get(config.channel)

        if (type === 'normal') {

            const invited = await db.findOne('invite', { id: invite.inviter.id, guild: member.guild.id })

            let inviteToAdd = member.user.id;

            if (!invited) {
                await db.insert('invite', { id: invite.inviter.id, guild: member.guild.id, real: JSON.stringify([inviteToAdd]), fake: JSON.stringify([]), bonus: 0 })
                if(welcomeChannel) {
                    welcomeChannel.send({embeds: [
                        embed({
                            ...config.normal,
                            variables: {
                                memberUser: `<@${member.user.id}>`,
                                memberpfp: member.user.displayAvatarURL({ size: 1024 }),
                                servericon: member.guild.iconURL({ size: 1024 }),
                                memberUsername: member.user.username,
                                memberId: member.user.id,
                                inviterUser: `<@${invite.inviter.id}>`,
                                inviterpfp: invite.inviter.displayAvatarURL({ size: 1024 }),
                                inviterUsername: invite.inviter.username,
                                inviterId: invite.inviter.id,
                            }
                        })
                    ]})
                }
                return;
            }

            const real = JSON.parse(invited.real || "[]")
            const fake = JSON.parse(invited.fake || "[]")



            if (real.length < 1 || real && !real.includes(member.user.id)) {
                real.push(inviteToAdd);
                await db.update('invite', { real: JSON.stringify(real), fake: JSON.stringify(fake) }, { id: invite.inviter.id, guild: member.guild.id })
                if(welcomeChannel) {
                    welcomeChannel.send({embeds: [
                        embed({
                            ...config.normal,
                            variables: {
                                memberUser: `<@${member.user.id}>`,
                                memberpfp: member.user.displayAvatarURL({ size: 1024 }),
                                servericon: member.guild.iconURL({ size: 1024 }),
                                memberUsername: member.user.username,
                                memberId: member.user.id,
                                inviterUser: `<@${invite.inviter.id}>`,
                                inviterpfp: invite.inviter.displayAvatarURL({ size: 1024 }),
                                inviterUsername: invite.inviter.username,
                                inviterId: invite.inviter.id,
                            }
                        })
                    ]})
                }
                return;
            }

            if (real.includes(inviteToAdd)) {
                fake.push(inviteToAdd);
                await db.update('invite', { real: JSON.stringify(real), fake: JSON.stringify(fake) }, { id: invite.inviter.id, guild: member.guild.id })
                if(welcomeChannel) {
                    welcomeChannel.send({embeds: [
                        embed({
                            ...config.rejoin,
                            variables: {
                                memberUser: `<@${member.user.id}>`,
                                memberpfp: member.user.displayAvatarURL({ size: 1024 }),
                                servericon: member.guild.iconURL({ size: 1024 }),
                                memberUsername: member.user.username,
                                memberId: member.user.id,
                                inviterUser: `<@${invite.inviter.id}>`,
                                inviterpfp: invite.inviter.displayAvatarURL({ size: 1024 }),
                                inviterUsername: invite.inviter.username,
                                inviterId: invite.inviter.id,
                            }
                        })
                    ]})
                }
                return
            }

        }

        else if (type === 'vanity') {
            if(welcomeChannel) {
                welcomeChannel.send({embeds: [
                    embed({
                        ...config.vanity,
                        variables: {
                            memberUser: `<@${member.user.id}>`,
                            memberpfp: member.user.displayAvatarURL({ size: 1024 }),
                            servericon: member.guild.iconURL({ size: 1024 }),
                            memberUsername: member.user.username,
                            memberId: member.user.id,
                        }
                    })
                ]})
            }
        }

        else if (type === 'permissions') {
            if(welcomeChannel) {
                welcomeChannel.send({embeds: [
                    embed({
                        ...config.permission,
                        variables: {
                            memberUser: `<@${member.user.id}>`,
                            memberpfp: member.user.displayAvatarURL({ size: 1024 }),
                            servericon: member.guild.iconURL({ size: 1024 }),
                            memberUsername: member.user.username,
                            memberId: member.user.id,
                        }
                    })
                ]})
            }
        }

        else if (type === 'unknown') {
            if(welcomeChannel) {
                welcomeChannel.send({embeds: [
                    embed({
                        ...config.unknown,
                        variables: {
                            memberUser: `<@${member.user.id}>`,
                            memberpfp: member.user.displayAvatarURL({ size: 1024 }),
                            servericon: member.guild.iconURL({ size: 1024 }),
                            memberUsername: member.user.username,
                            memberId: member.user.id,
                        }
                    })
                ]})
            }
        }

    })
}