import React, { useEffect, useState, CSSProperties } from 'react';
import { GalleryMeta } from 'zht-client-api';
import { ZHTItemViewerOptions } from '../../../types';
import { Grid, Button } from '@material-ui/core';
import { loadCachedFile } from '../../../actions';
import { arrayToDataUrl, getExt } from './utils';

const imgStyle: CSSProperties = {
    maxWidth: '100%'
}

export const GalleryViewer = ({item, fileMap}: ZHTItemViewerOptions<GalleryMeta>) => {
    useEffect(() => {
        loadPage(0)
    }, [])
    const [page, setPage] = useState(0)
    const [dataURL, setDataURL] = useState<string | null>(null)
    const hasNextPage = () => page < item.meta.pageNumber - 1
    const hasPreviousPage = () => page > 0
    async function loadPage(p: number){
        setDataURL(null)
        const name = item.meta.files[page]
        const data = await loadCachedFile(name, item, fileMap)
        setDataURL(await arrayToDataUrl(data, getExt(name)))
        setPage(p)
    }
    async function nextPage(){
        if(!hasNextPage()) return;
        loadPage(page+1)
    }
    async function previousPage(){
        if(!hasPreviousPage()) return;
        loadPage(page-1)
    }

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
    </Grid>
}