import { ZHTClientAPI } from "zht-client-api";
import { ZHTDatabase, ZHTSignalManager } from "../localData";

export const client = new ZHTClientAPI({
    baseURL: '/'
})

export const zhtDB = new ZHTDatabase('zht-items-db', 1)

export const zhtSignal = new ZHTSignalManager()