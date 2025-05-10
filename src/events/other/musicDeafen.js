const { Events } = require('discord.js');
const Utility = require('../../../utils/modules/Utility');
const client = require('../../..');

module.exports = {
    name: Events.VoiceStateUpdate,
    once: false,
    async execute(oldState, newState) {
        const botId = client.user.id;
        
        if (newState.id === botId) {
            const player = client.music.players.get(newState.guild.id);

            if (newState.serverDeaf) {
                await player.pause(true);
                Utility.log('info', `${client.user.username} has paused the music player! Reason: Server Deafened`);

            } 

            if (!newState.serverDeaf && oldState.serverDeaf) {
                await player.pause(false);
                Utility.log('info', `${client.user.username} has resumed the music player! Reason: Server Undeafened`);
            }
        }
    }
};
