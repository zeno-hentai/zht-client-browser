import { ItemIndexData, ZHTBaseMeta } from 'zht-client-api';
export type ListedItemIndex<Type extends string> = {id: number} & (
    {
        status: 'OK',
        type: Type
        item: ItemIndexData<ZHTBaseMeta<Type>>
    } | {
        status: 'UNKNOWN_TYPE'
    } | {
        status: 'INVALID_META'
    }
)