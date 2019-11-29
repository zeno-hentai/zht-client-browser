import React, { useEffect } from 'react'
import { pullItemsData } from '../../../actions'
import { observer } from 'mobx-react';
import { itemStore } from '../../../store/item';
import { ItemList } from './ItemList';

const HomeBody = observer(() => (
    itemStore.status.status === 'LOADED_DATA' ?
        <ItemList/> :
        itemStore.status.status === 'UPDATE_PROGRESS' ?
        <div>Syncing ... {(itemStore.status.progress * 100).toFixed(2)} %</div> :
        <div>Loading ... </div>
))

export const Home = () => {
    useEffect(() => {
        pullItemsData([], 0, 50)
    }, [])
    return <HomeBody/>
}