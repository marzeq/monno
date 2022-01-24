//@ts-expect-error
import { MonnoExtension } from "monno"
//@ts-expect-error
import { MongoClient } from "mongodb"

const exampleExtension = async (databaseUrl: string) => {
    const client = new MongoClient(databaseUrl, { useNewUrlParser: true })
    await client.connect()


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