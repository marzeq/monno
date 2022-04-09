import { Awaitable, Client, ClientEvents, ClientOptions, GuildMember, PermissionResolvable, User } from "discord.js"
import { APIInteractionGuildMember } from "discord-api-types"
import { MonnoSlashCommandManager } from "./slashCommands"
import { MonnoExtensionManager } from "./extensions"
import { MonnoContextMenuManager } from "./contextMenus"

export declare interface Monno extends Client {
	on<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => Awaitable<void>): this
	on<S extends string | symbol>(event: Exclude<S, keyof ClientEvents>, listener: (...args: any[]) => Awaitable<void>): this

	on(event: "startup", listener: (client: this) => Awaitable<void>): this

	once<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => Awaitable<void>): this
	once<S extends string | symbol>(event: Exclude<S, keyof ClientEvents>, listener: (...args: any[]) => Awaitable<void>): this

	once(event: "startup", listener: (client: this) => Awaitable<void>): this

	emit<K extends keyof ClientEvents>(event: K, ...args: ClientEvents[K]): boolean
	emit<S extends string | symbol>(event: Exclude<S, keyof ClientEvents>, ...args: unknown[]): boolean

	emit(event: "startup", client: Monno): boolean
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

export type MonnoClientOptions = ClientOptions &
	(
		| {
				/** This is used to determine wheter the commands should be registered in a (hopefully) private dev server. */
				dev: true
				/** This is used to allow only the bot developers to run the dev commands. */
				developerIDs: string[]
				/** This will be used to determine which guild the dev commands should be registered in. */
				devGuildID: string
		  }
		| {
				/** This is used to determine wheter the commands should be registered in a (hopefully) private dev server. */
				dev: false
		  }
	)

export type MonnoRequiredPermissions =
	| {
			/** Whether the user should match all or one of the permissions. */
			type: "ALL" | "ANY"
			/** List of the permissions. */
			permissions: PermissionResolvable[]
	  }
	| {
			/** Whether the user should match all or one of the permissions. */
			type: "PREDICATE"
			/** Predicate function that should return true if the user has the permissions. */
			predicate: (user: User | GuildMember | APIInteractionGuildMember, client: Monno) => Awaitable<boolean>
	  }
