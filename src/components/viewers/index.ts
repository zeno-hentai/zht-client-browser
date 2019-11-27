import { ZHTItemViewer } from '../../types/viewer';
import { GalleryViewer } from './GalleryViewer/index';

const viewerList: ZHTItemViewer<any>[] = [
    GalleryViewer
]

// Initialize viewers

export const viewerIndex: {[key: string]: ZHTItemViewer<any>} = {}
for(let v of viewerList){
    viewerIndex[v.type] = v
}