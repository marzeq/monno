import monno from "monno"

monno({
    ownerID: "12345678901234567",
    devGuildID: "12345678901234567",
    token: "...",
    dev: false,
    intents: [],
    extensions: [{
        name: "youSaid",
        commands: [{
            name: "youSaid",
            description: "You said something",
            options: [{
                name: "message",
                description: "The message you said",
                type: "STRING",
                required: true
            }],
            async run(interaction) {
                interaction.reply(`You said: ${interaction.options.getString("message", true)}`)
            }
        }]
    }]
})
