import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));

export default function About() {
  const classes = useStyles();

  return (
    <Container className={classes.root}>
      <Typography component="h1" variant="srOnly">
        About
      </Typography>
      <Grid container justify="center" spacing={2}>
        <Grid item>
          <Button variant="contained">FAQ</Button>
        </Grid>
        <Grid item>
          <Button variant="contained">Glossary</Button>
        </Grid>
        <Grid item>
          <Button variant="contained">Forum</Button>
        </Grid>
      </Grid>
      <Box>
        <Typography component="h2" variant="h4">
          Contact
        </Typography>
        <Typography>
          Name
          <br />
          Email
          <br />
          Contact
        </Typography>
      </Box>
      <Box>
        <Typography component="h2" variant="h4">
          About
        </Typography>
        <Typography paragraph="true" variant="body1">
          Praeterea iter est quasdam res quas ex communi. Quisque ut dolor
          gravida, placerat libero vel, euismod. Contra legem facit qui id facit
          quod lex prohibet. Curabitur est gravida et libero vitae dictum. Plura
          mihi bona sunt, inclinet, amari petere vellent.
        </Typography>
      </Box>
    </Container>
  );
}
