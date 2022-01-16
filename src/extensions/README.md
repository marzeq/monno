# Extensions are a way to split your code into more manageable parts that serve a single purpose.

Extensions are just a function that accept the client as an argument, so that way you can register listeners, commands etc. in the function.

You can register extensions in the registerExtensions function in the `src/registerExtensions.ts` file. It's as simple as importing your extension function and calling it.

---

Example extension:

```ts
import { CustomClient } from "../client"

const exampleExtension = async (client: CustomClient) => {
    client.on("ready", () => {
        console.log("Hello, World!")
    })

    client.commandManager.add({
        name: "helloWorld",
        description: "Says hello to the world",
        run: async (interaction) => {
            interaction.reply("Hello, World!")
        },
    })
}
```

And then register it in `src/registerExtensions.ts`:

```ts
import { CustomClient } from "./client"

export const registerExtensions = async (client: CustomClient) => {
    await exampleExtension(client)
}
```
