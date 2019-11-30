import {observable, action} from 'mobx'
import { ListedItemIndex } from '../types/';


export type ItemStatus = {
    status: 'INITIALIZED'
} | {
    status: 'START_PULLING_DATA'
} | {
    status: 'UPDATE_TOTAL',
    total: number
} | {
    status: 'UPDATE_PROGRESS',
    progress: number
    total: number
} | {
    status: 'MERGING_DATA',
    total: number
} | {
    status: 'LOADED_DATA'
    offset: number,
    limit: number,
    total: number,
    tags: string[],
    items: ListedItemIndex<any>[]
}

export class ItemStore {
    @observable status: ItemStatus = {status: 'INITIALIZED'}
    
    private error(message: string): never {
        throw new Error(message)
    }

    @action pullData(){
        if(this.status.status !== 'INITIALIZED' && this.status.status !== 'LOADED_DATA'){
            return this.error(`Invalid status: ${this.status.status}`)
        }
        this.status = {status: 'START_PULLING_DATA'}
    }

    @action updateTotal(total: number){
        if(this.status.status !== 'START_PULLING_DATA'){
            return this.error(`Invalid status: ${this.status.status}`)
        }
        this.status = {status: 'UPDATE_TOTAL', total}
    }

    @action updateProcess(progress: number){
        if(this.status.status !== 'UPDATE_TOTAL' && this.status.status !== 'UPDATE_PROGRESS'){
            return this.error(`Invalid status: ${this.status.status}`)
        }
        this.status = {status: 'UPDATE_PROGRESS', progress, total: this.status.total}
    }

    @action setItems(offset: number, limit: number, tags: string[], items: ListedItemIndex<any>[]) {
        if(this.status.status !== 'UPDATE_PROGRESS'){
            return this.error(`Invalid status: ${this.status.status}`)
        }
        this.status = {status: 'LOADED_DATA', total: this.status.total, tags, offset, limit, items}
    }
}

export const itemStore = new ItemStore()