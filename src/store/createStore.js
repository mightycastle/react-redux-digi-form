import { applyMiddleware, compose, createStore } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import effects from 'redux-effects';
import fetch, { fetchEncodeJSON } from 'redux-effects-fetch';
import localstorage from 'redux-effects-localstorage';
import thunk from 'redux-thunk';
import multi from 'redux-multi';
import makeRootReducer from '../redux/reducers';

export default (initialState = {}, history) => {
  // ======================================================
  // Middleware Configuration
  // ======================================================
  const middleware = [
    multi,
    effects,
    fetch,
    fetchEncodeJSON,
    localstorage(window.localStorage),
    thunk,
    routerMiddleware(history)
  ];

  // ======================================================
  // Store Enhancers
  // ======================================================
  const enhancers = [];
  if (__DEBUG__) {
    const devToolsExtension = window.devToolsExtension;
    if (typeof devToolsExtension === 'function') {
      enhancers.push(devToolsExtension());
    }
  }

  // ======================================================
  // Store Instantiation and HMR Setup
  // ======================================================
  const store = createStore(
    makeRootReducer(),
    initialState,
    compose(
      applyMiddleware(...middleware),
      ...enhancers
    )
  );
  store.asyncReducers = {};

  if (module.hot) {
    module.hot.accept('../redux/reducers', () => {
      const reducers = require('../redux/reducers').default;
      store.replaceReducer(reducers);
    });
  }

  return store;
};
