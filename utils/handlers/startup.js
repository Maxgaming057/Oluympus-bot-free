const fs = require('fs');
const yaml = require('yaml');
const events = require('../handlers/events');
const commands = require('../handlers/commands'); 
const Utility = require('../modules/Utility');
const music = require('./music');

module.exports = async (client) => {
    await client.guilds.cache.clear();
    process.removeAllListeners();

    // Config dosyasını oku
    const configFile = fs.readFileSync('./config/config.yml', 'utf8');
    const config = yaml.parse(configFile);

    
    // Gerekli klasörlerin kontrolü ve oluşturulması
    const requiredFolders = ['./database', './database/cooldowns', './database/guilds'];
    
    for (const folder of requiredFolders) {
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
            Utility.log('Folder Check', `[ ${folder.slice(2).toUpperCase()} ] folder created`);
        }
    }

    // Event ve komut yükleyicileri
    await events(client);
    await commands(client);
    await music(client)
    // Başarılı başlatma
    return {
        success: true
    };

};