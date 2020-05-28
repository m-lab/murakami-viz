// base imports
import React, { Suspense } from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';

// material ui imports
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

// modules imports
import EditAbout from './utils/EditAbout.jsx';

const useStyles = makeStyles(theme => ({
}));

export default function About(props) {
  const classes = useStyles();
  const { user } = props;

  // handle about edit
  const [openAbout, setOpenAbout] = React.useState(false);
  const [selectedAboutValue, setSelectedAboutValue] = React.useState();

  const handleAboutClickOpen = () => {
    setOpenAbout(true);
  };

  const handleAboutClose = value => {
    setOpenAbout(false);
    setSelectedAboutValue(value);
  };

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
    return (
      <Suspense>
        <Box mb={9} >
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Typography component="h3" variant="h3">
                About MLBN
              </Typography>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                disableElevation
                color="primary"
                onClick={handleAboutClickOpen}
              >
                Edit
              </Button>
              <EditAbout open={open} onClose={handleAboutClose} />
            </Grid>
          </Grid>
          <div>
            <Typography component="p" variant="body1">
              Unam incolunt Belgae, aliam Aquitani, tertiam. Me non paenitet nullum festiviorem excogitasse ad hoc. Gallia est omnis divisa in partes tres, quarum. Donec sed odio operae, eu vulputate felis rhoncus. Excepteur sint obcaecat cupiditat non proident culpa.

              Magna pars studiorum, prodita quaerimus. Hi omnes lingua, institutis, legibus inter se differunt. Nihil hic munitissimus habendi senatus locus, nihil horum? Ab illo tempore, ab est sed immemorabili.
            </Typography>
          </div>
        </Box>
      </Suspense>
    )
  }
}
