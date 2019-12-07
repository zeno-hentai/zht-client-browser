import React from 'react'
import { observer } from "mobx-react";
import { useState } from "react";
import { Tabs, Tab, TextField, Button, Typography, Stepper, Step, StepLabel } from '@material-ui/core';
import { authStore, LocalKeyStatus } from '../../store/auth';
import { authRegister, authLogin, authFinishAuth } from '../../actions';

interface PanelOptions {
    hidden: boolean
}

const wrapError = (handler: (msg: string) => void) => (err: any) => {
    console.error(err)
    handler(`${err}`)
}

const LoginTab = ({hidden}: PanelOptions) => {
    const [message, setMessage] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    return (
        <div hidden={hidden}>
            <Typography hidden={!message}>{`${message}`}</Typography>
            <TextField required label="Username" fullWidth value={username} onChange={evt => setUsername(evt.target.value)}/>
            <TextField required label="Password" type="password" fullWidth value={password} onChange={evt => setPassword(evt.target.value)}/>
            <Button fullWidth onClick={() => {
                authLogin({
                    username,
                    password
                }).catch(wrapError(setMessage))
            }}>Login</Button>
        </div>
    )
}

const RegisterTab = ({hidden}: PanelOptions) => {
    const [message, setMessage] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirmedPassword, setConfirmedPassword] = useState("")
    const [masterKey, setMasterKey] = useState("")
    return (
        <div hidden={hidden}>
            <Typography hidden={!message}>{message}</Typography>
            <TextField required label="Username" fullWidth value={username} onChange={evt => setUsername(evt.target.value)}/>
            <TextField required label="Password" type="password" fullWidth value={password} onChange={evt => setPassword(evt.target.value)}/>
            <TextField required label="Confirmed Password" type="password" fullWidth value={confirmedPassword} onChange={evt => setConfirmedPassword(evt.target.value)}/>
            <TextField required label="Master Key" fullWidth value={masterKey} onChange={evt => setMasterKey(evt.target.value)}/>
            <Button fullWidth onClick={() => {
                if(password !== confirmedPassword){
                    setMessage("Passwords not match.")
                }else{
                    authRegister({
                        username,
                        password,
                        masterKey
                    }).catch(wrapError(setMessage))
                }
            }}>Register</Button>
        </div>
    )
}

const AuthInfoPanel = () => {
    const [method, setMethod] = useState<'register' | 'login'>('login')
    return (
        <div>
            <Tabs value={method} onChange={(evt, val) => setMethod(val)}>
                <Tab label='Login' value='login'/>
                <Tab label='Register' value='register'/>
            </Tabs>
            <LoginTab hidden={method !== 'login'}/>
            <RegisterTab hidden={method !== 'register'}/>
        </div>
    )
}

const NewPasswordPanel = () => {
    const [message, setMessage] = useState("")
    const [password, setPassword] = useState<string>('')
    const [confirmedPassword, setConfirmedPassword] = useState<string>('')
    return (
        <div>
            <Typography hidden={!message}>{`${message}`}</Typography>
            <TextField required label="New Local Password" type="password" fullWidth value={password} onChange={evt => setPassword(evt.target.value)}/>
            <TextField required label="Confirmed Local Password" type="password" fullWidth value={confirmedPassword} onChange={evt => setConfirmedPassword(evt.target.value)}/>
            <Button fullWidth onClick={() => {
                if(password !== confirmedPassword){
                    setMessage("Passwords not match.")
                }else{
                    authFinishAuth(password).catch(wrapError(setMessage))
                }
            }}>SET PASSWORD</Button>
        </div>
    )
}

function stepNameToIndex(name: LocalKeyStatus['status']): number{
    return name === 'START_AUTH' ? 0 : name === 'UPDATE_USER_INFO' ? 1 : -1
}

export const AuthPanel = observer(() => (
    <div>
        <Stepper activeStep={stepNameToIndex(authStore.status.status)}>
            <Step key="START_AUTH">
                <StepLabel>Create an account or login</StepLabel>
            </Step>
            <Step key="UPDATE_USER_INFO">
                <StepLabel>Create local password</StepLabel>
            </Step>
        </Stepper>
        {
            authStore.status.status === 'START_AUTH' ?
                <AuthInfoPanel/> :
                authStore.status.status === 'UPDATE_USER_INFO' ?
                <NewPasswordPanel/> : null

        }
    </div>
))