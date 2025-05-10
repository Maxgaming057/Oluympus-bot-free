async function generateTranscript(channel) {
    const messages = await channel.messages.fetch({ limit: 100 });

    let transcriptHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Transcript</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
    <style>
        body {
            background-color: #2c2f33;
            color: #dcddde;
            font-family: 'Roboto', sans-serif;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        .transcript-container {
            max-width: 1200px;
            margin: auto;
            background-color: #36393f;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        .server-name {
            font-size: 32px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 15px;
        }
        .channel-name {
            font-size: 28px;
            font-weight: 600;
            color: #99aab5;
            margin-bottom: 20px;
        }
        ul {
            list-style-type: none;
            padding: 0;
            margin: 0;
        }
        li {
            margin-top: 20px;
        }
        .message-header {
            display: flex;
            align-items: center;
        }
        .avatar {
            height: 50px;
            width: 50px;
            border-radius: 50%;
            margin-right: 15px;
            border: 2px solid #3c3c3c;
        }
        .username {
            font-size: 18px;
            font-weight: 600;
        }
        .userid {
            color: #b0b0b0;
            font-size: 14px;
            margin-left: 15px;
        }
        .timestamp {
            color: #b9bbbe;
            margin-left: auto;
            font-size: 14px;
        }
        .message-content {
            color: #dcddde;
            margin-left: 65px;
            margin-top: 10px;
            white-space: pre-wrap;
            word-break: break-word;
        }
        .embed-container {
            background-color: #2f3136;
            border-left: 4px solid #7289da;
            margin: 15px 0;
            padding: 15px;
            border-radius: 8px;
        }
        .embed-author {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        .embed-author-icon {
            height: 20px;
            width: 20px;
            border-radius: 50%;
            margin-right: 10px;
        }
        .embed-title {
            font-weight: 600;
            font-size: 18px;
            color: #ffffff;
            margin-bottom: 10px;
        }
        .embed-description {
            font-size: 16px;
            color: #ffffff;
        }
        .embed-field {
            margin-top: 10px;
        }
        .embed-field-name {
            font-weight: 600;
            color: #ffffff;
        }
        .embed-field-value {
            color: #dcddde;
        }
        .embed-image {
            max-width: 100%;
            border-radius: 8px;
            margin: 15px 0;
        }
        .embed-footer {
            display: flex;
            align-items: center;
            margin-top: 10px;
            position: relative;
            padding-bottom: 20px;
        }
        .embed-footer-icon {
            height: 20px;
            width: 20px;
            border-radius: 50%;
            margin-right: 10px;
        }
        .embed-footer-text {
            color: #ffffff;
        }
        .embed-footer-timestamp {
            position: absolute;
            bottom: 0;
            right: 0;
            color: #b9bbbe;
            font-size: 14px;
        }
        .reaction {
            margin-top: 5px;
            margin-left: 65px;
            display: flex;
            align-items: center;
        }
        .reaction-icon {
            height: 24px;
            width: 24px;
            margin-right: 5px;
        }
        .reaction-count {
            color: #b9bbbe;
        }
    </style>
</head>
<body>
    <div class="transcript-container">
        <p class="server-name">${channel.guild.name}</p>
        <p class="channel-name">${channel.name}</p>
        <ul>

        ${messages.map(message => {
            const highestRoleColor = message.member?.roles.highest?.color || '#ffffff';
            const content = message.content
                .replace(/<[^>]*>?/gm, '')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/__(.*?)__/g, '<u>$1</u>')
                .replace(/~~(.*?)~~/g, '<s>$1</s>')
                .replace(/```(.*?)```/gs, '<pre style="background-color: #2f3136; border-radius: 5px; padding: 15px; white-space: pre-wrap; word-wrap: break-word; margin-left: 65px; margin-top: 10px; color: #dcddde; font-family: \'Roboto\', monospace;">$1</pre>')
                .replace(/`([^`\n]+)`/g, '<code style="background-color: #2f3136; border-radius: 3px; padding: 2px 5px; color: #00bfae;">$1</code>')
                .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color: #00bfae; text-decoration: none;">$1</a>')
                .replace(/^>(.*)$/gm, '<span style="color: #b9bbbe; padding-left: 10px; border-left: 3px solid #b9bbbe; margin-left: 65px; font-style: italic;">&gt; $1</span>')
                .replace(/\n/g, '<br>');

            return `
                <li>
                    <div class="message-header">
                        <img src="${message.author.displayAvatarURL({ format: 'png', dynamic: true })}" alt="${message.author.username} avatar" class="avatar">
                        <span class="username" style="color: #${highestRoleColor.toString(16)};">${message.author.username}#${message.author.discriminator}</span>
                        <span class="userid">${message.author.id}</span>
                        <span class="timestamp">${message.createdAt.toLocaleString()}</span>
                    </div>
                    <p class="message-content">${content}</p>
                    ${message.embeds.map(embed => `
                        <div class="embed-container">
                            ${embed.author ? `<div class="embed-author">
                                <img src="${embed.author.iconURL}" alt="Author icon" class="embed-author-icon">
                                <span>${embed.author.name}</span>
                            </div>` : ''}
                            ${embed.title ? `<div class="embed-title">${embed.title}</div>` : ''}
                            ${embed.description ? `<div class="embed-description">${embed.description}</div>` : ''}
                            ${embed.fields.map(field => `
                                <div class="embed-field">
                                    <div class="embed-field-name">${field.name}</div>
                                    <div class="embed-field-value">${field.value}</div>
                                </div>`).join('')}
                            ${embed.image ? `<div class="embed-image"><img src="${embed.image.url}" alt="Embed image"></div>` : ''}
                            ${embed.thumbnail ? `<div class="embed-image"><img src="${embed.thumbnail.url}" alt="Embed thumbnail"></div>` : ''}
                            ${embed.footer ? `<div class="embed-footer">
                                <img src="${embed.footer.iconURL}" alt="Footer icon" class="embed-footer-icon">
                                <span class="embed-footer-text">${embed.footer.text}</span>
                                ${embed.timestamp ? `<span class="embed-footer-timestamp">${embed.timestamp}</span>` : ''}
                            </div>` : ''}
                        </div>
                    `).join('')}
                    ${message.reactions.cache.map(reaction => `
                        <div class="reaction">
                            <img src="${reaction.emoji.url}" alt="Reaction" class="reaction-icon">
                            <span class="reaction-count">${reaction.count}</span>
                        </div>
                    `).join('')}
                </li>
            `;
        }).join('')}

        </ul>
    </div>
</body>
</html>`;

    return transcriptHTML;
}

module.exports = { generateTranscript };
