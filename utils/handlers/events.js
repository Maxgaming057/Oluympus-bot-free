const chalk = require('chalk');
const { Collection } = require('discord.js');
const fs = require('fs');

module.exports = async client => {
    // Events klasörünü oku
    const eventFiles = fs.readdirSync('./src/events');
    const events = [];

    // Her bir event klasörü için
    for (const folder of eventFiles) {
        // Event dosyalarını oku
        const eventDirs = fs.readdirSync(`./src/events/${folder}`)
            .filter(file => file.endsWith('.js'));

        // Her bir event dosyası için
        for (const file of eventDirs) {
            // Event modülünü yükle
            const event = require(`../../src/events/${folder}/${file}`);
            // Event bir kez çalışacaksa
            if (event.once) {
                if (event.rest) {
                    client.rest.once(event.name, (...args) => 
                        event.execute(...args, client));
                } else {
                    client.once(event.name, (...args) => 
                        event.execute(...args, client));
                }
            }
            // Event sürekli çalışacaksa  
            else {
                if (event.rest) {
                    client.rest.on(event.name, (...args) => 
                        event.execute(...args, client));
                } else {
                    client.on(event.name, (...args) => 
                        event.execute(...args, client));
                }
            }

            events.push(event);
        }
    }

    // Event sayısını konsola yazdır
    console.log(
        chalk.bold.hex('#7299f8').hex('[ Events ]'),
        chalk.hex('#7299f8').hex(` > ${events.length > 1 ? events.length + ' event' : events.length + ' events'} loaded`)
    );
};