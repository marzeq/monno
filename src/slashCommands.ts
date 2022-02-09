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
    Collection,
    Permissions,
    ApplicationCommandOptionData,
    CommandInteraction,
    ApplicationCommandDataResolvable,
    Awaitable
} from "discord.js"
import { MonnoClientCommandBuild } from "./extensions"

export class MonnoSlashCommandManager {
    public readonly commands: Collection<string, MonnoSlashCommand> = new Collection()
    private built = false

    public add(command: MonnoSlashCommand): MonnoSlashCommandManager {
        if (this.built)
            throw new Error("Cannot add commands after registering")

        this.commands.set(command.name, command)
        return this
    }

    public addMany(commands: MonnoSlashCommand[]): MonnoSlashCommandManager {
        for (const command of commands)
            this.add(command)

        return this
    }

    public get(name: string): MonnoSlashCommand | undefined {
        return this.commands.get(name)
    }

    public getAll(): MonnoSlashCommand[] {
        return Array.from(this.commands.values())
    }

    public async build(client: Monno): Promise<MonnoClientCommandBuild> {
        if (this.built)
            throw new Error("Cannot build commands twice")

        this.built = true

        return {
            commandsToRegister: client.slashCommands.getAll().map(c => convertCommandToDiscordCommand(c, client.dev)),
            onInteraction: async interaction => {
                if (!interaction.isCommand()) return

                let name = interaction.commandName

                if (client.dev && name.startsWith("dev_")) name = name.replace("dev_", "")
                else if (!client.dev && name.startsWith("dev_")) return

                const command = client.slashCommands.get(name)

                if (command) {
                    if (!interaction.inGuild() && !command.allowDM)
                        return interaction.reply({
                            content: "This command can only be used in a server.",
                            ephemeral: true
                        })

                    if (command.requiredPermissions && !client.dev) {
                        if (interaction.inGuild()) {
                            let permissions = interaction.member.permissions
                            if (typeof permissions === "string")
                                permissions = new Permissions(BigInt(permissions))

                            if (
                                command.requiredPermissions.type === "ALL" && !permissions.has(command.requiredPermissions.permissions) ||
                                command.requiredPermissions.type === "ANY" && !permissions.any(command.requiredPermissions.permissions)
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
            }
        }
    }
}

const convertCommandToDiscordCommand = (command: MonnoSlashCommand, dev: boolean): ApplicationCommandDataResolvable => ({
    name: (dev ? "dev_" : "") + command.name,
    description: command.description,
    options: command.options ?? [],
    defaultPermission: !dev
})


export interface MonnoSlashCommand {
    /** The name of the slash command. */
    name: string
    /** The description of the slash command. */
    description: string
    /** The options for the slash command. */
    options?: ApplicationCommandOptionData[]
    /** Whether the slash command should be able to be run in direct messages. */
    allowDM?: boolean
    /** The required permission(s) to use this slash command. */
    requiredPermissions?: RequiredPermissionsType
    /** A function that is executed once someone runs the slash command. */
    run(interaction: CommandInteraction): Awaitable<any>
}
