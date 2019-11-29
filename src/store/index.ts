import { authStore } from './auth';
import { ItemStore } from './item';
export * from './auth'
export * from './item'

export const globalStores = {
    localKeyStore: authStore,
    ItemStore
}