import { Monno } from "./client"
import {
    Collection,
    Permissions,
    GuildApplicationCommandPermissionData,
    ApplicationCommandOptionData,
    ChatInputApplicationCommandData,
    PermissionResolvable,
    CommandInteraction
} from "discord.js"

export class MonnoCommandManager {
    public readonly commands: Collection<string, MonnoCommand> = new Collection()
    private registered = false

    public add(command: MonnoCommand): MonnoCommandManager {
        if (this.registered)
            throw new Error("Cannot add commands after registering")

        this.commands.set(command.name, command)
        return this
    }

    public addMany(commands: MonnoCommand[]): MonnoCommandManager {
        for (const command of commands)
            this.add(command)

        return this
    }

    public get(name: string): MonnoCommand | undefined {
        return this.commands.get(name)
    }

    public getAll(): MonnoCommand[] {
        return Array.from(this.commands.values())
    }

    public async register(client: Monno): Promise<MonnoCommandManager> {
        if (this.registered)
            throw new Error("Cannot register commands twice")

        this.registered = true

        client.on("interactionCreate", async interaction => {
            if (!interaction.isCommand()) return
            let name = interaction.commandName
            if (client.dev && name.startsWith("dev_")) name = name.replace("dev_", "")
            else if (!client.dev && name.startsWith("dev_")) return
            const command = client.commands.get(name)
            if (command) {
                if (command.requirePermissions && !client.dev) {
                    if (!interaction.inGuild() && !command.allowDM)
                        return interaction.reply({
                            content: "This command can only be used in a server",
                            ephemeral: true
                        })

                    if (interaction.inGuild()) {
                        let permissions = interaction.member.permissions
                        if (typeof permissions === "string")
                            permissions = new Permissions(BigInt(permissions))

                        if (
                            command.requirePermissions.type === "all" && !permissions.has(command.requirePermissions.permissions) ||
                            command.requirePermissions.type === "any" && !permissions.any(command.requirePermissions.permissions)
                        )
                            return interaction.reply({
                                content: "You lack the required permission(s) to use this command!",
                                ephemeral: true
                            })
                    }

                }
                await command.run(interaction)
            } else
                interaction.reply({
                    content: "Command not found.",
                    ephemeral: true
                })
        })

        client.on("ready", async () => {
            if (client.dev) {
                const commandsToRegister = client.commands.getAll().map(c => convertCommandToDiscordCommand(c, "dev")),
                    guild = client.guilds.cache.get(client.devGuildID!)

                if (!guild)
                    throw new Error("Could not find dev guild. Are you sure you have the GUILDS intent enabled?")

                const fullPermissions: GuildApplicationCommandPermissionData[] = Array.from(await guild.commands.set(commandsToRegister)).map(command => ({
                    id: command[1].id,
                    permissions: client.developerIDs!.map(id => ({
                        id: id,
                        type: "USER",
                        permission: true
                    }))
                }))

                await guild.commands.permissions.set({ fullPermissions })
            } else {
                const commandsToRegister = client.commands.getAll().map(c => convertCommandToDiscordCommand(c, "prod")),
                    clientApplication = client.application

                if (!clientApplication)
                    throw new Error("Could not find client application.")

                await clientApplication.commands.set(commandsToRegister)
            }
        })

        return this
    }
}

const convertCommandToDiscordCommand = (command: MonnoCommand, env: "dev" | "prod"): ChatInputApplicationCommandData => ({
    name: (env === "dev" ? "dev_" : "") + command.name,
    description: command.description,
    options: command.options ?? [],
    defaultPermission: env === "dev" ? false : true
})


export interface MonnoCommand {
    name: string
    description: string
    options?: ApplicationCommandOptionData[]
    allowDM?: boolean
    requirePermissions?: {
        type: "any" | "all",
        permissions: PermissionResolvable[]
    }
    run(interaction: CommandInteraction): void | Promise<void>
}