import React, { CSSProperties } from 'react';
import { Paper, Button, Typography } from '@material-ui/core';
import { AuthPanel } from './AuthPanel';
import { observer } from 'mobx-react';
import { authStore } from '../../store/auth';
import {useEffect} from 'react';
import { authInit, authLogout } from '../../actions';
import { InitPanel } from './InitPanel';
import { clearLocalData } from '../../localData';
import { zhtDB } from '../../actions/base';

const rootStyle: CSSProperties = {
    width: '80%',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '5rem',
    padding: '3rem'
}

async function initializeLocal(){
    await zhtDB.delete()
    clearLocalData()
    authStore.startAuth()
}

const Panels = observer(() => (
    <div>
        {authStore.status.status === 'UPDATE_USER_INFO' ||  authStore.status.status === 'START_AUTH' ?
            <AuthPanel/> :
            authStore.status.status === 'START_INIT' ?
            <InitPanel/> :
            authStore.status.status === 'EMPTY' &&  authStore.status.error?
            (
                <div>
                    <Typography variant="h3">{authStore.status.error}</Typography>
                    <Button fullWidth onClick={initializeLocal}>Continue</Button>
                </div>
            ) : null
        }
    </div>
))

export default observer(() => {
    useEffect(() => {
        authInit()
    }, [])
    return (
        <div>
            <Paper style={rootStyle}>
                <Panels/>
            </Paper>
            <Button fullWidth onClick={async () => {
                await authLogout()
                authInit()
            }}>DELETE</Button>
        </div>
    )
})