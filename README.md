# Monno, a simple to use discord.js bot framework

## Install Monno

With npm:

`npm install monno`

Or with yarn:

`yarn add monno`

## Features and pros of Monno

-   Easy to use command framework
-   Revolutionary concept of extensions that allow you to split your bot into multiple parts or to easily register third party extensions
-   Maintains the true spirit of discord.js while allowing you to easily add features without having to work on boring internals

## Simple hello world project

```ts
import { Monno } from "monno"

const client = new Monno({
    ownerID: "12345678901234567",
    testGuildID: "12345678901234567",
    dev: true,
})

client.commands.add({
    name: "helloworld",
    description: "Says hello to the world",
    async run(interaction) {
        interaction.reply("Hello, World!")
    },
})

client.login("<TOKEN>")
```
