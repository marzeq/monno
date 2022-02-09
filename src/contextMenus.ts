/* 
Copyright © 2022 marzeq

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

import { Monno, RequiredPermissionsType } from "./client"
import {
    ApplicationCommandDataResolvable,
    Collection,
    MessageContextMenuInteraction,
    UserContextMenuInteraction,
    Permissions,
    Awaitable
} from "discord.js"
import { MonnoClientCommandBuild } from "./extensions"

export class MonnoContextMenuManager {
    public readonly contextMenus: Collection<string, MonnoContextMenu> = new Collection()
    private built = false

    public add(contextMenu: MonnoContextMenu): MonnoContextMenuManager {
        if (this.built)
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

    public async build(client: Monno): Promise<MonnoClientCommandBuild> {
        if (this.built)
            throw new Error("Cannot build context menus twice")

        this.built = true

        return {
            commandsToRegister: this.getAll().map(contextMenu => convertMenuToDiscordMenu(contextMenu, client.dev)),
            onInteraction: async interaction => {
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
                        contextMenu.type === "USER" && interaction.isUserContextMenu() ||
                        contextMenu.type === "MESSAGE" && interaction.isMessageContextMenu()
                    )
                        // @ts-ignore
                        // this is because we already checked the interaction type above
                        await contextMenu.run(interaction)
                    else
                        return interaction.reply({
                            content: "This context menu is not available in this context.",
                            ephemeral: true
                        })
                }
            }
        }
    }
}

const convertMenuToDiscordMenu = (menu: MonnoContextMenu, dev: boolean): ApplicationCommandDataResolvable => ({
    name: dev ? `Dev: ${menu.name}` : menu.name,
    type: menu.type,
    defaultPermission: !dev
})


export type MonnoContextMenu = {
    /** The name of the context menu. */
    name: string
    /** Whether the context menu should be available in direct messages. */
    allowDM?: boolean
    /** The required permission(s) to use this context menu. */
    requiredPermissions?: RequiredPermissionsType
} & ({
    /** The type of the context menu. */
    type: "MESSAGE"
    /** A function that is executed once someone clicks on the context menu. */
    run: (interaction: MessageContextMenuInteraction) => Awaitable<any>
} | {
    /** The type of the context menu. */
    type: "USER"
    /** A function that is executed once someone clicks on the context menu. */
    run: (interaction: UserContextMenuInteraction) => Awaitable<any> 
})
