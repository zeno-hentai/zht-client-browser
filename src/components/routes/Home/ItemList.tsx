import React, { useState, useEffect } from 'react'
import { observer } from 'mobx-react'
import { Grid, TextField, Typography } from '@material-ui/core'
import { itemStore } from '../../../store';
import { ItemListDisabled, ItemListThumbnail } from './ItemListItem';
import { toSearchPage } from '../../../actions/search';
import { ButtonBox } from './ButtonBox';

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

const SearchBar = () => {
    const [searchText, setSearchText] = useState("")
    useEffect(() => {
        if(itemStore.status.status === 'LOADED_DATA'){
            setSearchText(itemStore.status.tags.join(" "))
        }
    }, [])
    return <Grid container>
        <Grid item xs={12}>
            <TextField
                fullWidth
                value={searchText}
                onChange={evt => setSearchText(evt.target.value)}
                onKeyDown={evt => {
                    if(evt.keyCode === 13){
                        toSearchPage(searchText)
                    }
                }}
            />
        </Grid>
    </Grid>
}

export const ItemList = observer(() => (
    <div>
        <SearchBar/>
        <ItemListBody/>
        <ButtonBox/>
        <Typography>End of Page</Typography>
    </div>
))