import {observable, action} from 'mobx'
import { LocalKeyData } from '../localData';
import { ZHTDecryptedUserInfo } from 'zht-client-api';
import { zError } from '../actions/utils';
import { RegisterInputStatus, LoginInputStatus } from '../types';

export type LocalKeyStatus = {
    status: 'NO_KEY',
    error?: string
} | {
    status: 'LOADED_KEY',
    localKey: LocalKeyData,
    userInfo: ZHTDecryptedUserInfo
} | {
    status: 'INPUT_REGISTER_INFO'
    registerInfo: RegisterInputStatus
} | {
    status: 'INPUT_LOGIN_INFO'
    loginInfo: LoginInputStatus
} | {
    status: 'INPUT_NEW_PASSWORD'
    userInfo: ZHTDecryptedUserInfo
    localPassword: string
} | {
    status: 'INPUT_CONFIRM_PASSWORD'
    localPassword: string
}

export class LocalKeyStore {
    @observable status: LocalKeyStatus = {status: 'NO_KEY'}
    
    @action noLocalKey(){
        this.status = {status: 'NO_KEY'}
    }

    @action error(reason: string){
        this.status = {status: 'NO_KEY', error: reason}
    }

    private invalidState(): never{
        const reason = `Invalid status: ${this.status.status}`
        this.error(reason)
        return zError(reason)
    }

    @action initializeLogin(){
        if(this.status.status != 'NO_KEY') return this.invalidState()
        this.status = {
            status: 'INPUT_LOGIN_INFO',
            loginInfo: {
                username: '',
                password: ''
            }
        }
    }

    @action inputLoginInfo(loginInfo: LoginInputStatus){
        if(this.status.status != 'INPUT_LOGIN_INFO') return this.invalidState()
        this.status = {
            loginInfo,
            status: 'INPUT_LOGIN_INFO'
        }
    }

    @action switchToRegister(){
        if(this.status.status != 'INPUT_LOGIN_INFO') return this.invalidState()
        this.status = {
            status: 'INPUT_REGISTER_INFO',
            registerInfo: {
                username: '',
                password: '',
                confirmedPassword: '',
                masterKey: ''
            }
        }
    }

    @action inputRegisterInfo(registerInfo: RegisterInputStatus){
        if(this.status.status != 'INPUT_REGISTER_INFO') return this.invalidState()
        this.status = {
            registerInfo,
            status: 'INPUT_REGISTER_INFO'
        }
    }

    @action switchToLogin(){
        if(this.status.status != 'INPUT_REGISTER_INFO') return this.invalidState()
        this.status = {
            status: 'INPUT_LOGIN_INFO',
            loginInfo: {
                username: '',
                password: ''
            }
        }
    }

    @action setUserInfo(userInfo: ZHTDecryptedUserInfo) {
        if(this.status.status != 'INPUT_LOGIN_INFO' && this.status.status != 'INPUT_REGISTER_INFO') return this.invalidState()
        this.status = {
            userInfo,
            localPassword: '',
            status: 'INPUT_NEW_PASSWORD'
        }
    }

    @action inputNewPassword(password: string){
        if(this.status.status != 'INPUT_NEW_PASSWORD') return this.invalidState()
        this.status = {
            userInfo: this.status.userInfo,
            localPassword: password,
            status: 'INPUT_NEW_PASSWORD'
        }
    }

    @action initializeConfirmPassword(){
        if(this.status.status != 'NO_KEY') return this.invalidState()
        this.status = {
            localPassword: '',
            status: 'INPUT_CONFIRM_PASSWORD'
        }
    }

    @action inputConfirmPassword(password: string){
        if(this.status.status != 'INPUT_CONFIRM_PASSWORD') return this.invalidState()
        this.status = {
            localPassword: password,
            status: 'INPUT_CONFIRM_PASSWORD'
        }
    }

    @action setLocalKeyData(localKey: LocalKeyData, userInfo: ZHTDecryptedUserInfo) {
        if(this.status.status != 'INPUT_CONFIRM_PASSWORD' && this.status.status != 'INPUT_NEW_PASSWORD') return this.invalidState()
        this.status = {
            status: 'LOADED_KEY',
            userInfo,
            localKey
        }
    }

}

export const localKeyStore = new LocalKeyStore()