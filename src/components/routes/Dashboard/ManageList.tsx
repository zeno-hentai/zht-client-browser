import React from 'react'
import { ReactNode } from 'react';
import { Card, CardContent, CardActions, Button, Typography, Grid, Fab, CardActionArea } from '@material-ui/core';
import { CSSProperties } from '@material-ui/styles';
import AddIcon from '@material-ui/icons/Add'
import DoneIcon from '@material-ui/icons/Done'
import { zhtHistory } from '../index';

const doneButtonStyle: CSSProperties = {
    position: 'fixed',
    right: '2rem',
    bottom: '3rem'
}

interface ManageListProps {
    title: string
    onCreate?(): void
    children: ReactNode | ReactNode[]
}

const Toolbar = (props: ManageListProps) => (
    <div style={doneButtonStyle}>
        <Grid container spacing={3}>
            {!props.onCreate ? null : (
                <Grid item xs={12}>
                    <Fab
                        size="large"
                        color="primary"
                        onClick={() => props.onCreate && props.onCreate()}
                        >
                            <AddIcon/>
                    </Fab>
                </Grid>
            )}
            <Grid item xs={12}>
                <Fab
                    size="large"
                    color="secondary"
                    onClick={() => zhtHistory.push('/')}
                    >
                        <DoneIcon/>
                </Fab>
            </Grid>
        </Grid>
    </div>
)

export const ManageList = (props: ManageListProps) => (
    <div>
        <Card>
            <CardContent>
                <Typography variant="h2" gutterBottom>{props.title}</Typography>
            </CardContent>
        </Card>
        {props.children}
        <Toolbar {...props}/>
    </div>
)

const manageListItemStyle: CSSProperties = {
    marginTop: '2rem'
}

interface ManageListItemProps {
    deleteText?: string
    onDelete(): void
    onEnter?(): void
    children: ReactNode | ReactNode[]
}

export const ManageListItem = (props: ManageListItemProps) => (
    <Card style={manageListItemStyle}>
        <CardActionArea onClick={() => props.onEnter && props.onEnter()}>
            <CardContent>
                {props.children}
            </CardContent>
        </CardActionArea>
        <CardActions>
            <Button onClick={props.onDelete}>{props.deleteText || "DELETE"}</Button>
        </CardActions>
    </Card>
)