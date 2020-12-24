import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { createStore, applyMiddleware, compose } from 'redux'
import rapportPatient from './reducers'
import { Provider } from 'react-redux'

function logger({ getState }) {
  return next => action => {
    //console.log('will dispatch', action)

    // Call the next dispatch method in the middleware chain.
    const returnValue = next(action)


    //console.log('state after dispatch', getState())

    // This will likely be the action itself, unless
    // a middleware further in chain changed it.
    return returnValue
  }
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(rapportPatient, /* preloadedState, */
    composeEnhancers(applyMiddleware(logger))
);

library.add(fas)

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);



// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();

export default store
