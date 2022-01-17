import discord from "discord.js"
import { MonnoCommandManager } from "./commands"
import { MonnoExtension, MonnoExtensionManager } from "./extensions"

export class MonnoClient extends discord.Client {
    public commands: MonnoCommandManager
    public extensions: MonnoExtensionManager
    public ownerID: string
    public devGuildID: string
    public dev: boolean

    constructor(options: MonnoClientOptions) {
        super(options)
        this.ownerID = options.ownerID
        this.devGuildID = options.devGuildID
        this.dev = options.dev
        this.commands = new MonnoCommandManager()
        this.extensions = new MonnoExtensionManager(this)
    }
}

export type MonnoClientOptions = discord.ClientOptions & {
    token: string
    dev: boolean
    ownerID: string
    devGuildID: string
    extensions?: MonnoExtension[]
    onStartup: (client: MonnoClient) => Promise<void> | void
    afterLogin?: (client: MonnoClient) => Promise<void> | void
}