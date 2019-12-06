import { toSearchPage } from "./search"
import { itemStore } from "../store"

const SCROLL_STEP = 0.3

export function scrollDownward(){
    const {scrollTop, scrollHeight} = document.body
    document.body.scrollTop = Math.min(scrollHeight, scrollTop+window.innerHeight*SCROLL_STEP)
}

export function scrollUpward(){
    const {scrollTop} = document.body
    document.body.scrollTop = Math.max(0, scrollTop-window.innerHeight*SCROLL_STEP)
}

export function backToHome(){
    toSearchPage(itemStore.status.status === 'LOADED_DATA' ? itemStore.status.tags.join(' ') : '')
}