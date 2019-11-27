import Dexie from 'dexie';
import { aesEncrypt, sha256Hash, ItemIndexData, ZHTBaseMeta, aesDecrypt, ItemTagData } from 'zht-client-api';

export interface ZhtItemData {
    id: number
    encryptedMeta: string
    encryptedKey: string
}

export interface ZhtTagData {
    id: number
    hashedTag: string
    encryptedTag: string
    itemId: number
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
    constructor(dbName: string, version: number){
        super(dbName)
        this.version(version).stores({
            items: 'id,encryptedMeta,encryptedKey',
            tags: 'id,hashedTag,encryptedTag,itemId'
        })
        this.items = this.table("items")
        this.tags = this.table("tags")
    }
}

export interface ZHTDatabase {
    updateItems(items: ItemIndexData<ZHTBaseMeta<any>>[], {localKey, hashSalt}: DBKeys): Promise<void>
    getItems({offset, limit}: DBLimit, {localKey, hashSalt}: DBKeys): Promise<ItemIndexData[]>
    queryItemsByTag(tags: string[], {offset, limit}: DBLimit, {localKey, hashSalt}: DBKeys): Promise<ItemIndexData[]>
    deleteItems(itemIds: number[]): Promise<void>
}

ZHTDatabase.prototype.updateItems = async function(items: ItemIndexData<ZHTBaseMeta<any>>[], {localKey, hashSalt}: DBKeys){
    await this.transaction('rw', [this.items, this.tags], async () => {
        for(let it of items){
            const encryptedMeta = await aesEncrypt(JSON.stringify(it.meta), localKey)
            const encryptedKey = await aesEncrypt(it.key, localKey)
            const encryptedItem: ZhtItemData = {
                id: it.id,
                encryptedKey,
                encryptedMeta
            }
            await this.items.put(encryptedItem, it.id)
            await this.tags.where("id").noneOf(it.tags.map(t => t.id)).delete()
            for(let t of it.tags){
                const encryptedTag: ZhtTagData = {
                    id: t.id,
                    encryptedTag: await aesEncrypt(t.tag, localKey),
                    hashedTag: await sha256Hash(`${t.tag}:${hashSalt}`),
                    itemId: it.id
                }
                await this.tags.put(encryptedTag, t.id)
            }
        }
    })
}

ZHTDatabase.prototype.getItems = async function ({offset, limit}: DBLimit, {localKey}: DBKeys): Promise<ItemIndexData[]> {
    return await this.transaction("r", [this.items, this.tags], async () => {
        const items = await this.items.offset(offset).limit(limit).toArray()
        return await Promise.all(items.map(async it => {
            const meta = JSON.parse(await aesDecrypt(it.encryptedMeta, localKey))
            const key = await aesDecrypt(it.encryptedKey, localKey)
            const tagsCur = await this.tags.where("itemId").equals(it.id).toArray()
            const tags: ItemTagData[] = await Promise.all(tagsCur.map(async t => ({
                id: t.id,
                tag: await aesDecrypt(t.encryptedTag, localKey)
            })))
            return {
                id: it.id,
                meta,
                key,
                tags
            }
        }))
    })
}

ZHTDatabase.prototype.queryItemsByTag = async function(tags: string[], {offset, limit}: DBLimit, {localKey, hashSalt}: DBKeys): Promise<ItemIndexData[]> {
    const hashedTags = await Promise.all(tags.map(t => sha256Hash(`${t}:${hashSalt}`)))
    return await this.transaction("r", [this.items, this.tags], async () => {
        const matchedTags = await this.tags.where("hashed").anyOf(hashedTags).toArray()
        const itemIdList = matchedTags.map(t => t.itemId)
        const matchedItems = await this.items.where("id").anyOf(itemIdList).offset(offset).limit(limit).toArray()
        return await Promise.all(matchedItems.map(async it => {
            const meta = JSON.parse(await aesDecrypt(it.encryptedMeta, localKey))
            const key = await aesDecrypt(it.encryptedKey, localKey)
            const tagsCur = await this.tags.where("itemId").equals(it.id).toArray()
            const tags: ItemTagData[] = await Promise.all(tagsCur.map(async t => ({
                id: t.id,
                tag: await aesDecrypt(t.encryptedTag, localKey)
            })))
            return {
                id: it.id,
                meta,
                key,
                tags
            }
        }))
    })
}

ZHTDatabase.prototype.deleteItems = async function (itemIds: number[]): Promise<void> {
    await this.transaction('rw', [this.items, this.tags], async () => {
        await this.items.where("id").anyOf(itemIds).delete()
        await this.tags.where("itemId").anyOf(itemIds).delete()
    })
}
