import React, { CSSProperties } from 'react'
import { Route } from 'react-router'
import { TokenPanel } from './TokenPanel';
import { WorkerPanel } from './WorkerPanel';
import { TaskPanel } from './TaskPanel';

const containerStyle: CSSProperties = {
    padding: '3rem'
}

export const DashboardRoute = () => (
    <div style={containerStyle}>
        <Route path="/dashboard">
            <Route path="/dashboard/tokens" component={TokenPanel}/>
            <Route path="/dashboard/workers" component={WorkerPanel}/>
            <Route path="/dashboard/tasks" component={TaskPanel}/>
        </Route>
    </div>
)