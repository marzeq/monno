# 01. Getting started

## 01.1. Introduction

Monno is a simple and easy to use discord.js bot framework. It has a robust slash commands and extensions system, and allows you to create your own bot in a matter of minutes.

## 01.2. Creating a new project

To create a new monno project, run the following commands:

```sh
mkdir my-project
cd my-project
npm install monno
# or if you use yarn: `yarn add monno`
```

## 01.3. Setup TypeScript

Now that we have our project created, we can create a file that will be our entry point for our bot.

We strongly recommend using TypeScript, but if you prefer JavaScript, you can use it. (However, this tutorial will be using TypeScript.)

Do the following to setup TypeScript in your project:

-   Install the TypeScript compiler globally with `npm install -g typescript` (or `yarn global add typescript` if you use yarn) if you haven't already
-   Create a `tsconfig.json` file in the root of your project
-   Add the following code to the file:

```json
{
    "compilerOptions": {
        "target": "es2021",
        "module": "commonjs",
        "declaration": true,
        "outDir": "./dist",
        "esModuleInterop": true,
        "forceConsistentCasingInFileNames": true,
        "strict": true,
        "skipLibCheck": true
    },
    "exclude": ["node_modules"],
    "include": ["src/**/*"]
}
```

-   Create a new directory called `src` and inside it create a file called `index.ts`
-   Add the following code to the file:

```ts
import { Monno } from "monno"

const client = new Monno({
    ownerID: "<your user ID>",
    testGuildID: "<your guild ID>",
    dev: true, // you should use something like process.env.NODE_ENV === "development" instead,
    // but this fine for the tutorial
})

client.start("<your bot token>")
```

-   Compile the code with `tsc`
-   Run the compiled code with `node dist/index.js` and see if the bot goes online.

## 01.4. Creating a simple command

Add the following code to the file:

```ts
// Below the `client = new Monno({...})` line but before the `client.login(...)` line
client.commands.add({
    name: "ping",
    description: "Replies with pong",
    run: async (interaction) => {
        interaction.reply("Pong!")
    },
})
```

Once you compile and run the code, you can see that the bot replies with "Pong!" when you use the `/ping` slash command.

## That's it for now!

### What to do next?

-   Check out the [02. Extensions](./extensions.md) section to learn how to split your bot into multiple parts.
-   Check out the [03. Third party extensions](./third_party.md) section to learn more about how to create and use third-party extensions.
