import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { lazy, LazyBoundary } from 'react-imported-component';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import { makeStyles, createMuiTheme } from '@material-ui/core/styles';

import { StylesProvider, ThemeProvider } from '@material-ui/styles';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#3701b3',
    },
    secondary: {
      main: '#11cb5f',
    },
    text: {
      primary: '#4A4A4A',
    },
  },
  overrides: {
    //MuiCheckbox: {
    //  colorPrimary: {
    //    padding: '0 8px 0 8px'
    //  }
    //},
    MuiFormControlLabel: {
      root: {
        marginBottom: '16px',
        //alignItems: 'flex-start',
      },
      label: {
        fontSize: '14px',
        lineHeight: '18px',
        color: '#4A4A4A',
      },
    },
  },
});

const useStyles = makeStyles(() => ({
  container: {
    padding: 0,
  },
}));

const Basic = lazy(() => import('./Basic.jsx'));
const Loading = lazy(() => import('./Loading.jsx'));
const Share = lazy(() => import('./Share.jsx'));
const ThankYou = lazy(() => import('./ThankYou.jsx'));

export default function App() {
  const classes = useStyles();
  return (
    <LazyBoundary fallback={Loading}>
      <StylesProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Container className={classes.container} maxWidth="sm">
            <Switch>
              <Route exact path="/">
                <Basic />
              </Route>
              <Route path="/share" render={props => <Share {...props} />} />
              <Route
                path="/thankyou"
                render={props => <ThankYou {...props} />}
              />
              <Redirect to="/" />
            </Switch>
          </Container>
        </ThemeProvider>
      </StylesProvider>
    </LazyBoundary>
  );
}
