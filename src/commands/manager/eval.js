const { SlashCommandBuilder } = require("discord.js");
const Utility = require("../../../utils/modules/Utility");

module.exports = {
    category: 'management',
    data: new SlashCommandBuilder()
        .setName('eval')
        .setDescription('Evaluate code!')
        .addStringOption(option => option
            .setName('code')
            .setDescription('The code you want to evaluate!')
            .setRequired(true)
        ),
    async execute(moi, args, client, { type, send }) {
        if (!Utility.permission(moi.member, moi.guild, Utility.clientConfig.Eval.permission)) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Permission
                    })
                ]
            }, true);
        }

        const code = type === 'message' ? args.slice(0).join(' ') : moi.options.getString('code');
        if (!code) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Usage,
                        variables: {
                            usage: `${await Utility.getPrefix(moi.guild.id)}eval [code]`
                        }
                    })
                ]
            }, true);
        }

        if(code.includes('token')) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Eval.Embed,
                        variables: {
                            output: 'Token found!',
                            input: code
                        }
                    })
                ]
            }, true);
        }

        let result;
        try {
            result = eval(code);
            // Check if result is a Promise
            if (result instanceof Promise) {
                result = await result;
            }
        } catch (error) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Eval.Embed,
                        variables: {
                            output: `Error: ${error}`,
                            input: code
                        }
                    })
                ]
            }, true);
        }

        if (typeof result === 'undefined') {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Eval.Embed,
                        variables: {
                            output: 'Undefined',
                            input: code
                        }
                    })
                ]
            }, true);
        }

        return send(type, moi, {
            embeds: [
                Utility.embed({
                   ...Utility.lang.Eval.Embed,
                    variables: {
                        output: result == 'Undefined' ? '✅ Success' : result,
                        input: code
                    }
                })
            ]
        }, true);
    }
};
