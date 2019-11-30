import {observable, action, computed} from 'mobx'
import { LocalKeyData } from '../localData';
import { ZHTDecryptedUserInfo } from 'zht-client-api';
import { zError } from '../actions/utils';

export type LocalKeyStatus = {
    status: 'EMPTY',
    error?: string
} | {
    status: 'DONE',
    localKey: LocalKeyData,
    userInfo: ZHTDecryptedUserInfo
} | {
    status: 'START_AUTH'
} | {
    status: 'UPDATE_USER_INFO'
    userInfo: ZHTDecryptedUserInfo
} | {
    status: 'START_INIT'
}

export class AuthStore {
    @observable status: LocalKeyStatus = {status: 'EMPTY'}
    
    @action empty(){
        this.status = {status: 'EMPTY'}
    }

    @action error(error?: string): never{
        error = error || "Invalid Status"
        this.status = {status: 'EMPTY', error}
        return zError(error)
    }

    @action startAuth(){
        if(this.status.status !== 'EMPTY') return this.error()
        this.status = {
            status: 'START_AUTH'
        }
    }

    @action updateAuthInfo(userInfo: ZHTDecryptedUserInfo){
        if(this.status.status !== 'START_AUTH') return this.error()
        this.status = {
            status: 'UPDATE_USER_INFO',
            userInfo
        }
    }

    @action finishAuth(localKey: LocalKeyData){
        if(this.status.status !== 'UPDATE_USER_INFO') return this.error()
        this.status = {
            status: 'DONE',
            userInfo: this.status.userInfo,
            localKey
        }
    }

    @action startInit(){
        if(this.status.status !== 'EMPTY') return this.error()
        this.status = {
            status: 'START_INIT'
        }
    }

    @action finishInit(localKey: LocalKeyData, userInfo: ZHTDecryptedUserInfo){
        if(this.status.status !== 'START_INIT') return this.error()
        this.status = {
            status: 'DONE',
            localKey,
            userInfo
        }
    }

    @computed get privateKey(): string {
        if(this.status.status !== 'DONE') return this.error()
        return this.status.userInfo.privateKey
    }

    @computed get userInfo(): ZHTDecryptedUserInfo {
        if(this.status.status !== 'DONE') return this.error()
        return this.status.userInfo
    }

    @computed get localKey(): LocalKeyData {
        if(this.status.status !== 'DONE') return this.error()
        return this.status.localKey
    }

}

export const authStore = new AuthStore()