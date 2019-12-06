import React, { useState, useEffect } from 'react'
import { ZHTBaseMeta, ItemIndexData } from "zht-client-api";
import { ListedItemIndex } from "../../../types";
import { Card, CardContent, Typography, CardActions, Button, CardActionArea, CardHeader, IconButton, Popover, Menu, MenuItem } from "@material-ui/core";
import { deleteItem, loadCachedFile } from '../../../actions';
import { viewerIndex } from '../../viewers';
import { zhtDB } from '../../../actions/base';
import MoreVertIcon from '@material-ui/icons/MoreVert'
import { zhtHistory } from '..';
import { PopoverPosition } from '@material-ui/core/Popover';
import { CSSProperties } from '@material-ui/styles';

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

const PruneButtonCacheSize = ['B', 'KB', 'MB', 'GB']
const PruneButton = (props: {itemId: number}) => {
    const [sizeText, setSizeText] = useState("...")
    async function loadCacheSize(){
        const size = await zhtDB.getFileCacheSize(props.itemId)
        if(size === 0){
            setSizeText('0 B')
        }else{
            const level = Math.min(Math.floor(Math.log(size) / Math.log(1024)), 3)
            setSizeText(`${(size / Math.pow(1024, level)).toFixed(0)} ${PruneButtonCacheSize[level]}`)
        }
    }
    async function prune(){
        await zhtDB.pruneFileCache(props.itemId)
        await loadCacheSize()
    }
    useEffect(() => {loadCacheSize()}, [])
    return <MenuItem onClick={prune}>Prune ({sizeText})</MenuItem>
}

const titleStyle: CSSProperties = {fontSize: '1rem', overflowX: 'hidden', whiteSpace: 'nowrap'}

export const ItemListThumbnail = (props: ItemListThumbnailProps) => {
    const [anchorEl, setAnchorEl] = useState<PopoverPosition | undefined>(undefined)
    
    return <Card>
        <Menu 
            open={!!anchorEl} 
            onClose={() => setAnchorEl(undefined)}
            anchorPosition={anchorEl}
            anchorReference="anchorPosition"
            >
            <PruneButton itemId={props.item.id}/>
            <MenuItem button onClick={() => deleteItem(props.item.id)}>DELETE</MenuItem>
        </Menu>
        <CardHeader
            title={props.item.meta.title}
            titleTypographyProps={{style: titleStyle}}
            action={
                <IconButton aria-label="settings">
                  <MoreVertIcon />
                </IconButton>
              }
              onClick={(evt) => setAnchorEl({top: evt.clientY, left: evt.clientX})}
        />
        <CardActionArea onClick={() => zhtHistory.push(`/view/${props.item.id}`, {previousPath: zhtHistory.location.pathname})}>
            {renderViewer(props)}
        </CardActionArea>
    </Card>
}