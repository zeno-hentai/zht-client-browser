import { client, zhtDB } from "./base";
import { ListedItemIndex } from "../types";
import { zError } from "./utils";
import { authStore } from "../store";
import { ItemIndexData } from "zht-client-api";

export async function loadCachedFile(name: string, item: ItemIndexData, fileMap: {[key: string]: string}, onProgress?: (P: any) => void): Promise<ArrayBuffer> {

    const mappedFilename = fileMap[name]
    if(!mappedFilename){
        return zError(`File not found: ${name}`)
    }
    let data = await zhtDB.getCachedFileOrNull(mappedFilename, authStore.localKey)
    if(data === null){
        data = await client.getFileData(item.id, mappedFilename, item.key, onProgress)
        await zhtDB.putCachedFile(mappedFilename, item.id, data, authStore.localKey)
    }
    return data
}