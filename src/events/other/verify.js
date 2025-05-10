const Utility = require("../../../utils/modules/Utility");

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if(interaction.isButton() && interaction.customId === 'verify') {

            await interaction.deferReply({ ephemeral: true })

            for (const roleAdd of Utility.clientConfig.Verification.Giveroles) {
                const role = await Utility.findRole(interaction.guild, roleAdd);
                if(role && !interaction.member.roles.cache.has(role.id)) {
                    await interaction.member.roles.add(role.id).catch((e) => {
                        Utility.log('error', 'Verification ' + e)
                    })
                }
                
            }

            for (const roleRemove of Utility.clientConfig.Verification.Takeroles) {
                const role = await Utility.findRole(interaction.guild, roleRemove);
                if(role && interaction.member.roles.cache.has(role.id)) {
                    await interaction.member.roles.remove(role.id).catch((e) => {
                        Utility.log('error', 'Verification ' + e)
                    })
                }
                
            }
            
            await interaction.editReply({
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Verification.Response,
                        variables: {
                            memberUser: `<@${interaction.user.id}>`,
                            memberUsername: interaction.user.username,
                            memberAvatar: interaction.user.displayAvatarURL({ size: 1024 }),
                            memberId: interaction.user.id,
                            serverIcon: interaction.guild.iconURL({ size: 1024 }),
                            serverName: interaction.guild.name
                        }
                    })
                ], ephemeral: true
            })
        }
    }
}