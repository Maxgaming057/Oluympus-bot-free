const { Poru } = require("poru");
const Utility = require("../modules/Utility");
module.exports = async (client) => {
    try {
        const nodes = [
            {
                name: Utility.clientConfig.Music.Host.name,
                host: Utility.clientConfig.Music.Host.host,
                port: Utility.clientConfig.Music.Host.port,
                password: Utility.clientConfig.Music.Host.password,
            },
        ];

        const PoruOptions = {
            library: "discord.js",
            defaultPlatform: "ytsearch",
        };
        let poru = new Poru(client, nodes, PoruOptions);
        await poru.init(client)

        poru.on("trackStart", (player, track) => {
            const channel = client.channels.cache.get(player.textChannel);
            return channel.send({
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Music.Play.Nowplaying,
                        variables: {
                            track: track.info.title
                        }
                    })
                ]
            });
        })

        poru.on("queueEnd", (player) => {
            return player.destroy();
        })
        
        Utility.log('info', `[ Music Client ] Has been successfully connected to: ${Utility.clientConfig.Music.Host.host}`)
        client.music = poru;

    } catch (error) {
        if(error.message == 'Invalid URL: ws://:/v4/websocket') {
            return Utility.log('error', 'Invalid Lavalink provided, in order to use music please connect to Lavalink `./config/config.yml`')
        }
        Utility.log('error', error)
    }
}