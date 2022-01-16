import merge from "lodash.merge"
import { CustomEnv } from "./client"

export class CustomConfig {
    private readonly env: CustomEnv

    public readonly ownerId = ""

    public readonly devGuildData = {
        id: ""
    }

    constructor(env: CustomEnv) {
        this.env = env
    }
}
