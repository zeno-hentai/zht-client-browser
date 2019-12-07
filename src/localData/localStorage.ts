import { aesGenKey, sha256Hash, aesEncryptWrapped, aesDecryptWrapped } from 'zht-client-api';
import uuid from 'uuid'
import moment, { Moment } from 'moment';

const KEY_SALT_NAME = 'zeno-hentai.key-salt'
const KEY_DATA_NAME = 'zeno-hentai.key-data'
const TS_NAME = 'zeno-hentai.update.timestamp'

export interface LocalKeyData {
    localKey: string
    hashSalt: string
    userId: number
    userPrivateKey: string
}

export function localKeyDataExists(): boolean {
    return !!(localStorage[KEY_SALT_NAME] && localStorage[KEY_DATA_NAME])
}

export async function generateLocalKeyData(localPassword: string, {userPrivateKey, userId}: Pick<LocalKeyData, 'userId' | 'userPrivateKey'>): Promise<LocalKeyData>{
    const keySalt = uuid.v4()
    const hashSalt = uuid.v4()
    const localKey = await aesGenKey()
    const keyData: LocalKeyData = {localKey, hashSalt, userId, userPrivateKey}
    const encryptKey = await sha256Hash(`${localPassword}:${keySalt}`)
    localStorage[KEY_SALT_NAME] = keySalt
    localStorage[KEY_DATA_NAME] = await aesEncryptWrapped(JSON.stringify(keyData), encryptKey)
    localStorage.removeItem(TS_NAME)
    return keyData
}

export async function loadLocalKeyData(localPassword: string): Promise<LocalKeyData>{
    const keySalt = localStorage[KEY_SALT_NAME]
    const keyData = localStorage[KEY_DATA_NAME]
    if((typeof keySalt) != 'string'){
        throw new Error(`Invalid content of: ${KEY_SALT_NAME}`)
    }
    if((typeof keyData) != 'string'){
        throw new Error(`Invalid content of: ${KEY_DATA_NAME}`)
    }
    const encryptKey = await sha256Hash(`${localPassword}:${keySalt}`)
    let decryptedJSON = await aesDecryptWrapped(keyData, encryptKey)
    return JSON.parse(decryptedJSON)
}

export function clearLocalData() {
    localStorage.removeItem(KEY_SALT_NAME)
    localStorage.removeItem(KEY_DATA_NAME)
    localStorage.removeItem(TS_NAME)
}

export function getUpdateTimeStamp(): Moment {
    const tsString: string | null = localStorage[TS_NAME]
    if(tsString){
        return moment(tsString)
    }else{
        return moment(0)
    }
}

export function saveUpdateTimeStamp(time: Moment) {
    localStorage[TS_NAME] = time.format()
}