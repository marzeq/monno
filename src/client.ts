import discord from "discord.js"
import { CustomConfig } from "./config"
import { CommandManager } from "./commands"

export class CustomClient extends discord.Client {
    public commandManager: CommandManager
    public env: CustomEnv
    public config: CustomConfig

    constructor(options: CustomClientOptions) {
        super(options)
        this.config = options.config
        this.env = options.env
        this.commandManager = new CommandManager()
    }
}

type CustomClientOptions = discord.ClientOptions & {
    env: CustomEnv
    config: CustomConfig
}

export interface CustomEnv {
    DISCORD_TOKEN: string
    ENV: "dev" | "prod"
}
