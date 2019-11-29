import React from 'react';
import { UIOpenOptions } from '../../../types';
import { authLogout } from '../../../actions';
import { Drawer, List, ListItem, Divider } from '@material-ui/core';
import { zhtHistory } from '../index';

export const HomeMenu = ({open, onClose}: UIOpenOptions) => {
    return <Drawer
        anchor="bottom"
        open={open}
        onClose={onClose}
    >
        <div
            role="presentation"
            onClick={onClose}
            onKeyDown={onClose}
            >
            <List>
                <ListItem button onClick={() => zhtHistory.push("/dashboard/tokens")}>
                    API Tokens
                </ListItem>
                <ListItem button onClick={() => zhtHistory.push("/dashboard/workers")}>
                    Workers
                </ListItem>
                <ListItem button onClick={() => zhtHistory.push("/dashboard/tasks")}>
                    Tasks
                </ListItem>
            </List>
            <Divider/>
            <List>
                <ListItem
                    button 
                    onClick={async () => {
                        await authLogout()
                        onClose()
                    }}
                >Logout</ListItem>
            </List>
        </div>
    </Drawer>
}