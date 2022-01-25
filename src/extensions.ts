import { Monno } from "./client"
import { Awaitable, Collection } from "discord.js"
import { MonnoCommand } from "./commands"

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
        if (extension.commands)
            this.client.commands.addMany(extension.commands)

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

        for (const extension of this.getAll()) {
            await extension.onRegister?.(this.client)
            if (extension.listeners) for (const listner of extension.listeners) this.client.on(listner[0], listner[1])
        }

        await this.client.commands.register(this.client)

        return this
    }
}

export interface MonnoExtension {
    name: string
    data?: unknown
    commands?: MonnoCommand[]
    listeners?: [event: string, listener: (...args: any[]) => Awaitable<void>][]
    onRegister?: (client: Monno) => Promise<void> | void
}