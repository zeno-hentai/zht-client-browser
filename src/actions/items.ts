import { ZHTClientAPI, ZHTBaseMeta, ItemIndexData } from 'zht-client-api';
import { itemStore } from '../store/item';
import { localKeyStore } from '../store/key';
import { zError } from './utils';
import { getUpdateTimeStamp, saveUpdateTimeStamp } from '../localData/localStorage';
import {chunk} from 'lodash'
import moment from 'moment';
import { ZHTDatabase } from '../localData';
import { ListedItemIndex } from '../types/item';
import Ajv from 'ajv'
import { viewerIndex } from '../components/viewers';

const client = new ZHTClientAPI({
    baseURL: '/'
})

const zhtDB = new ZHTDatabase('zht-items-db', 1)

const UPDATE_CHUNK = 20

async function checkItem(item: ItemIndexData): Promise<ListedItemIndex<any>> {
    const viewer = viewerIndex[item.meta['type']]
    if(!viewer){
        return { status: "UNKNOWN_TYPE", id: item.id }
    }
    const meta: ZHTBaseMeta<any> = item.meta
    const ajv = new Ajv()
    if(!ajv.validate(viewer.schema(), meta)){
        return { status: "INVALID_META", id: item.id }
    }
    return {
        status: "OK",
        id: item.id,
        type: meta.type,
        item
    }
}

export async function pullItemsData(tags: string[], offset: number, limit: number) {
    const currentStatus = localKeyStore.status
    if(currentStatus.status != 'LOADED_LOCAL_KEY'){
        return zError("Local keys not loaded")
    }
    const lastUpdate = getUpdateTimeStamp()
    saveUpdateTimeStamp(moment())
    itemStore.pullData()
    const total = await client.getItemsTotal()
    itemStore.updateTotal(total)
    const itemIdList = await client.updatedItemIdsAfter(lastUpdate)
    await Promise.all(chunk(itemIdList, UPDATE_CHUNK).map(async (chunk, idx, {length}) => {
        itemStore.updateProcess(idx / length)
        const items = await Promise.all(chunk.map(id => client.getItem(id, currentStatus.localKey.userPrivateKey, t => t)))
        await zhtDB.updateItems(items, currentStatus.localKey)
    }))
    const items = await(tags.length === 0 ? 
        zhtDB.getItems({offset, limit}, currentStatus.localKey): 
        zhtDB.queryItemsByTag([], {offset, limit}, currentStatus.localKey)
    )
    itemStore.setItems(offset, limit, await Promise.all(items.map(checkItem)))
}