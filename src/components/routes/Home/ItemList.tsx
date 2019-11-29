import React from 'react'
import { observer, useObserver, useLocalStore } from 'mobx-react'
import { Fab, Grid } from '@material-ui/core'
import { CSSProperties } from '@material-ui/styles'
import AddIcon from '@material-ui/icons/Add';
import MenuIcon from '@material-ui/icons/Menu';
import { HomeMenu } from './HomeMenu';
import { showCreateTaskDialog } from '../../CreateTaskDialog';
import { itemStore } from '../../../store';

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

export const ItemList = observer(() => (
    <div>
        <ButtonBox/>
        {JSON.stringify(itemStore.status.status==='LOADED_DATA' && itemStore.status.items)}
    </div>
))