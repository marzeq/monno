import { Monno, RequiredPermissionsType } from "./client"
import {
    ApplicationCommandDataResolvable,
    Collection,
    MessageContextMenuInteraction,
    UserContextMenuInteraction,
    Permissions,
    GuildApplicationCommandPermissionData
} from "discord.js"

export class MonnoContextMenuManager {
    public readonly contextMenus: Collection<string, MonnoContextMenu> = new Collection()
    private registered = false

    public add(contextMenu: MonnoContextMenu): MonnoContextMenuManager {
        if (this.registered)
            throw new Error("Cannot add commands after registering")

        this.contextMenus.set(contextMenu.name, contextMenu)
        return this
    }

    public addMany(contextMenus: MonnoContextMenu[]): MonnoContextMenuManager {
        for (const command of contextMenus)
            this.add(command)

        return this
    }

    public get(name: string): MonnoContextMenu | undefined {
        return this.contextMenus.get(name)
    }

    public getAll(): MonnoContextMenu[] {
        return Array.from(this.contextMenus.values())
    }

    public async register(client: Monno): Promise<MonnoContextMenuManager> {
        if (this.registered)
            throw new Error("Cannot register context menus twice")

        this.registered = true

        client.on("interactionCreate", async interaction => {
            if (!interaction.isContextMenu()) return

            let name = interaction.commandName

            if (client.dev && name.startsWith("Dev: ")) name = name.replace("Dev: ", "")
            else if (!client.dev && name.startsWith("Dev: ")) return

            const contextMenu = this.get(name)

            if (contextMenu) {
                if (!interaction.inGuild() && !contextMenu.allowDM)
                    return interaction.reply({
                        content: "This context menu can only be used in a server.",
                        ephemeral: true
                    })

                if (contextMenu.requiredPermissions && !client.dev) {
                    if (interaction.inGuild()) {
                        let permissions = interaction.member.permissions
                        if (typeof permissions === "string")
                            permissions = new Permissions(BigInt(permissions))

                        if (
                            contextMenu.requiredPermissions.type === "ALL" && !permissions.has(contextMenu.requiredPermissions.permissions) ||
                            contextMenu.requiredPermissions.type === "ANY" && !permissions.any(contextMenu.requiredPermissions.permissions)
                        )
                            return interaction.reply({
                                content: "You lack the required permission(s) to use this context menu!",
                                ephemeral: true
                            })
                    }
                }

                if (
                    contextMenu.type === "USER" && !interaction.isUserContextMenu() ||
                    contextMenu.type === "MESSAGE" && !interaction.isMessageContextMenu()
                )
                    return interaction.reply({
                        content: "This context menu is not the correct type!",
                        ephemeral: true
                    })

                // @ts-ignore
                // this is because we already checked the interaction type above
                await contextMenu.run(interaction)
            }

        })

        client.on("ready", async () => {
            if (client.dev) {
                const contextMenusToRegister = this.getAll().map(contextMenu => convertMenuToDiscordMenu(contextMenu, "dev")),
                    guild = client.guilds.cache.get(client.devGuildID!)

                if (!guild)
                    throw new Error("Could not find dev guild. Are you sure you have the GUILDS intent enabled?")

                const fullPermissions: GuildApplicationCommandPermissionData[] = Array.from(await guild.commands.set(contextMenusToRegister)).map(contextMenu => ({
                    id: contextMenu[1].id,
                    permissions: client.developerIDs!.map(id => ({
                        id: id,
                        type: "USER",
                        permission: true
                    }))
                }))

                await guild.commands.permissions.set({ fullPermissions })
            } else {
                const contextMenusToRegister = this.getAll().map(contextMenu => convertMenuToDiscordMenu(contextMenu, "prod")),
                    clientApplication = client.application

                if (!clientApplication)
                    throw new Error("Could not find the client application.")

                await clientApplication.commands.set(contextMenusToRegister)
            }
        })

        return this
    }
}

const convertMenuToDiscordMenu = (menu: MonnoContextMenu, env: "dev" | "prod"): ApplicationCommandDataResolvable => ({
    name: env === "dev" ? `Dev: ${menu.name}` : menu.name,
    type: menu.type
})


export type MonnoContextMenu = {
    name: string
    allowDM: boolean
    requiredPermissions?: RequiredPermissionsType
} & ({
    type: "MESSAGE"
    run: (interaction: MessageContextMenuInteraction) => Promise<any> | any
} | {
    name: string
    type: "USER"
    run: (interaction: UserContextMenuInteraction) => Promise<any> | any
})