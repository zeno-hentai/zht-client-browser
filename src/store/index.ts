import { localKeyStore } from './key';
import { ItemStore } from './item';
export * from './key'
export * from './item'

export const globalStores = {
    localKeyStore,
    ItemStore
}