# 02. Extensions

## 02.1. Introduction to extensions

Extensions are a way to easily split your bot into multiple files, which makes it easier to manage and update.

You can put related commands and listener in the same extension file.

## 02.2. Creating an extension with commands

To create an extension, you can add the following code to the `index.ts` file:

```ts
// Below the `client = new Monno({...})` line but before the `client.login(...)` line
client.extensions.add({
    name: "example",
    commands: [
        {
            name: "ping",
            description: "Replies with pong",
            run: async (interaction) => {
                interaction.reply("Pong!")
            },
        },
        {
            name: "pong",
            description: "Replies with ping",
            run: async (interaction) => {
                interaction.reply("Ping!")
            },
        },
    ],
})
```

Now you can use the `/ping` and `/pong` commands in the same way as before.

## 02.3. Adding listeners to the extension

Change the code to add the following code:

```ts
client.extensions.add({
    name: "example",
    onRegister: async (client) => {
        client.on("ready", () => {
            console.log("Ready!")
        })
    },
})
```

This trick allows us to add listeners in the same file as the commands.

##### (Although I should probably also add a listeners field to the extension object. This is sort of hacky and the `onRegister` method is meant more for third-party extensions.)

## 02.4. Moving the extensions to separate files

A good practice in discord.js is to put all the commands and listeners in separate files.

In a similar fashion, in monno, you should split the extensions into separate files.

There are two ways to do this:

-   Importing (or `require()`-ing) each extension manually
-   Reading a directory with fs.readdirSync() and `require()-ing` all the extensions automatically

We will go over both in this tutorial.

## 02.5. Importing extensions manually

Create a folder called `extensions` and create a file called `example.ts` (as a general rule, your filename should match the extension name).

Based on the previous code snippet, add the following code to the file:

```ts
import { MonnoExtension } from "monno"

const extension: MonnoExtension = {
    // you don't need to explicitly set the type, but it's a good practice
    name: "example",
    commands: [
        {
            name: "ping",
            description: "Replies with pong",
            run: async (interaction) => {
                interaction.reply("Pong!")
            },
        },
        {
            name: "pong",
            description: "Replies with ping",
            run: async (interaction) => {
                interaction.reply("Ping!")
            },
        },
    ],
}

export default extension
```

Then, add the following code to the `index.ts` file:

```ts
// Below the import { Monno } from "monno" line
import example from "./extensions/example"

// ...

// Right where we previously added the client.extensions.add({...})
client.extensions.add(example)
```

Now when we compile and run the code, you can see that we get the same result as before.

## 02.6. Reading extensions automatically

Just like in the previous step:

-   Create a folder called `extensions` and create a file called `example.ts` (as a general rule, your filename should match the extension name).
-   Add the same code as in the previous step.

Now add the following code to the `index.ts` file:

```ts
// Below the import { Monno } from "monno" line
import { readdirSync } from "fs"

// ...

// Below the const client = new Monno({...}) line

const extensions = readdirSync("./extensions")
    .filter((file) => file.endsWith(".js")) // this is because we compiled the files, so they're actually .js files
    .map((file) => require(`./extensions/${file}`))

client.extensions.addMany(extensions)
```

Now when we compile and run the code, you can see that we get the same result as before.

## 02.7. Adding more extensions

From now, you can replicate the steps above to add more extensions.

-   For manual importing, create more extension files just like in the example, import them in the `index.ts` file, and add them below the `client.extensions.add(...)` line.
-   For automatic importing, create more extension files just like in the example. The only difference is that you don't need to import them in the `index.ts` file, it will do it automatically for you.

## That's it for now!

### What to do next?

-   Check out the [03. Extension data](./extension_data.md) section to learn more about how to create extensions that utilise the data property.
