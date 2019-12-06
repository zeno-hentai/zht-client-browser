const PAGE_SIZE = 50

export function getPageSize(){
    return PAGE_SIZE
}

export function getOffsetLimit(page: number){
    return {offset: PAGE_SIZE * page, limit: PAGE_SIZE * page + PAGE_SIZE}
}