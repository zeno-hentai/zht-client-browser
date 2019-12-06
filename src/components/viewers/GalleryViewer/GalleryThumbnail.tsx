import React, { useState, useEffect } from 'react';
import { CardContent, Box, CardMedia, Typography } from '@material-ui/core';
import { ZHTItemThumbnailOptions } from '../../../types';
import { GalleryMeta } from 'zht-client-api';
import { arrayToDataUrl, getExt } from './utils';

type ImageUrlStatus = {
    status: "LOADING"
} | {
    status: "ERROR"
    error: any
} | {
    status: "DONE"
    url: string
}


export const GalleryThumbnail = (props: ZHTItemThumbnailOptions<GalleryMeta>) => {
    const [imageUrl, setImageUrl] = useState<ImageUrlStatus>({status: 'LOADING'})
    async function loadImage(){
        const nm = props.item.meta.preview
        let data : ArrayBuffer | null = null
        try {
            data = await props.downloadFile(nm)
        }catch(error){
            setImageUrl({
                status: 'ERROR',
                error
            })
        }
        if(data){
            const url = await arrayToDataUrl(data, getExt(nm))
            setImageUrl({status: 'DONE', url})
        }
    }
    useEffect(() => {
        loadImage()
    }, [])
    return <Box>
        {
            imageUrl.status === 'DONE' ?
                <CardMedia
                    component="img"
                    height="200"
                    image={imageUrl.url}
                    title="Contemplative Reptile"
                /> :
                imageUrl.status === 'ERROR' ?
                <CardContent>
                    <Typography>Error: {`${imageUrl.error}`}</Typography>
                </CardContent> :
                <CardContent>
                    <Typography>Loading...</Typography>
                </CardContent>
        }
    </Box>
}