import React, { useState, useEffect } from 'react'
import { ZHTBaseMeta, ItemIndexData } from "zht-client-api";
import { ListedItemIndex } from "../../../types";
import { Card, CardContent, Typography, CardActions, Button, CardActionArea, CardHeader, IconButton, Menu, MenuItem, Divider } from "@material-ui/core";
import { deleteItem, loadCachedFile } from '../../../actions';
import { viewerIndex } from '../../viewers';
import { zhtDB } from '../../../actions/base';
import MoreVertIcon from '@material-ui/icons/MoreVert'
import { zhtHistory } from '..';
import { PopoverPosition } from '@material-ui/core/Popover';
import { CSSProperties } from '@material-ui/styles';
import { exportZipFile } from '../../../utils/zip';
import fileSaver from 'file-saver'
import { itemStore } from '../../../store';
import { toSearchPage } from '../../../actions/search';

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
const PruneButton = (props: {itemId: number, open: boolean}) => {
    const [sizeText, setSizeText] = useState("...")
    async function prune(){
        await zhtDB.pruneFileCache(props.itemId)
        setSizeText('0 B')
    }
    useEffect(() => {
        async function loadCacheSize(){
            const size = await zhtDB.getFileCacheSize(props.itemId)
            if(size === 0){
                setSizeText('0 B')
            }else{
                const level = Math.min(Math.floor(Math.log(size) / Math.log(1024)), 3)
                setSizeText(`${(size / Math.pow(1024, level)).toFixed(0)} ${PruneButtonCacheSize[level]}`)
            }
        }
        if(props.open){
            loadCacheSize()
        }
    }, [props.open, props.itemId])
    return <MenuItem onClick={prune}>Prune ({sizeText})</MenuItem>
}
const titleContainerStyle: CSSProperties = {overflowX: 'hidden', maxWidth: '100%', maxHeight: '3rem', overflowY: 'auto', fontSize: '1rem'}

async function exportItem(props: ItemListThumbnailProps) {
    const data = await exportZipFile(props.item, props.files)
    const blob = new Blob([data])
    fileSaver.saveAs(blob, `${props.item.meta.title}.zht.zip`)
}

function addTagToSearchBar(tag: string){
    const oldTags = itemStore.status.status === 'LOADED_DATA' ? itemStore.status.tags : []
    const newTags = [...oldTags, tag]
    toSearchPage(newTags.join(' '))
}

export const ItemListThumbnail = (props: ItemListThumbnailProps) => {
    const [anchorEl, setAnchorEl] = useState<PopoverPosition | undefined>(undefined)
    const onClick = () => zhtHistory.push(`/view/${props.item.id}`, {previousPath: zhtHistory.location.pathname})
    const opened = !!anchorEl
    return (<Card>
        <Menu 
            open={opened} 
            onClose={() => setAnchorEl(undefined)}
            anchorPosition={anchorEl}
            anchorReference="anchorPosition"
            >
            {props.item.tags.map(t => 
                <MenuItem 
                    key={t.id} 
                    onClick={() => addTagToSearchBar(t.tag)}
                    >{t.tag}</MenuItem>
            )}
            <Divider/>
            <PruneButton itemId={props.item.id} open={opened}/>
            <MenuItem button onClick={() => exportItem(props)}>Export</MenuItem>
            <Divider/>
            <MenuItem button onClick={() => deleteItem(props.item.id)}>Delete</MenuItem>
        </Menu>
        <CardHeader
            title={
                <CardActionArea onClick={onClick}>
                    <Typography style={titleContainerStyle}>{props.item.meta.title}</Typography>
                </CardActionArea>
            }
            disableTypography
            action={
                <IconButton aria-label="settings" onClick={(evt) => setAnchorEl({top: evt.clientY, left: evt.clientX})}>
                  <MoreVertIcon />
                </IconButton>
              }
        />
        <CardActionArea onClick={onClick}>
            {renderViewer(props)}
        </CardActionArea>
    </Card>)
}