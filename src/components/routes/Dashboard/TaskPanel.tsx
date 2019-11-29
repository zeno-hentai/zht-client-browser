import React, { useEffect } from 'react'
import { Typography } from '@material-ui/core'
import { ManageList, ManageListItem } from './ManageList'
import { showCreateTaskDialog } from '../../CreateTaskDialog'
import { client } from '../../../actions/base'
import { authStore } from '../../../store'
import { observer } from 'mobx-react'
import { observable, action } from 'mobx'
import { WorkerTaskInfo } from 'zht-client-api'

type TaskStoreStatus = {
    status: 'LOADING'
} | {
    status: 'DONE'
    tasks: WorkerTaskInfo[]
}

class TaskStore {
    @observable status: TaskStoreStatus = {status: 'LOADING'}
    @action init(){
        this.status = {status: 'LOADING'}
    }
    @action setTasks(tasks: WorkerTaskInfo[]){
        this.status = {status: 'DONE', tasks}
    }
}

const taskStore = new TaskStore()

async function loadTasks(){
    taskStore.init()
    const tasks = await client.queryWorkerTasks(authStore.privateKey)
    taskStore.setTasks(tasks)
}

async function deleteTask(id: number){
    await client.deleteTask(id)
    await loadTasks()
}

const TaskPanelBody = observer(() => (
    <ManageList title="Tasks" onCreate={showCreateTaskDialog}>
        {
            taskStore.status.status === 'LOADING' ? <Typography>Loading...</Typography> :
                taskStore.status.tasks.map(t => (
                    <ManageListItem onDelete={() => deleteTask(t.id)} key={t.id}>
                        {t.url} [{t.status}] by {t.workerTitle} ({t.workerId})
                    </ManageListItem>
                ))
        }
    </ManageList>
))

export const TaskPanel = () => {
    useEffect(() => {
        loadTasks()
    }, [])
    return <TaskPanelBody/>
}