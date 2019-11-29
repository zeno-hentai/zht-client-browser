import React, { useState, useEffect } from 'react'
import { WorkerInfo } from 'zht-client-api'
import { client } from '../actions/base'
import { authStore } from '../store'
import { Dialog, DialogContent, DialogTitle, DialogActions, Button, TextField, List, ListItem } from '@material-ui/core'
import { observer } from 'mobx-react-lite'
import { observable, action } from 'mobx'
import { zError } from '../actions/utils'
import { Provider } from 'mobx-react'


type DialogStoreStatus = {
    status: "HIDDEN"
} | {
    status: "LOADING_WORKERS"
} | {
    status: "SELECT_WORKER"
    workers: WorkerInfo[]
} | {
    status: "INPUT_URL"
    worker: WorkerInfo
}

class DialogStore {
    @observable status: DialogStoreStatus = {status: 'HIDDEN'}
    @observable url = ""
    @action show(){
        if(this.status.status !== "HIDDEN") return zError("Invalid Status")
        this.status = {status: 'LOADING_WORKERS'}
    }

    @action setWorkers(workers: WorkerInfo[]){
        if(this.status.status !== "LOADING_WORKERS") return zError("Invalid Status")
        this.status = {status: "SELECT_WORKER", workers}
    }

    @action selectWorker(worker: WorkerInfo){
        if(this.status.status !== "SELECT_WORKER") return zError("Invalid Status")
        this.status = {status: "INPUT_URL", worker}
    }

    @action setUrl(url: string){
        this.url = url
    }

    @action hide(){
        this.status = {status: 'HIDDEN'}
        this.url = ""
    }
}

const dialogStatus = new DialogStore()

async function createTask(){
    if(dialogStatus.status.status!=='INPUT_URL' || !dialogStatus.status.worker.online) return zError("Invalid Status")
    await client.addWorkerTask(
        dialogStatus.url, 
        authStore.userInfo.publicKey,
        dialogStatus.status.worker.id,
        dialogStatus.status.worker.publicKey
    )
    dialogStatus.hide()
}

const WorkerList = observer(() => (
    dialogStatus.status.status !== 'SELECT_WORKER' ? null :
    <List>
        {dialogStatus.status.workers.map(w => 
            <ListItem
                onClick={() => w.online && dialogStatus.selectWorker(w)}
                key={w.id}
                disabled={!w.online}
                >[{w.id}] {w.title}</ListItem>
        )}
    </List>
))
const UrlInput = observer(() => (
    <div>
        <TextField
            label="URL"
            fullWidth
            value={dialogStatus.url}
            onChange={evt => dialogStatus.setUrl(evt.target.value)}
        />
    </div>
))

const DialogBody = observer(() => (
    <Dialog open={dialogStatus.status.status !== 'HIDDEN'} onClose={() => dialogStatus.hide()}>
        <DialogContent>
            <DialogTitle>Create Task</DialogTitle>
            {
                dialogStatus.status.status === 'LOADING_WORKERS' ?
                    <div>Loading...</div>:
                    dialogStatus.status.status === 'SELECT_WORKER' ?
                        <WorkerList/> :
                        dialogStatus.status.status === 'INPUT_URL' ?
                        <UrlInput/> : null
            }
        </DialogContent>
        <DialogActions>
            <Button onClick={() => dialogStatus.hide()}>CANCEL</Button>
            {dialogStatus.status.status === 'INPUT_URL' ? 
                <Button onClick={createTask}>CREATE</Button> : null
            }
        </DialogActions>
    </Dialog>
))

export const CreateTaskDialog = () => {
    return <Provider store={dialogStatus}>
        <DialogBody/>
    </Provider>
}

export async function showCreateTaskDialog(){
    dialogStatus.show()
    const workers = await client.queryWorkers(authStore.privateKey)
    dialogStatus.setWorkers(workers)
}