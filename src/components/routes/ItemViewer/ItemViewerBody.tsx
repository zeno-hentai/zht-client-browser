import React from 'react';
import { ItemIndexData, ZHTBaseMeta } from 'zht-client-api';
import { viewerIndex } from '../../viewers';
import { loadCachedFile } from '../../../actions';

interface ItemViewerBodyProps {
    type: string
    item: ItemIndexData<ZHTBaseMeta<any>>
    files: {[key: string]: string}
}

export const ItemViewerBody = (props: ItemViewerBodyProps) => {
    const viewer = viewerIndex[props.type]
    if(!viewer){
    return <div>Invalid viewer: {props.type}</div>
    }
    return <viewer.Viewer
        item={props.item}
        fileMap={props.files}
        downloadFile={(n, p) => loadCachedFile(n, props.item, props.files, p)}
    />
}