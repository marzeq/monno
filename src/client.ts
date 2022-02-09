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

import {
    Awaitable,
    Client,
    ClientEvents,
    ClientOptions,
    PermissionResolvable
} from "discord.js"
import { MonnoSlashCommandManager } from "./slashCommands"
import { MonnoExtensionManager } from "./extensions"
import { MonnoContextMenuManager } from "./contextMenus"

export declare interface Monno extends Client {
    on<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => Awaitable<void>): this
    on<S extends string | symbol>(
        event: Exclude<S, keyof ClientEvents>,
        listener: (...args: any[]) => Awaitable<void>,
    ): this

    on(event: "startup", listener: (client: this) => Awaitable<void>): this

    once<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => Awaitable<void>): this
    once<S extends string | symbol>(
        event: Exclude<S, keyof ClientEvents>,
        listener: (...args: any[]) => Awaitable<void>,
    ): this

    once(event: "startup", listener: (client: this) => Awaitable<void>): this

    emit<K extends keyof ClientEvents>(event: K, ...args: ClientEvents[K]): boolean
    emit<S extends string | symbol>(event: Exclude<S, keyof ClientEvents>, ...args: unknown[]): boolean

    emit(event: "startup", client: Monno): void
}

export class Monno extends Client {
    public slashCommands: MonnoSlashCommandManager
    public contextMenus: MonnoContextMenuManager
    public extensions: MonnoExtensionManager
    public developerIDs?: string[]
    public devGuildID?: string
    public dev: boolean

    constructor(options: MonnoClientOptions) {
        super(options)
        this.dev = options.dev

        if (options.dev) {
            this.developerIDs = options.developerIDs
            this.devGuildID = options.devGuildID
        }

        this.slashCommands = new MonnoSlashCommandManager()
        this.contextMenus = new MonnoContextMenuManager()
        this.extensions = new MonnoExtensionManager(this)
    }

    public async start(token: string): Promise<string> {
        this.emit("startup", this)

        await this.extensions.register()
        await this.login(token)

        return token
    }
}

export type MonnoClientOptions = ClientOptions & ({
    /** This is used to determine wheter the commands should be registered in a (hopefully) private dev server. */
    dev: true
    /** This is used to allow only the bot developers to run the dev commands. */
    developerIDs: string[]
    /** This will be used to determine which guild the dev commands should be registered in. */
    devGuildID: string
} | {
    /** This is used to determine wheter the commands should be registered in a (hopefully) private dev server. */
    dev: false
})

export type RequiredPermissionsType = {
    /** Whether the user should match all or one of the permissions. */
    type: "ALL" | "ANY"
    /** List of the permissions. */
    permissions: PermissionResolvable[]
}
