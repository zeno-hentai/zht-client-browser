import { ZHTSignalType } from "../localData"
import { zhtSignal } from "./base"
import { useEffect } from "react"


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

type UseSignalProps = Partial<Record<ZHTSignalType, () => void>>

export function useSignal(sig: ZHTSignalType, cb: () => void){
    useEffect(() => {
        const h = zhtSignal.register()
        h.on(sig, cb)
        return () => h.close()
    })
}

export function useSignals(callbacks: UseSignalProps) {
    useEffect(() => {
        const h = zhtSignal.register()
        for(let [sig, cb] of Object.entries(callbacks)){
            if(cb){
                h.on(sig as ZHTSignalType, cb)
            }
        }
        return () => h.close()
    })
}