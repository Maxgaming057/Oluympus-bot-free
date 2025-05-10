const Database = require("../../../utils/database/OlympusDatabase");
const db = new Database()
module.exports = {
    name: 'voiceStateUpdate',
    once: false,
    id: 'voiceTime',

    async execute(oldState, newState) {

        if (!oldState.channel && newState.channel) {
            const hasData = await db.findOne('voice', { id: newState.member.user.id, guild: newState.guild.id });
            if (!hasData) {
                await db.insert('voice', {
                    id: newState.member.user.id.toString(),
                    guild: newState.guild.id.toString(),
                    time: 0,
                    connectTime: Date.now(),
                    leaveTime: 0
                });
            } else {
                await db.update('voice', {
                    connectTime: Date.now(),
                    leaveTime: 0
                }, { id: newState.member.user.id, guild: newState.guild.id });
            }
        }

        if (oldState.channel && !newState.channel) {
            const hasDataTime = await db.findOne('voice', { id: oldState.member.user.id, guild: oldState.guild.id });
            if (hasDataTime) {
                if (!hasDataTime.connectTime) return;
                const time = Date.now() - hasDataTime.connectTime;
                const getTime = hasDataTime.time + time;
                await db.update('voice', {
                    id: oldState.member.user.id.toString(),
                    guild: oldState.guild.id.toString(),
                    time: getTime,
                    connectTime: 0,
                    leaveTime: 0
                }, { id: oldState.member.user.id, guild: oldState.guild.id });
            }
        }
    }
};
