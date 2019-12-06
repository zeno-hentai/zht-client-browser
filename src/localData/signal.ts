
export type ZHTSignalType = 'LEFT' | 'RIGHT' | 'UP' | 'DOWN' | 'ENTER' | 'EXIT' | 'SWITCH' | 'BACK'

export class ZHTSignalHandler {
    private manager: ZHTSignalManager
    private signalMap: Map<ZHTSignalType, (() => void)[]>
    private closed = false
    constructor(manager: ZHTSignalManager){
        this.manager = manager
        this.signalMap = new Map()
    }
    signals(){
        return this.signalMap.keys()
    }
    _emit(sig: ZHTSignalType){
        let list = this.signalMap.get(sig)
        if(list){
            for(let f of list){
                f()
            }
        }
    }
    on(sig: ZHTSignalType, func: () => void){
        if(this.closed) return;
        let list = this.signalMap.get(sig)
        if(!list){
            list = []
            this.signalMap.set(sig, list)
        }
        list.push(func)
        this.manager._registerHandler(sig, this)
    }
    close(){
        this.manager._removeHandler(this)
        this.closed = true
    }
}

export class ZHTSignalManager {
    private signalMap: Map<ZHTSignalType, Set<ZHTSignalHandler>>
    constructor(){
        this.signalMap = new Map()
    }
    register(): ZHTSignalHandler{
        return new ZHTSignalHandler(this)
    }
    emit(sig: ZHTSignalType){
        const set = this.signalMap.get(sig)
        if(set){
            for(let h of Array.from(set)){
                h._emit(sig)
            }
        }
    }
    _registerHandler(sig: ZHTSignalType, handler: ZHTSignalHandler){
        let set = this.signalMap.get(sig)
        if(!set){
            set = new Set()
            this.signalMap.set(sig, set)
        }
        set.add(handler)
    }
    _removeHandler(handler: ZHTSignalHandler){
        for(let sig of handler.signals()){
            const set = this.signalMap.get(sig)
            if(set){
                set.delete(handler)
            }
        }
    }
}