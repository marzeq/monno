import { MonnoExtension } from "monno"

export const thirdPartyExtension: MonnoExtension = {
    name: "thirdPartyExtension",
    runner: async (client) => {
        // you could do something here like connecting to a database
    },
    data: {
        // you put your database class in here
        something: "some data"
    }
}

export interface ThirdPartyExtensionData {
    [key: string]: string
}