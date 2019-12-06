import React, { useEffect, useState } from 'react'
import { Typography, Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Button, Popover, Snackbar } from '@material-ui/core'
import { observer } from 'mobx-react-lite'
import { Provider } from 'mobx-react'
import { observable, action } from 'mobx';
import { ManageList, ManageListItem } from './ManageList';
import { client } from '../../../actions/base';
import {concat} from 'lodash'
import { APITokenData, APITokenCreateResponse, sha256Hash } from 'zht-client-api';
import { authStore } from '../../../store/auth';

type TokenStoreStatus = {createdTokens: APITokenCreateResponse[]} & ({
    status: 'LOADING'
} | {
    status: 'DONE'
    tokens: APITokenData[]
})

class TokenStore {
    @observable status: TokenStoreStatus = {status: 'LOADING', createdTokens: []}
    @observable dialogOpen: boolean = false
    @observable newTokenTitle: string = ""
    @action startLoading(){
        this.status = {
            status: 'LOADING',
            createdTokens: this.status.createdTokens
        }
    }
    @action setTokens(tokens: APITokenData[]){
        this.status = {
            status: 'DONE', tokens,
            createdTokens: this.status.createdTokens
        }
    }
    @action addToken(token: APITokenCreateResponse){
        const createdTokens = concat(this.status.createdTokens, [token])
        this.status = {
            ...this.status,
            createdTokens
        }
    }
    @action deleteToken(id: number){
        this.status = {
            ...this.status,
            createdTokens: this.status.createdTokens.filter(t => t.id !== id)
        }
    }

    @action openDialog(){
        this.dialogOpen = true
    }
    @action setTokenTitle(title: string){
        this.newTokenTitle = title
    }
    @action closeDialog(){
        this.dialogOpen = false
        this.newTokenTitle = ""
    }
}

const store = new TokenStore()

async function createToken(title: string){
    const token = await client.createToken(title)
    const publicKeySig = await sha256Hash(authStore.userInfo.publicKey)
    token.token = `${publicKeySig.slice(0, 15)}:${token.token}`
    store.addToken(token)
    await loadTokens()
}

async function loadTokens(){
    store.startLoading()
    const tokens = await client.queryTokens()
    store.setTokens(tokens)
}

async function deleteToken(tokenId: number){
    await client.deleteToken(tokenId)
    await loadTokens()
    store.deleteToken(tokenId)
}

const CreatedTokenListItem = ({item}: {item: APITokenCreateResponse}) => {
    const [show, setShow] = useState(false)
    return <ManageListItem onDelete={() => deleteToken(item.id)} onEnter={async () => {
        const publicKeySig = await sha256Hash(authStore.userInfo.publicKey)
        await navigator.clipboard.writeText(item.token)
        setShow(true)
    }}>
        <Typography>{item.title}</Typography>
        <Typography>{item.token}</Typography>
        <Snackbar
            open={show} 
            onClose={() => setShow(false)}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
            autoHideDuration={3000}
            message={<Typography>Token copied.</Typography>}
        />
    </ManageListItem>
}

const TokenListItem = ({item}: {item: APITokenData}) => (
    <ManageListItem onDelete={() => deleteToken(item.id)}>
        <Typography>{item.title}</Typography>
    </ManageListItem>
)

const CreateTokenDialog = observer(() => {
    return <Dialog open={store.dialogOpen} onClose={() => store.closeDialog()} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Create API Token</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Token Title"
            type="text"
            fullWidth
            value={store.newTokenTitle}
            onChange={evt => store.setTokenTitle(evt.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => store.closeDialog()} color="default">
            Cancel
          </Button>
          <Button onClick={async () => {
            await createToken(store.newTokenTitle)
            store.closeDialog()
          }} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
})

const TokenPanelBody = observer(() => (
    <ManageList title="API Tokens" onCreate={() => store.openDialog()}>
        {
            store.status.createdTokens.map(tk => (
                <CreatedTokenListItem item={tk} key={tk.id}/>
            ))
        }
        {
            store.status.status === 'LOADING' ?
                <div>Loading...</div> :
                store.status.tokens.map(w => (
                    <TokenListItem item={w} key={w.id}/>
                ))
        }
    </ManageList>
))

export const TokenPanel = () => {
    useEffect(() => {
        loadTokens()
    }, [])
    return (
        <Provider store={store}>
            <CreateTokenDialog/>
            <TokenPanelBody/>
        </Provider>
    )
}