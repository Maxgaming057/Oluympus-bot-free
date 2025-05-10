const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");

module.exports = {
    category: 'economy',
    aliases: ['wd'],
    data: new SlashCommandBuilder()
        .setName('withdraw')
        .setDescription('Withdraw coins from bank')
        .addStringOption(options => 
            options
                .setName('amount')
                .setDescription('The amount of coins you want to withdraw / all')
                .setRequired(true)
        ),
    async execute(moi, args, client, { type, send }) {

        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Withdraw.permissions)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Permission
                    })
                ]
            }, true);
        }

        const amount = type === 'message' ? args[0] : moi.options.getString('amount');
        const coins = await Utility.db.findOne('economy', { userid: moi.member.user.id });

        if (!amount) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Usage,
                        variables: {
                            usage: `${await Utility.getPrefix(moi.guild.id)}withdraw [amount]`
                        }
                    })
                ]
            }, true);
        }
        
        if(!coins) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Withdraw.Nocoins
                    })
                ]
            })
        }

        if (amount.toLowerCase() === 'all') {
            if (!coins || coins.bank === 0) {
                return send(type, moi, {
                    embeds: [
                        Utility.embed({
                            ...Utility.lang.Withdraw.Nocoins
                        })
                    ]
                }, true);
            }

            const balance = coins.balance + coins.bank;
            await Utility.db.update('economy', { bank: 0, balance: balance }, { userid: moi.member.user.id });

            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Withdraw.Embed,
                        variables: {
                            ...Utility.userVariables(moi.member),
                            ...Utility.serverVariables(moi.guild, 'server'),
                            coins: 'all'
                        }
                    })
                ]
            }, true);
        }

        if (isNaN(amount) || parseInt(amount) <= 0) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Usage,
                        variables: {
                            usage: `${await Utility.getPrefix(moi.guild.id)}withdraw [amount]`
                        }
                    })
                ]
            }, true);
        }

        const parsedAmount = parseInt(amount);
        if (parsedAmount > coins.bank) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Withdraw.Nocoins
                    })
                ]
            }, true);
        }

        const bank = coins.bank - parsedAmount;
        const balance = coins.balance + parsedAmount;
        await Utility.db.update('economy', { bank: bank, balance: balance }, { userid: moi.member.user.id });
        
        return send(type, moi, {
            embeds: [
                Utility.embed({
                    ...Utility.lang.Withdraw.Embed,
                    variables: {
                        ...Utility.userVariables(moi.member),
                        ...Utility.serverVariables(moi.guild, 'server'),
                        coins: parsedAmount
                    }
                })
            ]
        }, true);
    }
};
