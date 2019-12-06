import React, { useEffect } from 'react';
import {Provider as MobxProvider, observer} from 'mobx-react'
import './App.css';
import { globalStores } from './store';
import InitPanel from './components/InitPanel';
import { authStore } from './store/auth';
import { ZHTRootRoute } from './components/routes/index';

const AppBody = observer(() => (
  authStore.status.status === 'DONE' ?
    <ZHTRootRoute/> :
    <InitPanel/>
))

const App: React.FC = () => {
  return (
    <div className="App">
      <MobxProvider {...globalStores}>
          <AppBody/>
      </MobxProvider>
    </div>
  );
}

export default App;
