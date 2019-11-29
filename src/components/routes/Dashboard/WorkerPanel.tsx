import React, { useEffect } from 'react'
import { Typography } from '@material-ui/core'
import { observer } from 'mobx-react-lite'
import { Provider } from 'mobx-react'
import { observable, action } from 'mobx';
import { ManageList, ManageListItem } from './ManageList';
import { client } from '../../../actions/base';
import { authStore } from '../../../store/auth';
import { WorkerInfo } from 'zht-client-api';

type WorkerStoreStatus = {
    status: 'LOADING'
} | {
    status: 'DONE'
    workers: WorkerInfo[]
}

class WorkerStore {
    @observable status: WorkerStoreStatus = {status: 'LOADING'}
    @action startLoading(){
        this.status = {status: 'LOADING'}
    }
    @action setWorkers(workers: WorkerInfo[]){
        this.status = {status: 'DONE', workers}
    }
}

const store = new WorkerStore()

async function loadWorkers(){
    store.startLoading()
    const workers = await client.queryWorkers(authStore.privateKey)
    store.setWorkers(workers)
}

async function deleteWorker(workerId: number){
    await client.deleteWorker(workerId)
    await loadWorkers()
}

const WorkerListItem = ({item}: {item: WorkerInfo}) => (
    <ManageListItem onDelete={() => deleteWorker(item.id)}>
        <Typography>{item.title}</Typography>
        <Typography>{item.online ? "online" : "unavailable"}</Typography>
    </ManageListItem>
)

const WorkerPanelBody = observer(() => (
    <ManageList title="Workers">
        {
            store.status.status === 'LOADING' ?
                <div>Loading...</div> :
                store.status.workers.map(w => (
                    <WorkerListItem item={w} key={w.id}/>
                ))
        }
    </ManageList>
))

export const WorkerPanel = () => {
    useEffect(() => {
        loadWorkers()
    }, [])
    return (
        <Provider store={store}>
            <WorkerPanelBody/>
        </Provider>
    )
}