import { ZHTSignalType } from "../localData"
import { zhtSignal } from "./base"


// https://keycode.info/
const keyCodeMap: {[key:number]: ZHTSignalType} = {
    37: 'LEFT', // LEFT
    38: 'UP', // UP
    39: 'RIGHT', // RIGHT
    40: 'DOWN', // DOWN
    65: 'LEFT', //A
    87: 'UP', // W
    68: 'RIGHT', // D
    83: 'DOWN', // S
    81: 'BACK', // Q
}

export function initializeKeyboardSignals(){
    window.addEventListener('keydown', evt => {
        const sig = keyCodeMap[evt.keyCode]
        if(sig){
            evt.preventDefault()
        }
        return !sig
    }, false)
    window.addEventListener('keyup', evt => {
        const sig = keyCodeMap[evt.keyCode]
        if(sig){
            evt.preventDefault()
            zhtSignal.emit(sig)
        }
        return !sig
    }, true)
}