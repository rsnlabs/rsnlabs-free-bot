const mongoose = require('mongoose');

const chatAISchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true
    },
    configId: {
        type: String,
        required: true,
        unique: true
    },
    model: {
        type: String,
        required: true
    },
    channelId: {
        type: String,
        required: true
    }
});

module.exports = mongoose.models.chatAI || mongoose.model('chatAI', chatAISchema);