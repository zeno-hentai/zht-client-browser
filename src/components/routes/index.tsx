import React from 'react'
import {Route, Router} from 'react-router-dom'
import { Home } from './Home/index';
import { createHashHistory } from 'history';
import { DashboardRoute } from './Dashboard/index';
import { CreateTaskDialog } from '../CreateTaskDialog';
import { ItemViewer } from './ItemViewer';

export const zhtHistory = createHashHistory()

export const ZHTRootRoute = () => (
    <Router history={zhtHistory}>
        <CreateTaskDialog/>
        <Route path="/">
            <Route path="/" exact component={Home} />
            <Route path="/dashboard" component={DashboardRoute} />
            <Route path="/view/:id" component={ItemViewer} />
        </Route>
    </Router>
)