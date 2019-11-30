import { ZHTBaseMeta, ItemIndexData } from 'zht-client-api';
import { ReactNode, ReactElement, FunctionComponent } from 'react';

export interface ZHTItemViewerOptions<Meta>{
    item: ItemIndexData<Meta>
    fileMap: {[key: string]: string}
    downloadFile(name: string, onProgress?: (p: any) => void): Promise<ArrayBuffer>
}

export type ZHTItemViewer<Meta> = Meta extends ZHTBaseMeta<infer Type> ? {
    type: Type
    schema(): any
    Thumbnail: FunctionComponent<ZHTItemViewerOptions<Meta>>
    Viewer: FunctionComponent<ZHTItemViewerOptions<Meta>>
} : never
