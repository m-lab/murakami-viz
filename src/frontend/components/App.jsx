// base imports
import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route, Redirect, useHistory } from 'react-router-dom';
import { lazy, LazyBoundary } from 'react-imported-component';
import { makeStyles } from '@material-ui/core/styles';
import Cookies from 'js-cookie';

// material ui imports
import Container from '@material-ui/core/Container';

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

function PrivateRoute({ component: Component, authed, user, ...rest }) {
  const history = useHistory();
  const path = {...rest}

  if (user) {
    if (user.role !== "Admin" && path.path === "/admin" ) {
      return (
        <Route
          {...rest}
          render={props =>
            <Dashboard {...props} user={user} />
          }
        />
      )
    } else {
      return (
        <Route
          {...rest}
          render={props =>
            authed === true ? (
              <Component {...props} user={user} />
            ) : (
              history.push('/login')
            )
          }
        />
      );
    }
  } else {
    return (
      <Route
        {...rest}
        render={props =>
          authed === true ? (
            <Component {...props} user={user} />
          ) : (
            history.push('/login')
          )
        }
      />
    );
  }
}

PrivateRoute.propTypes = {
  component: PropTypes.object.isRequired,
  authed: PropTypes.bool,
  user: PropTypes.object,
};

export default function App() {
  const classes = useStyles();
  const [authenticated, setAuthenticated] = React.useState(false);
  const updateAuthed = authState => {
    setAuthenticated(authState);
  };
  const [user, setUser] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [isLoaded, setIsLoaded] = React.useState(false);

  // fetch api data
  React.useEffect(() => {
    const username = Cookies.get('mv_user');
    if (username) {
      // TODO: Add separate case for admin
      fetch(`api/v1/users/${username}`)
        .then(res => res.json())
        .then(results => {
          setUser(results.data);
          setAuthenticated(true);
          setIsLoaded(true);
          return;
        })
        .catch(error => {
          setError(error);
          setAuthenticated(false);
          setIsLoaded(true);
        });
    } else {
      setAuthenticated(false);
      setIsLoaded(true);
    }
  }, []);

  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!isLoaded) {
    return <div>Loading...</div>;
  } else {
    return (
      <Container className={classes.container}>
        <Switch>
          <LazyBoundary fallback={Loading}>
            <Route path="/" exact component={Basic} />
            <Route
              path="/login"
              render={props => <Login {...props} onAuthUpdate={updateAuthed} />}
            />
            <PrivateRoute
              authed={authenticated}
              path="/admin"
              component={Admin}
              user={user}
            />
            <PrivateRoute
              authed={authenticated}
              path="/dashboard"
              component={Dashboard}
              user={user}
            />
          </LazyBoundary>
          <Redirect to="/" />
        </Switch>
      </Container>
    );
  }
}
