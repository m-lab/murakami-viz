// base imports
import React, { Suspense, useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

// material ui imports
import Autocomplete from '@material-ui/lab/Autocomplete';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';

// icons imports
import ClearIcon from '@material-ui/icons/Clear';

// module imports
import Loading from '../Loading.jsx';

const useStyles = makeStyles(() => ({
  cancelButton: {},
  closeButton: {
    marginTop: '15px',
    position: 'absolute',
    right: '0',
    top: '0',
  },
  dialog: {
    position: 'relative',
  },
  dialogTitleRoot: {
    marginTop: '30px',
  },
  dialogTitleText: {
    fontSize: '2.25rem',
    textAlign: 'center',
  },
  form: {
    padding: '50px',
  },
  formControl: {
    marginBottom: '30px',
    width: '100%',
  },
  formField: {
    marginBottom: '30px',
    width: '100%',
  },
  saveButton: {
    marginBottom: '0',
  },
}));

const useForm = callback => {
  const [inputs, setInputs] = useState({});
  const handleSubmit = event => {
    if (event) {
      event.preventDefault();
    }
    callback();
  };
  const handleInputChange = event => {
    event.persist();
    setInputs(inputs => ({
      ...inputs,
      [event.target.name]: event.target.value,
    }));
  };
  return {
    handleSubmit,
    handleInputChange,
    inputs,
  };
};

export default function AddUser(props) {
  const classes = useStyles();
  const { onClose, open } = props;

  const handleClose = () => {
    onClose();
  };

  // handle role select
  const [role, setRole] = React.useState('');

  const handleRoleChange = event => {
    setRole(event.target.value);
  };

  // submit new user to api
  const submitData = () => {
    fetch('api/v1/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inputs),
    })
      .then(response => response.json())
      .then(results => {
        alert('User submitted successfully.');
        onClose(inputs);
      })
      .catch(error => {
        console.log(error);
        alert(
          'An error occurred. Please try again or contact an administrator.',
        );
        onClose();
      });
  };

  const { inputs, handleInputChange, handleSubmit } = useForm(submitData);

  // fetch library api data
  const [error, setError] = React.useState(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [libraries, setLibraries] = React.useState([]);

  React.useEffect(() => {
    fetch('/api/v1/libraries')
      .then(res => res.json())
      .then(
        results => {
          setLibraries(results.data);
          setIsLoaded(true);
        },
        error => {
          setError(error);
          setIsLoaded(true);
        },
      );
  }, []);

  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!isLoaded) {
    return <Loading />;
  } else {
    return (
      <Suspense>
        <Dialog
          onClose={handleClose}
          modal={true}
          open={open}
          aria-labelledby="add-user-title"
          fullWidth={true}
          maxWidth={'lg'}
          className={classes.dialog}
        >
          <Button
            label="Close"
            primary={true}
            onClick={handleClose}
            className={classes.closeButton}
          >
            <ClearIcon />
          </Button>
          <DialogTitle id="add-user-title" className={classes.dialogTitleRoot}>
            <div className={classes.dialogTitleText}>Add a new user</div>
          </DialogTitle>
          <Box className={classes.form}>
            <TextField
              className={classes.formField}
              id="user-username"
              label="Username"
              name="username"
              fullWidth
              variant="outlined"
              onChange={handleInputChange}
            />
            <TextField
              className={classes.formField}
              id="user-password"
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              fullWidth
              variant="outlined"
              onChange={handleInputChange}
            />
            <TextField
              className={classes.formField}
              id="user-first-name"
              label="First Name"
              name="firstName"
              fullWidth
              variant="outlined"
              onChange={handleInputChange}
            />
            <TextField
              className={classes.formField}
              id="user-last-name"
              label="Last Name"
              name="lastName"
              fullWidth
              variant="outlined"
              onChange={handleInputChange}
            />
            <TextField
              className={classes.formField}
              id="user-email"
              label="Email"
              name="email"
              fullWidth
              variant="outlined"
              onChange={handleInputChange}
            />
            <FormControl variant="outlined" className={classes.formControl}>
              <Autocomplete
                id="library-select"
                options={libraries}
                getOptionLabel={option => option.name}
                renderInput={params => (
                  <TextField {...params} label="Location" variant="outlined" />
                )}
              />
            </FormControl>
            <FormControl variant="outlined" className={classes.formControl}>
              <InputLabel id="user-role">Role</InputLabel>
              <Select
                labelId="user-role"
                className={classes.formField}
                id="user-role"
                label="Role"
                name="role"
                onChange={handleInputChange}
              >
                <MenuItem value="editor">Editor</MenuItem>
                <MenuItem value="viewer">Viewer</MenuItem>
              </Select>
            </FormControl>
            <Grid container alignItems="center" justify="space-between">
              <Grid item>
                <Button
                  size="small"
                  label="Cancel"
                  primary={true}
                  onClick={handleClose}
                  className={classes.cancelButton}
                >
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button
                  type="submit"
                  label="Save"
                  className={classes.cancelButton}
                  variant="contained"
                  disableElevation
                  color="primary"
                  primary={true}
                  onClick={submitData}
                >
                  Save
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Dialog>
      </Suspense>
    );
  }
}

AddUser.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};
