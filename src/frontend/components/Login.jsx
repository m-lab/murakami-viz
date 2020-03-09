import React, { useEffect, useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  input: {
    display: 'none',
  },
  h1: {
    marginTop: theme.spacing(1),
    fontFamily: 'Poppins',
    fontSize: '26px',
    lineHeight: '32px',
    fontWeight: '700',
  },
  h6: {
    fontFamily: 'Poppins',
    fontSize: '16px',
    lineHeight: '20px',
    fontWeight: '700',
    color: '#4A4A4A',
  },
  sub1: {
    marginTop: theme.spacing(1),
    fontSize: '12px',
    lineHeight: '16px',
    color: '#4A4A4A',
  },
  sub1a: {
    marginTop: theme.spacing(1),
    fontSize: '14px',
    lineHeight: '16px',
    color: '#4A4A4A',
  },
  paper: {
    padding: theme.spacing(4),
    [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(6),
      padding: theme.spacing(3),
    },
  },
  centerText: {
    textAlign: 'center',
  },
}));

export default function Login() {
  const classes = useStyles();
  const history = useHistory();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [helperText, setHelperText] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (username.trim() && password.trim()) {
      setIsButtonDisabled(false);
    } else {
      setIsButtonDisabled(true);
    }
  }, [username, password]);

  const handleKeyPress = e => {
    if (e.keyCode === 13 || e.which === 13) {
      isButtonDisabled || handleLogin();
    }
  };

  const handleLogin = async () => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    try {
      const response = await fetch('/api/v1/login', {
        method: 'POST',
        body: formData,
      });
      if (response.status === 200 || response.status === 201) {
        setError(false);
        setHelperText('Login successful.');
        history.push('/admin');
      } else {
        setError(true);
        setHelperText('Incorrect username or password.');
      }
    } catch (err) {
      setError(true);
      setHelperText('Could not connect to authentication server.');
      console.error('error: ', err);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <div>
        <Typography
          className={classes.h1}
          color="primary"
          variant="h4"
          component="h1"
        >
          Murakami Visualizations
        </Typography>
        <Avatar>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <form noValidate>
          <TextField
            error={error}
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="username"
            value={username}
            label="Username"
            autoComplete="username"
            onChange={e => setUsername(e.target.value)}
            onKeyPress={e => handleKeyPress(e)}
            autoFocus
          />
          <TextField
            error={error}
            helperText={helperText}
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            id="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyPress={e => handleKeyPress(e)}
            autoComplete="current-password"
          />
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          />
          <Button
            onClick={() => handleLogin()}
            disabled={isButtonDisabled}
            fullWidth
            variant="contained"
            color="primary"
          >
            Sign In
          </Button>
          <Box mt={2} mb={2}></Box>
          {
          <Grid container>
            <Grid item xs>
              <Link href="#" variant="body2" to="#">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link href="#" variant="body2" to="#">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
          }
        </form>
      </div>
    </Container>
  );
}
