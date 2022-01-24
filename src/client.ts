import { Awaitable, BitFieldResolvable, Client, ClientEvents, ClientOptions, IntentsString } from "discord.js"
import { MonnoCommandManager } from "./commands"
import { MonnoExtensionManager } from "./extensions"

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

    public async start(token: string): Promise<string> {
        this.emit("startup", this)

        await this.extensions.register()
        await this.login(token)

        return token
    }
}

export type MonnoClientOptions = ClientOptions & {
    /** This is used to determine wheter the commands should be registered in a (hopefully) private dev server. */
    dev: boolean
    /** This is used to allow only the bot owner to run the dev commands. */
    ownerID: string
    /** This will be used to determine which guild the dev commands should be registered in. */
    devGuildID: string
    /** This is used to determine which intents the bot should have. Keep in mind the bot automatically puts the GUILDS intent in */
    intents?: BitFieldResolvable<IntentsString, number>
}