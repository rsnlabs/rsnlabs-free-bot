const { EmbedBuilder } = require('discord.js');
const { RSNCHAT_KEY } = require('../../config');
const { RsnChat } = require("rsnchat");
const chatAISchema = require('../../schemas/chatAIDB');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (!message.guild || message.author.bot) return;

        message.content = message.content.replace(/<@\d+>/g, "");

        const chatAI = await chatAISchema.findOne({ guildId: message.guild.id, channelId: message.channel.id });

        if (!chatAI) return;

        const rsnchat = new RsnChat(RSNCHAT_KEY);

        message.channel.sendTyping();

        const sendTypingInterval = setInterval(() => {
            message.channel.sendTyping();
        }, 5000);

        try {

            clearInterval(sendTypingInterval);

            const response = await rsnchat.chat(message.content, chatAI.model);

            if (!response || !response.message) {
                throw new Error("Invalid API response");
            }

            const responseMessage = response.message;
            const chunkSizeLimit = 2000;

            for (let i = 0; i < responseMessage.length; i += chunkSizeLimit) {
                const chunk = responseMessage.substring(i, i + chunkSizeLimit);
                await message.reply(chunk);
            }
        } catch (error) {
            clearInterval(sendTypingInterval);
            console.error("API error:", error);
        }
    },
}
