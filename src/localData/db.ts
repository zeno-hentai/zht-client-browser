import Dexie from 'dexie';
import { aesEncrypt, sha256Hash, ItemIndexData, ZHTBaseMeta, aesDecrypt, ItemTagData, b64encode, b64decode } from 'zht-client-api';
import { ListedItemIndex } from '../types';
import { zError } from '../actions/utils';
import { LocalKeyData } from './localStorage';

export type ZhtItemData = { id: number } & (
    {
        status: "OK"
        type: string
        encryptedMeta: string
        encryptedKey: string
    } | {
        status: Exclude<ListedItemIndex<any>['status'], "OK">
    }
)

export interface ZhtFileData {
    itemId: number
    hashedFilename: string
    encryptedFilename: string
    encryptedMappedFilename: string
}

export interface ZhtTagData {
    id: number
    hashedTag: string
    encryptedTag: string
    itemId: number
}

export interface ZhtFileCache {
    mappedName: string
    itemId: number
    encryptedData: string
}

export interface DBLimit {
    offset: number
    limit: number
}

export interface DBKeys {
    localKey: string
    hashSalt: string
}

export class ZHTDatabase extends Dexie {
    items: Dexie.Table<ZhtItemData, number>
    tags: Dexie.Table<ZhtTagData, number>
    files: Dexie.Table<ZhtFileData, [number, string]>
    cachedFile: Dexie.Table<ZhtFileCache, string>
    constructor(dbName: string, version: number){
        super(dbName)
        this.version(version).stores({
            items: 'id,status,type,encryptedMeta,encryptedKey',
            tags: 'id,hashedTag,encryptedTag,itemId',
            files: '[itemId+hashedFilename],itemId,hashedFilename,encryptedFileName,encryptedMappedFileName',
            cachedFile: 'mappedName,itemId,encryptedData'
        })
        this.items = this.table("items")
        this.tags = this.table("tags")
        this.files = this.table("files")
        this.cachedFile = this.table("cachedFile")
    }
}

export interface ZHTDatabase {
    updateItems(items: ListedItemIndex<any>[], {localKey, hashSalt}: DBKeys): Promise<void>
    getItems({offset, limit}: DBLimit, {localKey, hashSalt}: DBKeys): Promise<ListedItemIndex<any>[]>
    queryItemsByTag(tags: string[], {offset, limit}: DBLimit, {localKey, hashSalt}: DBKeys): Promise<ListedItemIndex<any>[]>
    deleteItems(itemIds: number[]): Promise<void>
    getItem(itemId: number, {localKey}: LocalKeyData): Promise<ListedItemIndex<any> | null>
    getCachedFileOrNull(mappedName: string, {localKey, hashSalt}: DBKeys): Promise<ArrayBuffer | null>
    putCachedFile(mappedName: string, itemId: number, data: ArrayBuffer, {localKey, hashSalt}: DBKeys): Promise<void>
    clearData(): Promise<void>
}

ZHTDatabase.prototype.updateItems = async function(items: ListedItemIndex<any>[], {localKey, hashSalt}: DBKeys){
    if(this.hasBeenClosed()){
        await this.open()
    }
    await this.transaction('rw', [this.items, this.tags, this.files], async () => {
        for(let it of items){
            if(it.status !== 'OK'){
                await this.tags.where("itemId").equals(it.id).delete()
                await this.files.where("itemId").equals(it.id).delete()
                await this.items.put({
                    id: it.id,
                    status: it.status
                })
                continue
            }
            const encryptedMeta = await aesEncrypt(JSON.stringify(it.item.meta), localKey)
            const encryptedKey = await aesEncrypt(it.item.key, localKey)
            const encryptedItem: ZhtItemData = {
                id: it.id,
                status: 'OK',
                type: it.type,
                encryptedKey,
                encryptedMeta
            }
            const files: ZhtFileData[] = await Promise.all(Object.entries(it.files).map(async ([fe, fm]) => ({
                itemId: it.id,
                hashedFilename: await sha256Hash(`${fe}:${hashSalt}`),
                encryptedFilename: await aesEncrypt(fe, localKey),
                encryptedMappedFilename: await aesEncrypt(fm, localKey)
            })))
            await this.items.put(encryptedItem)
            await this.tags.where("id").noneOf(it.item.tags.map(t => t.id)).delete()
            // await this.files.where(["itemId", "hashedFilename"]).noneOf(files.map(({itemId, hashedFilename}) => [itemId, hashedFilename])).delete()
            // FIXME: Delete unneeded files
            for(let t of it.item.tags){
                const encryptedTag: ZhtTagData = {
                    id: t.id,
                    encryptedTag: await aesEncrypt(t.tag, localKey),
                    hashedTag: await sha256Hash(`${t.tag}:${hashSalt}`),
                    itemId: it.id
                }
                await this.tags.put(encryptedTag)
            }
            for(let f of files){
                await this.files.put(f)
            }
        }
    })
}

async function convertItem(db: ZHTDatabase, it: ZhtItemData, localKey: string): Promise<ListedItemIndex<any>> {
    if(it.status === 'UNKNOWN_TYPE'){
        return {
            id: it.id,
            status: it.status
        }
    }else if(it.status === 'INVALID_META'){
        return {
            id: it.id,
            status: it.status
        }
    }else if(it.status !== 'OK'){
        return zError("Unknown error.")
    }
    const meta: ZHTBaseMeta<any> = JSON.parse(await aesDecrypt(it.encryptedMeta, localKey))
    const key = await aesDecrypt(it.encryptedKey, localKey)
    const tagsCur = await db.tags.where("itemId").equals(it.id).toArray()
    const tags: ItemTagData[] = await Promise.all(tagsCur.map(async t => ({
        id: t.id,
        tag: await aesDecrypt(t.encryptedTag, localKey)
    })))
    const files: {[key: string]: string} = {}
    for(let f of await db.files.where("itemId").equals(it.id).toArray()){
        const name = await aesDecrypt(f.encryptedFilename, localKey)
        const mappedName = await aesDecrypt(f.encryptedMappedFilename, localKey)
        files[name] = mappedName
    }
    const item = {id: it.id, meta, key, tags}
    return {
        id: it.id,
        type: meta.type,
        status: 'OK',
        item,
        files
    }
}

ZHTDatabase.prototype.getItem = async function (itemId: number, {localKey}: LocalKeyData): Promise<ListedItemIndex<any> | null> {
    return await this.transaction("r", [this.items, this.tags, this.files], async () => {
        const item = await this.items.where("id").equals(itemId).first()
        if(!item){
            return null
        }
        return await convertItem(this, item, localKey)
    })
}

ZHTDatabase.prototype.getItems = async function ({offset, limit}: DBLimit, {localKey}: DBKeys): Promise<ListedItemIndex<any>[]> {
    if(this.hasBeenClosed()){
        await this.open()
    }
    return await this.transaction("r", [this.items, this.tags, this.files], async () => {
        const items = await this.items.offset(offset).limit(limit).toArray()
        return await Promise.all(items.map(it => convertItem(this, it, localKey)))
    })
}

ZHTDatabase.prototype.queryItemsByTag = async function(tags: string[], {offset, limit}: DBLimit, {localKey, hashSalt}: DBKeys): Promise<ListedItemIndex<any>[]> {
    if(this.hasBeenClosed()){
        await this.open()
    }
    const hashedTags = await Promise.all(tags.map(t => sha256Hash(`${t}:${hashSalt}`)))
    return await this.transaction("r", [this.items, this.tags, this.files], async () => {
        const matchedTags = await this.tags.where("hashed").anyOf(hashedTags).toArray()
        const itemIdList = matchedTags.map(t => t.itemId)
        const matchedItems = await this.items.where("id").anyOf(itemIdList).offset(offset).limit(limit).toArray()
        return await Promise.all(matchedItems.map(it => convertItem(this, it, localKey)))
    })
}

ZHTDatabase.prototype.getCachedFileOrNull = async function (mappedName: string, {localKey}: DBKeys): Promise<ArrayBuffer | null>{
    return await this.transaction("r", [this.cachedFile], async () => {
        const cachedFile = await this.cachedFile.where("mappedName").equals(mappedName).first()
        if(!cachedFile){
            return null
        }
        return b64decode(await aesDecrypt(cachedFile.encryptedData, localKey))
    })
}
ZHTDatabase.prototype.putCachedFile = async function (mappedName: string, itemId: number, data: ArrayBuffer, {localKey}: DBKeys): Promise<void>{
    const encryptedData = await aesEncrypt(b64encode(data), localKey)
    await this.transaction("rw", [this.cachedFile], async () => {
        await this.cachedFile.put({mappedName, itemId, encryptedData})
    })
}

ZHTDatabase.prototype.deleteItems = async function (itemIds: number[]): Promise<void> {
    if(this.hasBeenClosed()){
        await this.open()
    }
    await this.transaction('rw', [this.items, this.tags, this.files, this.cachedFile], async () => {
        await this.items.where("id").anyOf(itemIds).delete()
        await this.tags.where("itemId").anyOf(itemIds).delete()
        await this.files.where("itemId").anyOf(itemIds).delete()
        await this.cachedFile.where("itemId").anyOf(itemIds).delete()
    })
}

ZHTDatabase.prototype.clearData = async function (): Promise<void> {
    if(this.hasBeenClosed()){
        await this.open()
    }
    await this.transaction('rw', [this.items, this.tags, this.files, this.cachedFile], async () => {
        await this.items.toCollection().delete()
        await this.tags.toCollection().delete()
        await this.files.toCollection().delete()
        await this.cachedFile.toCollection().delete()
    })
}