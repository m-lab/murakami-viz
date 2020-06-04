// base imports
import React, { Suspense } from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({}));

export default function Locations(props) {
  const classes = useStyles();
  const { user } = props;

  // fetch api data
  const [error, setError] = React.useState(null);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    // fetch(`/api/v1/libraries?of_user=${user.id}`)
    //   .then(res => res.json())
    //   .then(results => {
    //     setRow(results.data[0]);
    //     setIsLoaded(true);
    //     return;
    //   })
    //   .catch(error => {
    //     setIsLoaded(true);
    //     setError(error);
    //   });
    setIsLoaded(true);
  }, []);

  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!isLoaded) {
    return <div>Loading...</div>;
  } else {
    return <Suspense />;
  }
}
