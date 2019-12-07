import JSZip from 'jszip'
import { ItemIndexData, ZHTBaseMeta } from 'zht-client-api';
import { client } from '../actions/base';
import { loadCachedFile } from '../actions';
import { authStore } from '../store';
import { zError } from '../actions/utils';
import { viewerIndex } from '../components/viewers';
import Ajv from 'ajv';

export async function exportZipFile(item: ItemIndexData<ZHTBaseMeta<any>>, files: {[key: string]: string}): Promise<ArrayBuffer> {
    const zip = new JSZip()
    zip.file("meta.json", JSON.stringify(item.meta))
    zip.file("tags.json", JSON.stringify(item.tags.map(t => t.tag)))
    const res = zip.folder("resources")
    for(let name of Object.keys(files)){
        const data = await loadCachedFile(name, item, files)
        res.file(name, data)
    }
    return await zip.generateAsync({type: "arraybuffer"})
}

function checkSchema(schema: any, data: any): boolean {
    const ajv = new Ajv()
    return !!ajv.validate(schema, data)
}

export async function importZipFile(data: ArrayBuffer): Promise<number> {
    const zip = await JSZip.loadAsync(data)
    const meta: ZHTBaseMeta<any> = JSON.parse(await zip.file("meta.json").async('text'))
    const tags = JSON.parse(await zip.file("tags.json").async('text'))
    if(!checkSchema(await import('./res/tagsList.schema.json'), tags)) 
        return zError("Invalid tag format.")
    const viewer = viewerIndex[meta.type]
    if(!viewer)
        return zError("Invalid meta type.")
    if(!checkSchema(viewer.schema(), meta)) 
        return zError("Invalid meta format.")
    const res = zip.folder("resources")
    const {id, key} = await client.createItem({
        meta, tags
    }, authStore.userInfo.publicKey)
    const files: [string, Promise<ArrayBuffer>][] = []
    res.forEach((p, f) => {
        files.push([p, f.async('arraybuffer')])
    })
    for(let [p, f] of files){
        const d = await f
        await client.uploadFile(id, p, key, d)
    }
    return id
}