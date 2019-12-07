import React, { useEffect, useState } from 'react';
import { GalleryMeta, ItemIndexData } from 'zht-client-api';
import { ZHTItemViewerOptions } from '../../../types';
import { Grid, Typography, Chip, Fab } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ZoomInIcon from '@material-ui/icons/ZoomIn';
import { loadCachedFile, cacheAllFiles, useSignal } from '../../../actions';
import { arrayToDataUrl, getExt } from './utils';
import { RouteComponentProps, Route } from 'react-router';
import { zhtHistory } from '../../routes';
import { toSearchPage } from '../../../actions/search';
import {times} from 'lodash'
import { scrollDownward, scrollUpward, backToHome } from '../../../actions/ui';
import { GalleryViewerMode, zoomModes, defaultZoomMode, nextZoomMode } from './zoomMode';

interface PageBaseProps {
    page: number
    item: ItemIndexData<GalleryMeta>
    fileMap: {[key: string]: string}
    viewerMode: GalleryViewerMode
}

type CacheAllFilesStatus = {status: 'OnProgress', progress: number} | {status: 'Done'}

const PageBase = ({page, item, fileMap, viewerMode}: PageBaseProps) => {
    const [dataURL, setDataURL] = useState<string | null>(null)
    const hasNextPage = () => page < item.meta.pageNumber - 1
    const hasPreviousPage = () => page > 0
    async function nextPage(){
        if(!hasNextPage()) return;
        zhtHistory.push(`/view/${item.id}/${page+1}?zoom=${viewerMode.type}`)
    }
    async function previousPage(){
        if(!hasPreviousPage()) return;
        zhtHistory.push(`/view/${item.id}/${page-1}?zoom=${viewerMode.type}`)
    }
    function toNextZoom(){
        zhtHistory.push(`/view/${item.id}/${page}?zoom=${nextZoomMode[viewerMode.type].type}`)
    }

    async function loadPage(){
        const name = item.meta.files[page]
        const data = await loadCachedFile(name, item, fileMap, (p) => console.log(p))
        const dataURL = await arrayToDataUrl(data, getExt(name))
        setDataURL(dataURL)
    }

    function onClick(evt: React.MouseEvent<HTMLImageElement>){
        const x = evt.pageX
        if(x > window.innerWidth / 2){
            nextPage()
        }else{
            previousPage()
        }
    }

    useSignal('LEFT', previousPage)
    useSignal('RIGHT', nextPage)
    useSignal('BACK', backToHome)
    useSignal('DOWN', scrollDownward)
    useSignal('UP', scrollUpward)
    useSignal('SWITCH', toNextZoom)

    useEffect(() => {
        loadPage()
    }, [])


    return <div>
        <Fab
            size="large"
            color="default"
            onClick={previousPage}
            style={{position: 'fixed', opacity: 0.75, top: '40%', left: '1rem'}}
            disabled={!hasPreviousPage()}
            >
                <ArrowLeftIcon/>
            </Fab>
        <Fab
            size="large"
            color="default"
            onClick={nextPage}
            style={{position: 'fixed', opacity: 0.75, top: '40%', right: '1rem'}}
            disabled={!hasNextPage()}
            >
                <ArrowRightIcon/>
        </Fab>
        <Fab onClick={toNextZoom} style={{position: 'fixed', right: '1rem', top: '1rem', opacity: 0.75}} size="large" color="default">
            <ZoomInIcon/>
        </Fab>
        <Grid container>
            <Grid item xs={12} style={viewerMode.containerStyle}>
                {dataURL ? <img onClick={onClick} style={viewerMode.imageStyle} src={dataURL}/> : <div>Loading...</div>}
            </Grid>
            <Grid item xs={12}>
                <Typography>{item.meta.title}</Typography>
            </Grid>
            <Grid item xs={12}>
                {item.tags.map(t => <Chip key={t.id} onClick={() => {toSearchPage(t.tag)}} label={t.tag}></Chip>)}
            </Grid>
        </Grid>
    </div>
}

const CacheAllBar = ({item, fileMap}: ZHTItemViewerOptions<GalleryMeta>) => {
    const [cacheAllStatus, setCacheAllStatus] = useState<CacheAllFilesStatus>({status: 'OnProgress', progress: 0})
    async function cacheAll(){
        const fileList = times(item.meta.pageNumber).map(i => fileMap[item.meta.files[i]])
        await cacheAllFiles(item, fileList, progress => setCacheAllStatus({status: 'OnProgress', progress}))
        setCacheAllStatus({status: 'Done'})
    }
    useEffect(() => {
        cacheAll()
    }, [item.id])
    if(cacheAllStatus.status === 'OnProgress'){
        return <div>Caching... {(cacheAllStatus.progress * 100).toFixed(2)} %</div>
    }else{
        return <div/>
    }
}

export const GalleryViewer = (props: ZHTItemViewerOptions<GalleryMeta>) => {
    const {item, fileMap} = props
    const Page = (props: RouteComponentProps<{page?: string}>) => (
        <PageBase 
            item={item}
            fileMap={fileMap}
            page={props.match.params.page ? parseInt(props.match.params.page): 0}
            viewerMode={zoomModes[new URLSearchParams(props.location.search).get("zoom") || ''] || defaultZoomMode}
        />)
    return <div>
        <CacheAllBar {...props}/>
        <Route>
            <Route path="/view/:id" exact component={Page}/>
            <Route path="/view/:id/:page" exact component={Page}/>
        </Route>
        <Fab onClick={backToHome} style={{position: 'fixed', left: '1rem', top: '1rem', opacity: 0.75}} size="large" color="default">
            <ArrowBackIcon/>
        </Fab>
    </div>
}