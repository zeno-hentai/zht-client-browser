import React, { useState } from 'react'
import { Typography, TextField, Button } from '@material-ui/core'
import { authFinishInit } from '../../actions'
import { observer } from 'mobx-react'
import { authStore } from '../../store/auth';

const wrapError = (handler: (msg: string) => void) => (err: any) => {
    console.error(err)
    handler(`${err}`)
}

const ConfirmPasswordPanel = () => {
    const [message, setMessage] = useState("")
    const [password, setPassword] = useState("")
    return (
        <div>
            <Typography hidden={!message}>{`${message}`}</Typography>
            <TextField required label="Local Password" type="password" fullWidth value={password} onChange={evt => setPassword(evt.target.value)}/>
            <Button fullWidth onClick={() => {
                authFinishInit(password).catch(wrapError(setMessage))
            }}>Decrypt</Button>
        </div>
    )
}

export const InitPanel = observer(() => (
    <div>
        {authStore.status.status === 'START_INIT' ? <ConfirmPasswordPanel/> : null}
    </div>
))