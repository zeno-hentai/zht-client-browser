import React from 'react'
import { ZHTItemViewer, ZHTItemViewerOptions } from '../../../types/viewer';
import { GalleryMeta } from 'zht-client-api';
import schema from './schema.json'

const Viewer = (props: ZHTItemViewerOptions<GalleryMeta>) => {
    return <div/>
}

export const GalleryViewer: ZHTItemViewer<GalleryMeta> = {
    type: "gallery",
    schema: () => schema,
    Viewer
}