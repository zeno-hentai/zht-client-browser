import { CSSProperties } from "@material-ui/styles"
import {zipObject, times} from 'lodash'

export type GalleryViewerModeType = 'WIDTH_FULL' | 'WIDTH_80' | 'HEIGHT_FULL' | 'X2'
export interface GalleryViewerMode{
    containerStyle: CSSProperties
    imageStyle: CSSProperties
    type: GalleryViewerModeType
}

const WidthFullMode: GalleryViewerMode = {
    type: 'WIDTH_FULL',
    containerStyle: {overflowY: 'auto'},
    imageStyle: {
        width: '100vw'
    }
}

const Width80Mode: GalleryViewerMode = {
    type: 'WIDTH_80',
    containerStyle: {overflowY: 'auto'},
    imageStyle: {
        width: '80vw'
    }
}

const HeightFullMode: GalleryViewerMode = {
    type: 'HEIGHT_FULL',
    containerStyle: {overflowX: 'auto'},
    imageStyle: {
        height: '100vh'
    }
}

const X2Mode: GalleryViewerMode = {
    type: 'X2',
    containerStyle: {overflow: 'auto'},
    imageStyle: {
        minWidth: '200%',
        minHeight: '200%'
    }
}

export const defaultZoomMode = WidthFullMode

export const zoomModeList = [
    WidthFullMode,
    Width80Mode,
    HeightFullMode,
    X2Mode
]

export const zoomModes =
    zipObject(
        zoomModeList.map(t => t.type), 
        zoomModeList
        )

export const nextZoomMode =
    zipObject(
        zoomModeList.map(t => t.type), 
        times(zoomModeList.length, i => zoomModeList[(i+1)%zoomModeList.length])
        )