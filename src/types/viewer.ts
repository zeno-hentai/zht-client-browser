import { ZHTBaseMeta, ItemIndexData } from 'zht-client-api';
import { ReactElement, ReactNode } from 'react';

export interface ZHTItemViewerOptions<Meta>{
    item: ItemIndexData<Meta>
    fileMap: {[key: string]: string}
    downloadFile(name: string): Promise<ArrayBuffer>
}

export type ZHTItemViewer<Meta> = Meta extends ZHTBaseMeta<infer Type> ? {
    type: Type
    schema(): any
    Viewer: (props: ZHTItemViewerOptions<Meta>) => ReactNode
} : never
