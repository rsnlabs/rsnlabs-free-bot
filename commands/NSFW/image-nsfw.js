const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { RSNCHAT_KEY } = require('../../config');
const { XHub } = require("xhub-ai");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('imagine-nsfw')
        .setDescription('Generate an NSFW image')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('What type of image would you like to generate?')
                .setRequired(true)
                .addChoices(
                    { name: 'Hentai', value: 'hentai' },
                    { name: 'Real', value: 'real' },
                    { name: 'Pussy', value: 'pussy' },
                    { name: 'Anal', value: 'anal' },
                    { name: 'Boobs', value: 'boobs' },
                    { name: 'Cum', value: ' cum' },
                )),
        // botPermissions: ['SendMessages'],
        // userPermissions: ['ManageMessages'],
        // ownerOnly: true,
        cooldown: 10,

    async execute(interaction, client) {
        await interaction.deferReply();

        if (!interaction.channel.nsfw) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription('❌ | This command can only be used on NSFW channels (+18 channels).')
            
            return await interaction.editReply({  embeds: [embed] });
        }

        const xhub = new XHub(RSNCHAT_KEY);
        const type = interaction.options.getString('type');

        let loading = '';
        const loadMessage = setInterval(() => {
            loading = loading.length >= 3 ? '' : loading + '.';
            interaction.editReply(`🔞 Generating your NSFW image... Please wait${loading}`);
        }, 500);

        try {
            const response = await xhub.fetch(type);
            clearInterval(loadMessage);
            
            const embed = new EmbedBuilder()
                .setColor('#FF69B4')
                .setTitle('NSFW Content')
                .setDescription(`**Type:** ${response.image.type}`)
                .setImage(response.image.url)
                .setFooter({ text: response.powered_by, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                .setTimestamp();

            await interaction.editReply({ content: '', embeds: [embed] });
        } catch (error) {
            clearInterval(loadMessage);
            await interaction.editReply('❌ Failed to generate image. Please try again later.');
            console.error(error.message);
        }
    }
};
