import { ZHTClientAPI, ZHTBaseMeta, ItemIndexData } from 'zht-client-api';
import { itemStore } from '../store/item';
import { authStore } from '../store/auth';
import { zError } from './utils';
import { getUpdateTimeStamp, saveUpdateTimeStamp } from '../localData/localStorage';
import {chunk} from 'lodash'
import moment from 'moment';
import { ListedItemIndex } from '../types/item';
import Ajv from 'ajv'
import { viewerIndex } from '../components/viewers';
import { client, zhtDB } from './base';
import { getOffsetLimit } from '../utils/paging';

const UPDATE_CHUNK = 20
export const HomePageSize = 50

async function checkItem(item: ItemIndexData, files: {[key: string]: string}): Promise<ListedItemIndex<any>> {
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
        files,
        type: meta.type,
        item
    }
}

export async function pullItemsData(tags: string[], page: number) {
    const currentStatus = authStore.status
    if(currentStatus.status !== 'DONE'){
        return zError("Local keys not loaded")
    }
    const thisUpdate = moment()
    const lastUpdate = getUpdateTimeStamp()
    itemStore.pullData()
    const total = await client.getItemsTotal()
    itemStore.updateTotal(total)
    const itemIdList = await client.updatedItemIdsAfter(lastUpdate)
    itemStore.updateProcess(0)
    const deletedItemId = await client.deletedItemIdsAfter(lastUpdate)
    await zhtDB.deleteItems(deletedItemId)
    let idx = 0
    for(let id of itemIdList){
        let checkedItem: ListedItemIndex<any> | null = null 
        itemStore.updateProcess((deletedItemId.length + idx) / (deletedItemId.length + itemIdList.length))
        try{
            const item = await client.getItem(id, currentStatus.localKey.userPrivateKey, t => t)
            const files = await client.getFileMap(item.id, item.key)
            checkedItem = await checkItem(item, files)
        }catch(err){
            console.error(err)
            checkedItem = {id, status: 'EXCEPTION'}
        }
        await zhtDB.updateItems([checkedItem], currentStatus.localKey)
        idx++
    }
    itemStore.updateProcess(1)
    const items = await(tags.length === 0 ? 
        zhtDB.getItems(getOffsetLimit(page), currentStatus.localKey): 
        zhtDB.queryItemsByTag(tags, getOffsetLimit(page), currentStatus.localKey)
    )
    itemStore.setItems(page, tags, items)
    saveUpdateTimeStamp(thisUpdate)
}

export async function deleteItem(itemId: number){
    await client.deleteItem(itemId)
    if(itemStore.status.status === 'LOADED_DATA'){
        const {tags, page} = itemStore.status
        await pullItemsData(tags, page)
    }
}