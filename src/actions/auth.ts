import { localKeyStore } from '../store/key';
import { localKeyDataExists, loadLocalKeyData, generateLocalKeyData, clearLocalData } from '../localData/localStorage';
import { zError } from './utils';
import { RegisterInputStatus, LoginInputStatus } from '../types/input';
import { ZHTClientAPI, ZHTDecryptedUserInfo } from 'zht-client-api';

const client = new ZHTClientAPI({
    baseURL: '/'
})

function invalidStatus(reason?: string): never {
    if(!reason){
        reason = "Invalid Status"
    }
    localKeyStore.error(reason)
    return zError(reason)
}

export function initializeLocalKeys(){
    if(localKeyDataExists() && localKeyStore.status.status == 'NO_KEY' && !localKeyStore.status.error){
        localKeyStore.initializeConfirmPassword()
    }else{
        localKeyStore.initializeLogin()
    }
}

export function authDashboardSwapToLogin(){
    localKeyStore.switchToLogin()
}

export function authDashboardSwapToRegister(){
    localKeyStore.switchToRegister()
}

export function inputRegisterInfo(registerInfo: RegisterInputStatus){
    localKeyStore.inputRegisterInfo(registerInfo)
}

export function inputLoginInfo(loginInfo: LoginInputStatus){
    localKeyStore.inputLoginInfo(loginInfo)
}

export async function authLogin(){
    if(localKeyStore.status.status != 'INPUT_LOGIN_INFO') return invalidStatus()
    const {username, password} = localKeyStore.status.loginInfo
    const userInfo = await client.login({username, password})
    localKeyStore.setUserInfo(userInfo)
}

export async function authRegister() {
    if(localKeyStore.status.status != 'INPUT_REGISTER_INFO') return invalidStatus()
    const {username, password, masterKey} = localKeyStore.status.registerInfo
    const userInfo = await client.register({username, password, masterKey})
    localKeyStore.setUserInfo(userInfo)
}

export function inputNewLocalPassword(password: string){
    localKeyStore.inputNewPassword(password)
}

export function inputConfirmPassword(password: string){
    localKeyStore.inputConfirmPassword(password)
}

export async function finishInitialization(){
    if(localKeyStore.status.status != 'INPUT_NEW_PASSWORD') return invalidStatus()
    const {userInfo, localPassword} = localKeyStore.status
    await generateLocalKeyData(localPassword, {
        userPrivateKey: userInfo.privateKey,
        userId: userInfo.id
    })
    localKeyStore.setUserInfo(userInfo)
}

export async function finishConfirmation(){
    if(localKeyStore.status.status != 'INPUT_CONFIRM_PASSWORD') return invalidStatus()
    const localPassword = localKeyStore.status.localPassword
    const onlineInfo = await client.info()
    const localInfo = await loadLocalKeyData(localPassword)
    if(!onlineInfo.authorized){
        return invalidStatus("Session expired")
    }
    if(localInfo.userId != onlineInfo.id){
        return invalidStatus("Invalid user id")
    }
    const userInfo: ZHTDecryptedUserInfo = {
        ...onlineInfo,
        privateKey: localInfo.userPrivateKey
    }
    localKeyStore.setUserInfo(userInfo)
}

export async function authLogout(){
    await client.logout()
    clearLocalData()
}

export async function deleteUser(){
    await client.deleteUser()
    clearLocalData()
}
