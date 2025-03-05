const { SlashCommandBuilder, ChannelType, MessageFlags, EmbedBuilder } = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const chatAISchema = require('../../schemas/chatAIDB');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chat-ai')
        .setDescription('Manage chat AI configurations')
        .addSubcommand(subcommand =>
            subcommand
                .setName('configure')
                .setDescription('Configure channels for different AI models')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Select the channel for the model')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('model')
                        .setDescription('Choose the AI model to configure')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Llama', value: 'llama' },
                            { name: 'Gemini', value: 'gemini' },
                            { name: 'Claude', value: 'claude' },
                            { name: 'Grok 2 Mini', value: 'grok-2-mini' },
                            { name: 'Grok 2', value: 'grok-2' },
                            { name: 'DeepSeek R1', value: 'deepseek-r1' },
                            { name: 'DeepSeek V3', value: 'deepseek-v3' },
                            { name: 'GPT', value: 'gpt' },
                            { name: 'GPT-4', value: 'gpt4' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a chat AI configuration by ID')
                .addStringOption(option =>
                    option.setName('config-id')
                        .setDescription('The ID of the configuration to remove')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all model configurations for this server')),
        // botPermissions: ['SendMessages'],
        userPermissions: ['Administrator'],
        // ownerOnly: true,
        // devOnly: true,
        cooldown: 10,

    async execute(interaction, client) {
        if (interaction.options.getSubcommand() === 'configure') {
            const channel = interaction.options.getChannel('channel');
            const model = interaction.options.getString('model');
            const guildId = interaction.guild.id;

            const existingConfig = await chatAISchema.findOne({ guildId, model });
            const existingChannelConfig = await chatAISchema.findOne({ guildId, channelId: channel.id });

            if (existingConfig) {
                return interaction.reply({ content: `The model ${model} is already configured for this server.`, flags: MessageFlags.Ephemeral });
            }

            if (existingChannelConfig) {
                return interaction.reply({ content: `This channel is already configured for model ${existingChannelConfig.model}. Each channel can only be used for one model.`, flags: MessageFlags.Ephemeral });
            }

            const configId = uuidv4();
            const newConfig = new chatAISchema({ guildId, configId, model, channelId: channel.id });
            await newConfig.save();

            return interaction.reply({ content: `Model ${model} has been configured to use channel ${channel}. Configuration ID: ${configId}`, flags: MessageFlags.Ephemeral });
        } else if (interaction.options.getSubcommand() === 'remove') {
            const configId = interaction.options.getString('config-id');
            const guildId = interaction.guild.id;

            const existingConfig = await chatAISchema.findOne({ guildId, configId });

            if (!existingConfig) {
                return interaction.reply({ content: `No configuration found with ID ${configId}.`, flags: MessageFlags.Ephemeral });
            }

            await chatAISchema.deleteOne({ guildId, configId });

            return interaction.reply({ content: `Configuration with ID ${configId} has been removed.`, flags: MessageFlags.Ephemeral });
        } else if (interaction.options.getSubcommand() === 'list') {
            const guildId = interaction.guild.id;

            const configs = await chatAISchema.find({ guildId });

            if (configs.length === 0) {
                return interaction.reply({ content: 'No model configurations found for this server.', flags: MessageFlags.Ephemeral });
            }

            const embed = new EmbedBuilder()
                .setTitle('Model Configurations')
                .setDescription(`Model configurations for this server:`)
                .setColor('DarkRed');

            configs.forEach(config => {
                embed.addFields(
                    { name: 'Model', value: config.model, inline: true },
                    { name: 'Channel', value: `<#${config.channelId}>`, inline: true },
                    { name: 'Config ID', value: config.configId, inline: true },
                );
            });

            return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }
    }
};