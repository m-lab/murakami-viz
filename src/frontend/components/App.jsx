import React from 'react';
import { Switch, Route, Redirect, useHistory } from 'react-router-dom';
import { lazy, LazyBoundary } from 'react-imported-component';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';
import Cookies from 'js-cookie';

const useStyles = makeStyles(() => ({
  container: {
    padding: 0,
  },
}));

const Basic = lazy(() => import('./Basic.jsx'));
const Dashboard = lazy(() => import('./Dashboard.jsx'));
const Loading = lazy(() => import('./Loading.jsx'));
const Login = lazy(() => import('./Login.jsx'));
const Admin = lazy(() => import('./Admin.jsx'));

function PrivateRoute ({component: Component, authed, ...rest}) {
  const history = useHistory();

  return (
    <Route
      {...rest}
      render={(props) => authed === true
        ? <Component {...props} />
        : history.push('/login') }
    />
  )
}

export default function App() {
  const classes = useStyles();
  const [authenticated, setAuthenticated] = React.useState(false);
  const updateAuthed = (authState) => {
    setAuthenticated(authState);
  }

  React.useEffect(() => {
    if (Cookies.get('mv_user')) {
      // TODO: Add separate case for admin
      setAuthenticated(true);
    } else {
      setAuthenticated(false);
    }
  }, [])

  return (
    <Container className={classes.container}>
      <Switch>
        <LazyBoundary fallback={Loading}>
          <Route path='/' exact component={Basic} />
          <Route path='/login' render={(props) => <Login {...props} onAuthUpdate={updateAuthed} /> } />
          <PrivateRoute authed={authenticated} path='/admin' component={Admin} />
          <PrivateRoute authed={authenticated} path='/dashboard' component={Dashboard} />
        </LazyBoundary>
        <Redirect to="/" />
      </Switch>
    </Container>
  );
}
