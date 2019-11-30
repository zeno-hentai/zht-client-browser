import { ZHTItemViewer } from '../../../types/viewer';
import { GalleryMeta } from 'zht-client-api';
import {GalleryThumbnail as Thumbnail} from './GalleryThumbnail'
import {GalleryViewer as Viewer} from './GalleryViewer'
import schema from './schema.json'

export const GalleryViewer: ZHTItemViewer<GalleryMeta> = {
    type: "gallery",
    schema: () => schema,
    Thumbnail,
    Viewer
}