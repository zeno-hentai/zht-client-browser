
import React, {CSSProperties} from 'react';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import LinkIcon from '@material-ui/icons/Link';
import MenuIcon from '@material-ui/icons/Menu';
import CloudUpload from '@material-ui/icons/CloudUpload';
import { HomeMenu } from './HomeMenu';
import { showCreateTaskDialog } from '../../CreateTaskDialog';
import {useObserver, useLocalStore} from 'mobx-react-lite'
import { Grid, Fab } from '@material-ui/core';
import { importZipFile } from '../../../utils/zip';
import { pullItemsData } from '../../../actions';
import { itemStore } from '../../../store';

const buttonBoxStyle: CSSProperties = {
    position: 'fixed',
    bottom: '3rem',
    right: '2rem',
}

async function handleImport(evt: React.ChangeEvent<HTMLInputElement>){
    if(!evt.target.files) return;
    let tags: string[] = []
    let page: number = 0
    if(itemStore.status.status === 'LOADED_DATA'){
        tags = itemStore.status.tags
        page = itemStore.status.page
    }
    for(let file of evt.target.files){
        const data = await new Promise<ArrayBuffer>((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => {
                resolve(reader.result as ArrayBuffer)
            }
            reader.onerror = () => {
                reject(reader.error)
            }
            reader.readAsArrayBuffer(file)
        })
        await importZipFile(data)
    }
    await pullItemsData(tags, page)
}

export const ButtonBox = () => {
    const store = useLocalStore(() => ({
        menuOpen: false,
        moreButtons: false,
        openMenu(){this.menuOpen = true},
        closeMenu(){this.menuOpen = false},
        showMoreButton(){this.moreButtons = true},
        hideMoreButton(){this.moreButtons = false}
    }))
    return useObserver(() => <div style={buttonBoxStyle}>
        <HomeMenu open={store.menuOpen} onClose={() => store.closeMenu()}/>
        <Grid container spacing={3}>
            <Grid item xs={12} hidden={store.moreButtons}>
                <Fab
                    size="large"
                    color="primary"
                    onClick={() => store.showMoreButton()}
                    >
                        <AddIcon/>
                </Fab>
            </Grid>
            <Grid item xs={12} hidden={!store.moreButtons}>
                <Fab
                    size="large"
                    color="primary"
                    onClick={() => showCreateTaskDialog()}
                    >
                        <LinkIcon/>
                </Fab>
            </Grid>
            <Grid item xs={12} hidden={!store.moreButtons}>
                <input
                    accept="application/zip"
                    style={{display: 'none'}}
                    id="upload-zip-button"
                    multiple
                    type="file"
                    onChange={handleImport}
                />
                <label htmlFor="upload-zip-button">
                    <Fab
                        size="large"
                        color="default"
                        component="span"
                        >
                            <CloudUpload/>
                    </Fab>
                </label>
            </Grid>
            <Grid item xs={12} hidden={!store.moreButtons}>
                <Fab
                    size="medium"
                    color="inherit"
                    onClick={() => store.hideMoreButton()}
                    >
                        <CloseIcon/>
                </Fab>
            </Grid>
            <Grid item xs={12}>
                <Fab
                    size="large"
                    color="secondary"
                    onClick={() => store.openMenu()}
                    >
                        <MenuIcon/>
                </Fab>
            </Grid>
        </Grid>
    </div>)
}
