import React, { useEffect } from 'react'
import {Route, Router} from 'react-router-dom'
import { Home } from './Home/index';
import { createHashHistory } from 'history';
import { DashboardRoute } from './Dashboard/index';
import { CreateTaskDialog } from '../CreateTaskDialog';
import { ItemViewer } from './ItemViewer';
import { initializeKeyboardSignals } from '../../actions/signal';

export const zhtHistory = createHashHistory()

export const ZHTRootRoute = () => {
  useEffect(() => {
    initializeKeyboardSignals()
  }, [])
    return <Router history={zhtHistory}>
        <CreateTaskDialog/>
        <Route path="/">
            <Route path="/" exact component={Home} />
            <Route path="/search/:encryptedTags" exact component={Home} />
            <Route path="/dashboard" component={DashboardRoute} />
            <Route path="/view/:id" component={ItemViewer}/>
        </Route>
    </Router>
}