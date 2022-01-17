import discord from "discord.js"
import { MonnoClient, MonnoClientOptions } from "./client"

export const startMonno = async (options: MonnoClientOptions) => {
    const client = new MonnoClient({
        ...options,
        intents: new discord.Intents(options.intents).add("GUILDS")
    })

    client.extensions.addMany(options.extensions ?? [])

    await options.onStartup?.(client)

    await client.extensions.register(client)
    await client.login(options.token)
    await options.afterLogin?.(client)
}

export default startMonno

export { MonnoClient, MonnoClientOptions } from "./client"
export { MonnoCommand, MonnoCommandManager } from "./commands"
export { MonnoExtension, MonnoExtensionManager } from "./extensions"