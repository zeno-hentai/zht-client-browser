import { aesDecryptWrappedUrlSafe, aesEncryptWrappedUrlSafe } from "zht-client-api";
import { zhtHistory } from "../components/routes";
import { authStore } from "../store";

export async function parseTags(tagsText: string): Promise<string[]> {
    const text = await aesDecryptWrappedUrlSafe(tagsText, authStore.localKey.localKey)
    return text.split(/\s+/).filter(s => s.length)
}

export async function dumpTags(tags: string[]): Promise<string> {
    const text = tags.join(" ")
    return await aesEncryptWrappedUrlSafe(text, authStore.localKey.localKey)
}

export async function toSearchPage(text: string){
    const tags = text.split(/\s+/).filter(t => t.length)
    if(tags.length > 0){
        const encryptedTags = await dumpTags(tags)
        zhtHistory.push(`/search/${encryptedTags}`)
    }else{
        zhtHistory.push("/")
    }
}