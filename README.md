# Monno, a simple to use discord.js bot framework

## Install Monno

`npm install monno`

`yarn add monno`

## Features and pros of Monno

-   Easy to use command framework
-   Revolutionary concept of extensions that allow you to split your bot into multiple parts or to easily register third party extensions
-   Development mode where the commands are only accessible to the bot owner
-   No faffing around with boring internals, just jump right in and start coding!

## Example index file

```ts
import monno from "monno"

monno({
    ownerID: "12345678901234567",
    testGuildID: "12345678901234567",
    dev: true,
    token: "👀",
    extensions: [
        {
            name: "helloWorld",
            commands: [
                {
                    name: "helloWorld",
                    description: "Say hello to the world",
                    async run(interaction) {
                        interaction.reply("Hello world!")
                    },
                },
            ],
        },
    ],
    intents: [],
})
```
