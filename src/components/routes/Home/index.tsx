import React, { useEffect } from 'react'
import { pullItemsData } from '../../../actions'
import { observer } from 'mobx-react';
import { itemStore } from '../../../store/item';
import { ItemList } from './ItemList';
import { RouteComponentProps, Route } from 'react-router';
import { parseTags } from '../../../actions/search';

const HomeBody = observer(() => (
    itemStore.status.status === 'LOADED_DATA' ?
        <ItemList/> :
        itemStore.status.status === 'UPDATE_PROGRESS' ?
        <div>Syncing ... {(itemStore.status.progress * 100).toFixed(2)} %</div> :
        <div>Loading ... </div>
))

interface HomeProps {
    encryptedTags?: string
}

async function queryItems(page: number, encryptedTags?: string){
    const tags = encryptedTags? await parseTags(encryptedTags) : []
    await pullItemsData(tags, page)
}

export const Home = (props1: RouteComponentProps<HomeProps>) => {
    const encryptedTags = props1.match.params.encryptedTags || ''
    const C = (props2: RouteComponentProps<{page?: string}>) => {
        useEffect(() => {
            const page = props2.match.params.page ? parseInt(props2.match.params.page) : 0
            queryItems(page, encryptedTags)
        }, [props2.match.params.page])
        return <HomeBody/>
    }
    return (<Route>
        <Route path={props1.match.url} exact component={C}/>
        <Route path={`${props1.match.url}/:page`} exact component={C}/>
    </Route>)
}