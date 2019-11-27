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
    items: ListedItemIndex<any>[]
}

export class ItemStore {
    @observable items: ItemStatus = {status: 'INITIALIZED'}
    
    private error(message: string): never {
        throw new Error(message)
    }

    @action pullData(){
        if(this.items.status !== 'INITIALIZED' && this.items.status !== 'LOADED_DATA'){
            return this.error(`Invalid status: ${this.items.status}`)
        }
        this.items = {status: 'START_PULLING_DATA'}
    }

    @action updateTotal(total: number){
        if(this.items.status !== 'START_PULLING_DATA'){
            return this.error(`Invalid status: ${this.items.status}`)
        }
        this.items = {status: 'UPDATE_TOTAL', total}
    }

    @action updateProcess(progress: number){
        if(this.items.status !== 'UPDATE_TOTAL' && this.items.status !== 'UPDATE_PROGRESS'){
            return this.error(`Invalid status: ${this.items.status}`)
        }
        this.items = {status: 'UPDATE_PROGRESS', progress, total: this.items.total}
    }

    @action setItems(offset: number, limit: number, items: ListedItemIndex<any>[]) {
        if(this.items.status != 'UPDATE_PROGRESS'){
            return this.error(`Invalid status: ${this.items.status}`)
        }
        this.items = {status: 'LOADED_DATA', total: this.items.total, offset, limit, items}
    }
}

export const itemStore = new ItemStore()