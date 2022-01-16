import { CustomClient } from "./client"
import { registerExtensions } from "./registerExtensions"
import dotenv from "dotenv"
import { CustomConfig } from "./config"

dotenv.config()

if (!process.env.DISCORD_TOKEN) {
    console.error("DISCORD_TOKEN is not set")
    process.exit(1)
}
if (process.env.ENV !== "dev" && process.env.ENV !== "prod") {
    console.error("ENV is not set to either dev or prod")
    process.exit(1)
}

const env = {
    DISCORD_TOKEN: process.env.DISCORD_TOKEN,
    ENV: process.env.ENV as "dev" | "prod",
}

const client = new CustomClient({
    intents: [
        "GUILDS"
    ],
    env: env,
    config: new CustomConfig(env)
})

if (client.config.devGuildData.id === "") {
    console.error("client.config.devGuildData.id is not set")
    process.exit(1)
}
if (client.config.ownerId === "") {
    console.error("client.config.ownerId is not set")
    process.exit(1)
}

registerExtensions(client).then(() => {
    client.commandManager.register(client).then(() => {
        client.login(process.env.DISCORD_TOKEN)
    })
})

