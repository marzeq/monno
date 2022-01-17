import { thirdPartyExtension, ThirdPartyExtensionData } from "./thirdPartyExtension"
import monno, { MonnoClient } from "monno"

monno({
    ownerID: "12345678901234567",
    devGuildID: "12345678901234567",
    token: "...",
    dev: false,
    intents: [],
    extensions: [thirdPartyExtension, { // its important you put the third party extension first, otherwise you won't be able to use the data
        name: "getData",
        commands: [{
            name: "getData",
            description: "Get data from the third party extension",
            options: [{
                name: "key",
                description: "Key",
                type: "STRING",
                required: true
            }],
            async run(interaction) {
                const client = interaction.client as MonnoClient,
                    data = client.extensions.data<ThirdPartyExtensionData>("thirdPartyExtension")[interaction.options.getString("key")]

                interaction.reply(data)
            }
        }]
    }]
})
