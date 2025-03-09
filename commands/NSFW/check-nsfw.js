const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { RSNCHAT_KEY } = require('../../config');
const { RsnChat } = require("rsnchat");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('check-nsfw')
        .setDescription('Check if an image is NSFW')
        .addStringOption(option =>
            option.setName('image_url')
                .setDescription('URL of the image to check')
                .setRequired(true)),
        cooldown: 10,

    async execute(interaction, client) {
        await interaction.deferReply();

        const image_url = interaction.options.getString('image_url');
        const rsnchat = new RsnChat(RSNCHAT_KEY);

        let loading = '';
        const loadMessage = setInterval(() => {
            loading = loading.length >= 3 ? '' : loading + '.';
            interaction.editReply(`🔍 Checking image content... Please wait${loading}`);
        }, 500);

        try {
            const response = await rsnchat.checkNSFW(image_url);
            clearInterval(loadMessage);
            
            const embed = new EmbedBuilder()
                .setColor(response.nsfw ? 'Red' : 'Green')
                .setTitle('NSFW Check Result')
                .setDescription(`**Image URL:** ${image_url}\n**Is NSFW:** ${response.nsfw ? 'Yes' : 'No'}`)
                .setImage(image_url)
                .setFooter({ text: response.powered_by, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                .setTimestamp();

            await interaction.editReply({ content: '', embeds: [embed] });
        } catch (error) {
            clearInterval(loadMessage);
            await interaction.editReply('❌ Failed to check image. Please ensure the URL is valid and try again.');
            console.error(error.message);
        }
    }
};
