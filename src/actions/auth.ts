import { authStore } from '../store/auth';
import { localKeyDataExists, loadLocalKeyData, generateLocalKeyData, clearLocalData } from '../localData/localStorage';
import { zError } from './utils';
import { RegisterInputStatus, LoginInputStatus } from '../types/input';
import { ZHTDecryptedUserInfo } from 'zht-client-api';
import { client, zhtDB } from './base';

function invalidStatus(reason?: string): never {
    if(!reason){
        reason = "Invalid Status"
    }
    authStore.error(reason)
    return zError(reason)
}

export async function authInit(){
    if(localKeyDataExists()){
        authStore.startInit()
    }else{
        authStore.startAuth()
    }
}

export async function authFinishInit(localPassword: string){
    const encInfo = await client.info()
    const localKeyData = await loadLocalKeyData(localPassword)
    if(!encInfo.authorized || encInfo.id !== localKeyData.userId){
        return invalidStatus("Invalid Session")
    }
    const info: ZHTDecryptedUserInfo = {
        ...encInfo,
        privateKey: localKeyData.userPrivateKey
    }
    authStore.finishInit(localKeyData, info)
}

export async function authLogin(loginInfo: LoginInputStatus) {
    const info = await client.login(loginInfo)
    authStore.updateAuthInfo(info)
}

export async function authRegister(registerInfo: RegisterInputStatus) {
    const info = await client.register(registerInfo)
    authStore.updateAuthInfo(info)
}

export async function authFinishAuth(localPassword: string){
    if(authStore.status.status !== 'UPDATE_USER_INFO') return invalidStatus()
    const localKey = await generateLocalKeyData(localPassword, {
        userPrivateKey: authStore.status.userInfo.privateKey,
        userId: authStore.status.userInfo.id
    })
    authStore.finishAuth(localKey)
}

export async function authLogout(){
    await client.logout()
    await zhtDB.delete()
    clearLocalData()
    authStore.empty()
}

export async function deleteUser(){
    await client.deleteUser()
    await zhtDB.delete()
    clearLocalData()
    authStore.empty()
}
