const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { RSNCHAT_KEY } = require('../../config');
const { RsnChat } = require("rsnchat");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('imagine')
        .setDescription('Generate an image using AI')
        .addStringOption(option =>
            option.setName('prompt')
                .setDescription('What image would you like to generate?')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('model')
                .setDescription('Which AI model to use')
                .setRequired(true)
                .addChoices(
                    { name: 'Rsn Labs', value: 'rsnlabs' },
                    { name: 'Flux', value: 'flux' },
                    { name: 'Anime', value: 'anime' },
                    { name: 'Disney', value: 'disney' },
                    { name: 'Cartoon', value: 'cartoon' },
                    { name: 'Photography', value: 'photography' },
                    { name: 'Icon', value: 'icon' }
                )),
        // botPermissions: ['SendMessages'],
        // userPermissions: ['ManageMessages'],
        // ownerOnly: true,
        cooldown: 10,

    async execute(interaction, client) {
        await interaction.deferReply();

        const prompt = interaction.options.getString('prompt');
        const model = interaction.options.getString('model');
        const rsnchat = new RsnChat(RSNCHAT_KEY);

        let loading = '';
        const loadMessage = setInterval(() => {
            loading = loading.length >= 3 ? '' : loading + '.';
            interaction.editReply(`🎨 Generating your image... Please wait up to 5 minutes while I create your masterpiece${loading}`);
        }, 500);

        try {
            const response = await rsnchat.image(prompt, model);
            clearInterval(loadMessage);

            const embed = new EmbedBuilder()
                .setColor('Blue')
                .setTitle('Image Generated')
                .setDescription(`**Prompt:** ${prompt}\n**Model:** ${model}`)
                .setImage(response.image_url)
                .setFooter({ text: response.powered_by, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                .setTimestamp();

            await interaction.editReply({ content: '', embeds: [embed] });

        } catch (error) {
            clearInterval(loadMessage);
            console.error(error);
            await interaction.editReply({ content: 'There was an error generating your image. Please try again later.' });
        }
    }
};
