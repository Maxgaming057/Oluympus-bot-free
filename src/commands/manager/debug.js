const { SlashCommandBuilder } = require("discord.js");
const fs = require('fs');
const Utility = require("../../../utils/modules/Utility");


module.exports = {
    category: 'management',
    aliases: ['dbg'],
    data: new SlashCommandBuilder()
        .setName('debug')
        .setDescription('Debug the bot'),
    async execute(moi, args, client, { type, send }) {
        if (moi.member.user.id != moi.guild.ownerId) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        ...Utility.lang.Permission,
                    })]
            })
        }

        const knownErrors = [
            'DiscordAPIError',
            'NetworkError',
            'WebSocketError',
            'RateLimitError',
            'PermissionError',
            'InvalidFormBody',
            'UnknownChannel',
            'UnknownGuild',
            'UnknownMember',
            'UnknownMessage',
            'UnknownPermissionOverwrite',
            'UnknownRole',
            'UnknownUser',
            'UnknownInteraction',
            'MissingAccess',
            'InvalidToken',
            'RequestEntityTooLarge',
            'AuthenticationFailed',
            'InvalidWebhookToken',
            'UnknownWebhook',
            'WebhookRateLimited',
            'BotBannedFromGuild',
            'InvalidAction',
            'ShardDisconnected',
            'ShardingRequired',
            'InteractionFailed',
            'MessageBulkDeleteError',
            'ReferenceError'
        ];
    

        const file = fs.readFileSync('./utils/handlers/errors.txt', 'utf-8');
        const errorsInFile = findErrors(file, knownErrors);
        if(errorsInFile.length === 0) {
            return send(type, moi, {
                embeds: [
                    Utility.embed({
                        title: '✅ No errors found',
                        description: 'There are no errors in the error file.',
                        color: 'success'
                    })]
            })
        }

        const fields = errorsInFile.map((error) => {
            return {
                name: error.error,
                value: error.solution,
                inline: false
            }
        })
        
        return send(type, moi, {
            embeds: [
                Utility.embed({
                    title: '❌ Errors',
                    fields: fields,
                    color: 'error',
                    fields: fields
                })]
        })

    }
}


function findErrors(fileContent, errorList) {
    const foundErrors = [];

    const errorSolutions = {
        DiscordAPIError: "Check the Discord API documentation for the specific error message.",
        NetworkError: "Ensure your bot has a stable internet connection.",
        WebSocketError: "Ensure your bot is properly handling WebSocket connections.",
        RateLimitError: "Implement rate limit handling to avoid hitting rate limits.",
        PermissionError: "Ensure your bot has the necessary permissions.",
        InvalidFormBody: "Check the structure of the request body being sent.",
        UnknownChannel: "Verify the channel ID or name.",
        UnknownGuild: "Verify the guild ID.",
        UnknownMember: "Ensure the member ID is correct.",
        UnknownMessage: "Check if the message ID is valid.",
        UnknownPermissionOverwrite: "Ensure the permission overwrite ID is correct.",
        UnknownRole: "Verify the role ID.",
        UnknownUser: "Check the user ID.",
        UnknownInteraction: "Ensure the interaction ID is correct.",
        MissingAccess: "Check if the bot has access to the resource.",
        InvalidToken: "Verify the bot token is correct.",
        RequestEntityTooLarge: "Reduce the size of the request payload.",
        AuthenticationFailed: "Check login credentials.",
        InvalidWebhookToken: "Verify the webhook token.",
        UnknownWebhook: "Check the webhook ID.",
        WebhookRateLimited: "Handle webhook rate limits properly.",
        BotBannedFromGuild: "Contact the guild administrators.",
        InvalidAction: "Check the action being performed.",
        ShardDisconnected: "Handle shard reconnections properly.",
        ShardingRequired: "Implement sharding for large bots.",
        InteractionFailed: "Ensure the interaction is processed correctly.",
        MessageBulkDeleteError: "Check the message IDs and ensure the bot has the proper permissions.",
        ReferenceError: "Undefined action has occured."
    }
    
    errorList.forEach(error => {
        if (fileContent.includes(error)) {
            foundErrors.push({ error: error, solution: errorSolutions[error] });
        }
    });

    return foundErrors;
}