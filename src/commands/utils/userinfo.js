const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");
const ms = require("ms");

module.exports = {
    category: 'util',
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Get the info about the user!')
        .addUserOption(option => option.setName('user').setDescription('User you want to check!').setRequired(true)),
    async execute(moi, args, client, { type, send }) {

        const user = await Utility.getUser(moi, type, args[0]) ? await Utility.getUser(moi, type, args[0]) : moi.member.user;
        const member = await moi.guild.members.fetch(user.id);
        const roles = member.roles.cache.map(role =>  `<@&${role.id}>`).join(', ') || 'None';
        const created = Utility.formatTime('dmyhms', member.user.createdAt);
        const joined = Utility.formatTime('dmyhms', member.joinedAt);
        const messages = await Utility.db.findOne('messages', { userid: user.id });
        const coins = await Utility.db.findOne('economy', { userid: user.id });
        const voicetime = await Utility.db.findOne('voice', { id: user.id });
        const level = await Utility.db.findOne('level', { id: user.id });
        const lvl = level? level.level : 0;
        const msg = messages? messages.amount : 0;
        const vtime = voicetime? voicetime.time : '0s';
        const totalCoins = coins? coins.balance + coins.bank : 0;
        const bankCoins = coins? coins.bank : 0
        const pocketCoins = coins? coins.balance : 0

        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Userinfo.permissions)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...data.Permission
                    })
                ]
            }, true)
        }

        await send(type, moi, {
            embeds: [
                Utility.embed({
                    ...Utility.lang.Userinfo.Embed,
                    variables: {
                        memberId: member.user.id,
                        memberUsername: member.user.username,
                        memberAvatar: member.user.displayAvatarURL({ dynamic: true }),
                        memberCreated: created,
                        memberJoined: joined,
                        memberRoles: roles,
                        rolesSize: member.roles.cache.size,
                        messages: msg,
                        totalCoins: totalCoins,
                        bankCoins: bankCoins,
                        pocketCoins: pocketCoins,
                        voiceTime: ms(vtime),
                        level: lvl,
                        memberUser: `<@${user.id}>`,
                        memberStatus: member.permissions.has(PermissionFlagsBits.Administrator) ? 'Staff' : "Member",
                        serverIcon: moi.guild.iconURL({ size: 1024 }),
                        memberIcon: user.displayAvatarURL({ size: 1024 })
                    }
                })
            ]
        }, true)



    }
}