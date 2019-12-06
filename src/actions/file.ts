import { client, zhtDB } from "./base";
import { zError } from "./utils";
import { authStore } from "../store";
import { ItemIndexData } from "zht-client-api";

const cachingFileDict: Map<string, Promise<ArrayBuffer>> = new Map()

async function cacheFile(mappedName: string, itemId: number, itemKey: string, onProgress?: (p: any) => void): Promise<ArrayBuffer> {
    let loadPromise = cachingFileDict.get(mappedName)
    if(!loadPromise){
        loadPromise = Promise.resolve().then(async () => {
            try{
                const data = await client.getFileData(itemId, mappedName, itemKey, onProgress)
                await zhtDB.putCachedFile(mappedName, itemId, data, authStore.localKey)
                return data
            }finally{
                cachingFileDict.delete(mappedName)
            }
        })
        cachingFileDict.set(mappedName, loadPromise)
    }
    return await loadPromise
}

export async function loadCachedFile(name: string, item: ItemIndexData, fileMap: {[key: string]: string}, onProgress?: (p: any) => void): Promise<ArrayBuffer> {

    const mappedFilename = fileMap[name]
    if(!mappedFilename){
        return zError(`File not found: ${name}`)
    }
    let data = await zhtDB.getCachedFileOrNull(mappedFilename, authStore.localKey)
    if(data === null){
        data = await cacheFile(mappedFilename, item.id, item.key, onProgress)
    }
    return data
}

export async function cacheAllFiles(item: ItemIndexData<any>, fileList: string[], onProg: (p: number) => void){
    let idx = 0
    for(let f of fileList){
        if(!await zhtDB.cachedFileExists(f)){
            await cacheFile(f, item.id, item.key)
        }
        onProg(idx++ / fileList.length)
    }
}