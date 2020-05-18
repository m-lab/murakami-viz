import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { rehydrateMarks, whenComponentsReady } from 'react-imported-component';
import { StylesProvider, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from './theme.js';
import App from './components/App.jsx';

export const hydrate = (app, element) => () => {
  ReactDOM.hydrate(app, element);
};

export const start = ({ isProduction, document, module, hydrate }) => {
  const element = document.getElementById('app');
  const serverSideStyles = document.getElementById('server-side-styles');
  // Remove server-side CSS if present, since we're going to re-render it
  if (serverSideStyles) {
    serverSideStyles.parentElement.removeChild(serverSideStyles);
  }

  const app = (
    <HelmetProvider>
      <CssBaseline />
      <StylesProvider injectFirst>
        <ThemeProvider theme={theme}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ThemeProvider>
      </StylesProvider>
    </HelmetProvider>
  );

  // In production, we want to hydrate instead of render
  // because of the server-rendering
  if (isProduction) {
    // rehydrate the bundle marks from imported-components,
    // then rehydrate the react app
    whenComponentsReady()
      .then(rehydrateMarks)
      .then(hydrate(app, element))
      .catch(err => {
        console.error(`Failed to rehydrate bundle marks: ${err}`);
      });
  } else {
    ReactDOM.render(app, element);
  }

  // Enable Hot Module Reloading
  if (module.hot) {
    module.hot.accept();
  }
};

const options = {
  isProduction: process.env.NODE_ENV === 'production',
  document: document,
  module: module, // eslint-disable-line no-undef
  hydrate,
};

start(options);
