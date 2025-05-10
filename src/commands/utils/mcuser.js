const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");
const { default: axios } = require("axios");

module.exports = {
    category: 'util',
    data: new SlashCommandBuilder()
        .setName('mcuser')
        .setDescription('Get info for mc user')
        .addStringOption(option => option.setName('user').setDescription('User you want to check!').setRequired(true)),
    async execute(moi, args, client, { type, send }) {

        const user = type === 'interaction' ? moi.options.getString('user') : args[0];
        if (!user) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Usage,
                        variables: {
                            usage: `${await Utility.getPrefix(moi.guild.id)}mcuser [user]`
                        }
                    })
                ]
            })
        }

        const username = user;
        axios.post('https://api.mojang.com/profiles/minecraft', [username], {
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                const playerId = response.data[0].id;
                axios.get(`https://sessionserver.mojang.com/session/minecraft/profile/${playerId}`)
                    .then(response => {
                        const textures = response.data.properties[0].value;
                        const decodedTextures = JSON.parse(Buffer.from(textures, 'base64').toString('utf-8'));

                        return send(type, moi, {
                            embeds: [
                                Utility.embed({
                                    ...Utility.lang.Mcuser.Embed,
                                    variables: {
                                        profileName: decodedTextures.profileName,
                                        profileId: decodedTextures.profileId,
                                        skinUrl: decodedTextures.textures.SKIN.url,
                                        timestamp: Utility.formatTime('dms', decodedTextures.timestamp),
                                        serverIcon: moi.guild.iconURL({ size: 1024 })
                                    }
                                })
                            ]
                        }, true);
                    })
                    .catch(error => {
                        return send(type, moi, {
                            embeds: [
                                Utility.embed({
                                    ...Utility.lang.Mcuser.Nouser,
                                    variables: {
                                        user: user
                                    }
                                })
                            ]
                        }, true);
                    });
            })
            .catch(error => {
                return send(type, moi, {
                    embeds: [
                        Utility.embed({
                            ...Utility.lang.Mcuser.Nouser,
                            variables: {
                                user: user
                            }
                        })
                    ]
                }, true);
            });
    }

}