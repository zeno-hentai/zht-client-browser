import { authStore } from './auth';
import { itemStore } from './item';
export * from './auth'
export * from './item'

export const globalStores = {
    localKeyStore: authStore,
    itemStore
}