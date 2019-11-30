import React, { useEffect, useState, CSSProperties } from 'react';
import { GalleryMeta } from 'zht-client-api';
import { ZHTItemViewerOptions } from '../../../types';
import { Grid, Button } from '@material-ui/core';
import { loadCachedFile } from '../../../actions';
import { arrayToDataUrl, getExt } from './utils';
import { RouteComponentProps, Route } from 'react-router';
import { zhtHistory } from '../../routes';

const imgStyle: CSSProperties = {
    maxWidth: '100%'
}

export const GalleryViewer = ({item, fileMap}: ZHTItemViewerOptions<GalleryMeta>) => {
    const Page = (props: RouteComponentProps<{page?: string}>) => {
        const page = props.match.params.page ? parseInt(props.match.params.page) : 0
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
            const data = await loadCachedFile(name, item, fileMap)
            const dataURL = await arrayToDataUrl(data, getExt(name))
            setDataURL(dataURL)
        }

        useEffect(() => {
            loadPage()
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
        </Grid>
    }

    return <Route>
        <Route path="/view/:id" exact component={Page}/>
        <Route path="/view/:id/:page" exact component={Page}/>
    </Route>
}