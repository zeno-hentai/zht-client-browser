import React, { useEffect, useState, CSSProperties, useLayoutEffect } from 'react';
import { GalleryMeta, ItemIndexData } from 'zht-client-api';
import { ZHTItemViewerOptions } from '../../../types';
import { Grid, Button, Typography, Chip } from '@material-ui/core';
import { loadCachedFile, cacheAllFiles } from '../../../actions';
import { arrayToDataUrl, getExt } from './utils';
import { RouteComponentProps, Route } from 'react-router';
import { zhtHistory } from '../../routes';
import { zhtSignal } from '../../../actions/base';
import { toSearchPage } from '../../../actions/search';
import {times} from 'lodash'
import { scrollDownward, scrollUpward, backToHome } from '../../../actions/ui';

const imgStyle: CSSProperties = {
    maxWidth: '100%'
}

interface PageBaseProps {
    page: number
    item: ItemIndexData<GalleryMeta>
    fileMap: {[key: string]: string}
}

type CacheAllFilesStatus = {status: 'OnProgress', progress: number} | {status: 'Done'}

const PageBase = ({page, item, fileMap}: PageBaseProps) => {
    const [dataURL, setDataURL] = useState<string | null>(null)
    const hasNextPage = () => page < item.meta.pageNumber - 1
    const hasPreviousPage = () => page > 0
    async function nextPage(){
        if(!hasNextPage()) return;
        zhtHistory.push(`/view/${item.id}/${page+1}`)
    }
    async function previousPage(){
        if(!hasPreviousPage()) return;
        zhtHistory.push(`/view/${item.id}/${page-1}`)
    }

    async function loadPage(){
        const name = item.meta.files[page]
        const data = await loadCachedFile(name, item, fileMap, (p) => console.log(p))
        const dataURL = await arrayToDataUrl(data, getExt(name))
        setDataURL(dataURL)
    }

    useLayoutEffect(() => {
        const h = zhtSignal.register()
        h.on('LEFT', previousPage)
        h.on('RIGHT', nextPage)
        h.on('BACK', backToHome)
        h.on('DOWN', scrollDownward)
        h.on('UP', scrollUpward)
        loadPage()
        return () => h.close()
    }, [])

    return <Grid container>
        <Grid item xs={12}>
            {dataURL ? <img style={imgStyle} src={dataURL}/> : <div>Loading...</div>}
        </Grid>
        <Grid item xs={6}>
            <Button
                fullWidth
                onClick={previousPage}
                disabled={!hasPreviousPage()}
                >Previous Page</Button>
        </Grid>
        <Grid item xs={6}>
            <Button
                fullWidth
                onClick={nextPage}
                disabled={!hasNextPage()}
                >Next Page</Button>
        </Grid>
        <Grid item xs={12}>
            <Typography>{item.meta.title}</Typography>
        </Grid>
        <Grid item xs={12}>
            {item.tags.map(t => <Chip key={t.id} onClick={() => {toSearchPage(t.tag)}} label={t.tag}></Chip>)}
        </Grid>
    </Grid>
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
        />)
    return <div>
        <CacheAllBar {...props}/>
        <Route>
            <Route path="/view/:id" exact component={Page}/>
            <Route path="/view/:id/:page" exact component={Page}/>
        </Route>
    </div>
}