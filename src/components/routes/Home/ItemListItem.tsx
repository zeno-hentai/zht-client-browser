import React from 'react'
import { ZHTBaseMeta, ItemIndexData } from "zht-client-api";
import { ListedItemIndex } from "../../../types";
import { Card, CardContent, Typography, CardActions, Button, CardActionArea } from "@material-ui/core";
import { deleteItem, loadCachedFile } from '../../../actions';
import { viewerIndex } from '../../viewers';
import { zError } from '../../../actions/utils';
import { client } from '../../../actions/base';
import { zhtHistory } from '..';

interface ItemListDisabledProps {
    id: number
    status: Exclude<ListedItemIndex<any>['status'], 'OK'>
}

interface ItemListThumbnailProps {
    item: ItemIndexData<ZHTBaseMeta<any>>
    files: {[key: string]: string}
}

export const ItemListDisabled = (props: ItemListDisabledProps) => (
    <Card>
        <CardContent>
            <Typography>Not available: {props.status}</Typography>
        </CardContent>
        <CardActions>
            <Button onClick={() => deleteItem(props.id)}>DELETE</Button>
        </CardActions>
    </Card>
)

function renderViewer({item, files}: ItemListThumbnailProps){
    const {Thumbnail} = viewerIndex[item.meta.type]
    async function downloadFile(name: string, onProgress?: (p: any) => void){
        return await loadCachedFile(name, item, files, onProgress)
    }
    return <Thumbnail
        item={item}
        fileMap={files}
        downloadFile={downloadFile}
    />
}

export const ItemListThumbnail = (props: ItemListThumbnailProps) => (
    <Card>
        <CardActionArea onClick={() => zhtHistory.push(`/view/${props.item.id}`)}>
            {renderViewer(props)}
        </CardActionArea>
        <CardActions>
            <Button onClick={() => deleteItem(props.item.id)}>DELETE</Button>
        </CardActions>
    </Card>
)