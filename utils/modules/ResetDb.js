const client = require('../..');
const db = require('../database/db');
const { reloadBot } = require('../handlers/reloadbot');
const sqlite3 = require('sqlite3').verbose();

async function ResetDatabase(dbPath) {
    return new Promise((resolve, reject) => {
        const dbd = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                return reject(err);
            }
        });

        dbd.serialize(() => {
            dbd.all("SELECT name FROM sqlite_master WHERE type='table';", async (err, tables) => {
                if (err) {
                    dbd.close();
                    return reject(err);
                }

                dbd.exec('PRAGMA foreign_keys = OFF;', async (err) => {
                    if (err) {
                        dbd.close();
                        return reject(err);
                    }

                    for (const table of tables) {
                        const tableName = table.name;

                        if (tableName.startsWith('sqlite_')) {
                            continue;
                        }

                        await new Promise((resolve, reject) => {
                            dbd.run(`DROP TABLE IF EXISTS ${tableName}`, (err) => {
                                if (err) {
                                    console.error(`Failed to drop table ${tableName}:`, err.message);
                                    reject(err);
                                } else {
                                    console.log(`Table ${tableName} dropped successfully.`);
                                    resolve();
                                }
                            });
                        });
                    }

                    try {
                        await db();
                        await reloadBot(client)
                    } catch (err) {
                        dbd.close();
                        return reject(err);
                    }

                    dbd.exec('PRAGMA foreign_keys = ON;', (err) => {
                        if (err) {
                            console.error("Failed to re-enable foreign keys:", err.message);
                        }

                        dbd.close((err) => {
                            if (err) {
                                return reject(err);
                            }
                            resolve();
                        });
                    });
                });
            });
        });
    });
}

module.exports = {
    ResetDatabase
};
