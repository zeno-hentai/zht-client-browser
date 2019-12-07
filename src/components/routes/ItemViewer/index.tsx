import React, { useState, useEffect } from 'react'
import { RouteComponentProps } from 'react-router'
import { ItemIndexData } from 'zht-client-api'
import { zhtDB } from '../../../actions/base'
import { authStore } from '../../../store'
import { ItemViewerBody } from './ItemViewerBody'

type ItemViewerStats = {
    status: "LOADING"
} | {
    status: "FAILED"
    error: string
} | {
    status: "DONE"
    item: ItemIndexData<any>
    type: string
    files: {[key: string]: string}
}

export const ItemViewer = (props: RouteComponentProps<{id: string}>) => {
    const itemId = parseInt(props.match.params.id)
    const [status, setStatus] = useState<ItemViewerStats>({status: 'LOADING'})
    useEffect(() => {
        async function loadItemData(){
            const listedItem = await zhtDB.getItem(itemId, authStore.localKey)
            if(listedItem === null){
                setStatus({
                    status: 'FAILED',
                    error: 'Item not found'
                })
            }else if(listedItem.status === 'OK'){
                const {item, files, type} = listedItem
                setStatus({
                    status: 'DONE',
                    type, item, files
                })
            }else{
                setStatus({
                    status: 'FAILED',
                    error: `Invalid item: ${listedItem.status}`
                })
            }
        }
        loadItemData()
    }, [itemId])
    if(status.status === 'LOADING'){
        return <div>Loading...</div>
    }else if(status.status === 'FAILED'){
        return <div>{status.error}</div>
    }else{
        return (<div>
            <ItemViewerBody type={status.type} item={status.item} files={status.files}/>
        </div>)
    }
}