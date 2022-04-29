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

## Disclaimer:

It is not advised to run this package for complex bots in large amounts of servers. You are going to end up fighting with this package and at that scale it is better to make your own equivalent of this that matches your needs. 

## Simple hello world project

```ts
import { Monno } from "monno"

const client = new Monno({
    dev: true,
    developerIDs: ["12345678901234567"],
    devGuildID: "12345678901234567",
    intents: []
})

client.slashCommands.add({
    name: "helloworld",
    description: "Says hello to the world",
    run: async interaction => {
        interaction.reply("Hello, World!")
    },
})

client.start("<TOKEN>")
```
