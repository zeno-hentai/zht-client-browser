import React from 'react'
import { observer, useObserver, useLocalStore } from 'mobx-react'
import { Fab, Grid } from '@material-ui/core'
import { CSSProperties } from '@material-ui/styles'
import AddIcon from '@material-ui/icons/Add';
import MenuIcon from '@material-ui/icons/Menu';
import { HomeMenu } from './HomeMenu';
import { showCreateTaskDialog } from '../../CreateTaskDialog';
import { itemStore } from '../../../store';
import { ItemListDisabled, ItemListThumbnail } from './ItemListItem';

const buttonBoxStyle: CSSProperties = {
    position: 'fixed',
    bottom: '3rem',
    right: '2rem',
}

const ButtonBox = () => {
    const store = useLocalStore(() => ({
        menuOpen: false,
        openMenu(){this.menuOpen = true},
        closeMenu(){this.menuOpen = false}
    }))
    return useObserver(() => <div style={buttonBoxStyle}>
        <HomeMenu open={store.menuOpen} onClose={() => store.closeMenu()}/>
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Fab
                    size="large"
                    color="primary"
                    onClick={() => showCreateTaskDialog()}
                    >
                        <AddIcon/>
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

const ItemListBody = observer(() => (
    itemStore.status.status !== 'LOADED_DATA' ? <div>Loading...</div> :
    <Grid container>
        {itemStore.status.items.map(it => 
            <Grid item xs={3} key={it.id} style={{padding: '0.5rem'}}>
            {
                it.status !== 'OK' ?
                <ItemListDisabled id={it.id} status={it.status}/> :
                <ItemListThumbnail item={it.item} files={it.files}/>
            }
            </Grid>
        )}
    </Grid>
))

export const ItemList = observer(() => (
    <div>
        <ItemListBody/>
        <ButtonBox/>
    </div>
))