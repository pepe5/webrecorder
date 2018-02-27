import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { Provider } from 'react-redux';

import createStore from './store/create';
import ApiClient from './helpers/ApiClient';
import baseRoute from './baseRoute';
import Root from './root';

import './base.scss';


const client = new ApiClient();

const dest = document.getElementById('app');
window.wrAppContainer = dest;

// eslint-disable-next-line no-underscore-dangle
const store = createStore(client, window.__data);


const renderApp = (renderProps) => {
  ReactDOM.hydrate(
    <AppContainer warnings={false}>
      <Provider store={store} key="provider">
        <Root {...{ store, ...renderProps }} />
      </Provider>
    </AppContainer>,
    dest
  );
};

// render app
renderApp({ routes: baseRoute, client });

if (module.hot) {
  module.hot.accept('./baseRoute', () => {
    const nextRoutes = require('./baseRoute');

    renderApp({ routes: nextRoutes, client });
  });
}
