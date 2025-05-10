const Database = require("../../../utils/database/OlympusDatabase");
const db = new Database();
const fs = require('fs');
const yaml = require('js-yaml');
const embed = require("../../../utils/modules/embed");
const ms = require("ms");
const { foundRole } = require("../../../utils/modules/utils");

const content = fs.readFileSync('./config/messages.yml', 'utf-8');
const data = yaml.load(content);

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction, client) {
        if (!interaction.isButton()) return;
        if (!interaction.guild) return;

        if (interaction.customId !== 'entergw') return;
        await interaction.deferReply({ ephemeral: true })
        const gw = await db.findOne('giveaway', { id: interaction.message.id });
        if (!gw) {
            interaction.message.edit({ components: [ ]})
            return interaction.editReply({
                embeds: [
                    embed({
                        title: 'Database could not find this giveaway anymore!',
                        color: 'error'
                    })
                ],
                ephemeral: true
            })
        }

        const requ = JSON.parse(gw.require || '[]');
        const users = JSON.parse(gw.users);

        if (users.includes(interaction.user.id)) {
            interaction.editReply({
                embeds: [
                    embed(data.Giveaway.AlreadyEntered)
                ],
                ephemeral: true
            });
            return;
        }
        let canEnter = true;
        let missing = [];

        for (const req of requ) {
            const type = req.type;
            const amount = req.amount;

            if (type === 'messages') {
                const messages = await db.findOne('messages', { userid: interaction.user.id });
                if (!messages || messages.amount < amount) {
                    canEnter = false;
                    missing.push(`Messages ${amount}`);
                }
            } else if (type === 'level') {
                const lvl = await db.findOne('level', { id: interaction.user.id });
                if (!lvl || lvl.level < amount) {
                    canEnter = false;
                    missing.push(`Level ${amount}`);
                }
            } else if (type === 'voice') {
                const vc = await db.findOne('voice', { id: interaction.user.id });
                if (!vc || vc.time < ms(amount)) {
                    canEnter = false;
                    missing.push(`Voice ${amount}`);
                }
            } else if (type === 'role') {
                let rol = await foundRole(interaction.guild, amount)
                if (!rol || !interaction.member.roles.cache.has(rol.id)) {
                    canEnter = false;
                    missing.push(`Role <@&${amount}>`);
                }
            } else if (type === 'xp') {
                const lvl = await db.findOne('level', { id: interaction.user.id });
                if (!lvl || lvl.xp < amount) {
                    canEnter = false;
                    missing.push(`Xp ${amount}`);
                }
            } else if (type === 'coins') {
                const coins = await db.findOne('economy', { userid: interaction.user.id });
                if (!coins || (coins.balance + coins.bank) < amount) {
                    canEnter = false;
                    missing.push(`Coins ${amount}`);
                }
            } else if (type === 'invites') {
                const inv = await db.findOne('invite', { id: interaction.user.id });

                if(inv) {
                    const invreal = JSON.parse(inv.real || '[]');
                    if (invreal.length < amount) {
                        canEnter = false;
                        missing.push(`Invites ${amount}`);
                    } else {
                        canEnter = true;
                    }
                } else {
                    canEnter = false;
                    missing.push(`Invites ${amount}`);
                }
            }
        }

        if (!canEnter) {
            interaction.editReply({
                embeds: [
                    embed({
                        ...data.Giveaway.Noreq,
                        variables: {
                            requirement: missing.join(', ')
                        }
                    })
                ],
                ephemeral: true
            });
            return;
        }
        users.push(interaction.user.id);
        await db.update('giveaway', { users: JSON.stringify(users) }, { id: interaction.message.id });

        interaction.editReply({
            embeds: [
                embed(data.Giveaway.Enter)
            ],
            ephemeral: true
        });
    }
};