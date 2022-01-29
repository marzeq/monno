import { Monno } from "./client"
import { ApplicationCommandDataResolvable, Awaitable, Collection, GuildApplicationCommandPermissionData, Interaction } from "discord.js"
import { MonnoSlashCommand } from "./slashCommands"
import { MonnoContextMenu } from "./contextMenus"

export class MonnoExtensionManager {
    public readonly extensions: Collection<string, MonnoExtension> = new Collection()
    private readonly extensionData: Collection<string, unknown> = new Collection()
    private client: Monno
    private registered = false

    constructor(client: Monno) {
        this.client = client
    }

    public add(extension: MonnoExtension): MonnoExtensionManager {
        if (this.registered)
            throw new Error("Cannot add extensions after registering")

        this.extensions.set(extension.name, extension)

        if (extension.data)
            this.extensionData.set(extension.name, extension.data)
        if (extension.slashCommands)
            this.client.slashCommands.addMany(extension.slashCommands)
        if (extension.contextMenus)
            this.client.contextMenus.addMany(extension.contextMenus)
        if (extension.listeners) for (const listner of extension.listeners) this.client.on(listner[0], listner[1])

        return this
    }

    public addMany(extensions: MonnoExtension[]): MonnoExtensionManager {
        for (const extension of extensions)
            this.add(extension)

        return this
    }

    public get(name: string): MonnoExtension | undefined {
        return this.extensions.get(name)
    }

    public getAll(): MonnoExtension[] {
        return Array.from(this.extensions.values())
    }

    public data<T>(name: string): T {
        return this.extensionData.get(name) as T
    }

    public async register(): Promise<MonnoExtensionManager> {
        if (this.registered)
            throw new Error("Cannot register extensions twice")

        this.registered = true

        for (const extension of this.getAll()) await extension.onRegister?.(this.client)

        const slashCommands = await this.client.slashCommands.build(this.client),
            contextMenus = await this.client.contextMenus.build(this.client)

        this.client.on("ready", async () => {
            if (this.client.dev) {
                const commandsToRegister = slashCommands.commandsToRegister.concat(contextMenus.commandsToRegister),
                    guild = this.client.guilds.cache.get(this.client.devGuildID!)

                if (!guild)
                    throw new Error("Could not find dev guild. Are you sure you have the GUILDS intent enabled?")

                const fullPermissions: GuildApplicationCommandPermissionData[] = Array.from(await guild.commands.set(commandsToRegister)).map(command => ({
                    id: command[1].id,
                    permissions: this.client.developerIDs!.map(id => ({
                        id: id,
                        type: "USER",
                        permission: true
                    }))
                }))

                await guild.commands.permissions.set({ fullPermissions })
            } else {
                const commandsToRegister = slashCommands.commandsToRegister.concat(contextMenus.commandsToRegister),
                    clientApplication = this.client.application

                if (!clientApplication)
                    throw new Error("Could not find the client application.")

                await clientApplication.commands.set(commandsToRegister)
            }
        })

        this.client.on("interactionCreate", async interaction => {
            await contextMenus.onInteraction(interaction)
            await slashCommands.onInteraction(interaction)
        })

        return this
    }
}

export interface MonnoExtension {
    name: string
    data?: unknown
    slashCommands?: MonnoSlashCommand[]
    contextMenus?: MonnoContextMenu[]
    listeners?: [event: string, listener: (...args: any[]) => Awaitable<void>][]
    onRegister?: (client: Monno) => Promise<void> | void
}

export interface MonnoClientCommandBuild {
    onInteraction: (interaction: Interaction) => Promise<any> | any
    commandsToRegister: ApplicationCommandDataResolvable[]
}