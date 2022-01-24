//@ts-expect-error
import { MonnoExtension } from "monno"
//@ts-expect-error
import { MongoClient } from "mongodb"

export const mongoExtension = (databaseUrl: string) => {
    const client = new MongoClient(databaseUrl)
    client.connect()


    return ({
        name: "mongodb",
        data: {
            client
        }
    } as MonnoExtension)
}

export interface MongoExtensionData {
    client: MongoClient
}