import { ZHTClientAPI } from "zht-client-api";
import { ZHTDatabase } from "../localData";

export const client = new ZHTClientAPI({
    baseURL: '/'
})

export const zhtDB = new ZHTDatabase('zht-items-db', 1)