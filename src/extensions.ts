import { MonnoClient } from "./client"
import { Collection } from "discord.js"
import { MonnoCommand } from "./commands"

export class MonnoExtensionManager {
    public readonly extensions: Collection<string, MonnoExtension> = new Collection()
    private readonly extensionData: Collection<string, unknown> = new Collection()
    private client: MonnoClient
    private registered = false

    constructor(client: MonnoClient) {
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

    public async register(client: MonnoClient): Promise<MonnoExtensionManager> {
        if (this.registered)
            throw new Error("Cannot register extensions twice")

        this.registered = true

        for (const extension of this.getAll())
            await extension.runner?.(client)

        await client.commands.register(client)

        return this
    }
}

export interface MonnoExtension {
    name: string
    data?: unknown
    commands?: MonnoCommand[]
    runner?: (client: MonnoClient) => Promise<void> | void
}