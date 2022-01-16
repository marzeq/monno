import { CustomClient } from "./client"
import discord, { GuildMember } from "discord.js"

export class CommandManager {
    public readonly commands: discord.Collection<string, Command> = new discord.Collection()
    private registered = false

    public add(command: Command): CommandManager {
        if (this.registered)
            throw new Error("Cannot add commands after registering")

        this.commands.set(command.name, command)
        return this
    }

    public get(name: string): Command | undefined {
        return this.commands.get(name)
    }

    public getAll(): Command[] {
        return Array.from(this.commands.values())
    }

    public async register(client: CustomClient): Promise<CommandManager> {
        if (this.registered)
            throw new Error("Cannot register commands twice")

        this.registered = true

        client.on("interactionCreate", async interaction => {
            if (!interaction.isCommand()) return
            let name = interaction.commandName
            if (client.env.ENV === "dev")
                name = name.replace("dev_", "")
            const command = client.commandManager.get(name)
            if (command) {
                if (command.requirePermissions && client.env.ENV !== "dev") {
                    if (!interaction.inGuild())
                        return interaction.reply({
                            content: "This command can only be used in a server",
                            ephemeral: true
                        })

                    let permissions = interaction.member.permissions
                    if (typeof permissions === "string")
                        permissions = new discord.Permissions(BigInt(permissions))

                    if (
                        command.requirePermissions.type === "all" && !permissions.has(command.requirePermissions.permissions) ||
                        command.requirePermissions.type === "any" && !permissions.any(command.requirePermissions.permissions)
                    )
                        return interaction.reply({
                            content: "You do not have the required permissions to use this command",
                            ephemeral: true
                        })

                }
                await command.run(interaction)
            } else
                interaction.reply({
                    content: "Command not found. This is probably a bug, please report it to the developers",
                    ephemeral: true
                })
        })

        client.on("ready", async () => {
            if (client.env.ENV === "dev") {
                const commandsToRegister = client.commandManager.getAll().map(c => convertCommandToDiscordCommand(c, "dev")),
                    guild = client.guilds.cache.get(client.config.devGuildData.id)

                if (!guild)
                    throw new Error("Could not find dev guild. Are you sure you have the GUILDS intent enabled?")

                const fullPermissions: discord.GuildApplicationCommandPermissionData[] = Array.from(await guild.commands.set(commandsToRegister)).map(command => ({
                    id: command[1].id,
                    permissions: [{
                        id: client.config.ownerId,
                        type: "USER",
                        permission: true
                    }]
                }))

                await guild.commands.permissions.set({ fullPermissions })
            } else {
                const commandsToRegister = client.commandManager.getAll().map(c => convertCommandToDiscordCommand(c, "prod")),
                    clientApplication = client.application

                if (!clientApplication)
                    throw new Error("Could not find client application.")

                await clientApplication.commands.set(commandsToRegister)
            }

            console.log("Registered commands")
        })

        return this
    }
}

const convertCommandToDiscordCommand = (command: Command, env: "dev" | "prod"): discord.ChatInputApplicationCommandData => ({
    name: (env === "dev" ? "dev_" : "") + command.name,
    description: command.description,
    options: command.options ?? [],
    defaultPermission: env === "dev" ? false : true
})


interface Command {
    /**
     * The name of the command.
     */
    name: string
    /**
     * The description of the command.
     */
    description: string
    /**
     * The options of the command.
     */
    options?: discord.ApplicationCommandOptionData[]
    /**
     * The permissions required to run the command.
     * 
     * Don't set if you want this command to be able to be run in DM's. Set to an empty array if you want this to be a guild only command but don't want to require any permissions.
     */
    requirePermissions?: {
        type: "any" | "all",
        permissions: discord.PermissionResolvable[]
    }
    /**
     * The function to run when the command is called.
     * 
     * Can be either async or sync.
     */
    run(interaction: discord.CommandInteraction): void | Promise<void>
}