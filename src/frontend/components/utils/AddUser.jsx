// base imports
import React, { Suspense, useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import _ from 'lodash/core';

// material ui imports
import Autocomplete from '@material-ui/lab/Autocomplete';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
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

const useForm = (callback, validated) => {
  const [inputs, setInputs] = useState({});
  const handleSubmit = event => {
    if (event) {
      event.preventDefault();
    }
    if (validated(inputs)) {
      callback();
      setInputs({});
    }
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
  const [errors, setErrors] = React.useState({});
  const [helperText, setHelperText] = React.useState({
    username: '',
  });

  // handle form validation
  const validateInputs = inputs => {
    setErrors({});
    setHelperText({});
    if (_.isEmpty(inputs)) {
      setErrors(errors => ({
        ...errors,
        username: true,
      }));
      setHelperText(helperText => ({
        ...helperText,
        username: 'This field is required.',
      }));
      return false;
    } else {
      if (!inputs.username || !inputs.password || !inputs.email) {
        if (!inputs.username) {
          setErrors(errors => ({
            ...errors,
            username: true,
          }));
          setHelperText(helperText => ({
            ...helperText,
            username: 'Required',
          }));
        }
        if (!inputs.password) {
          setErrors(errors => ({
            ...errors,
            password: true,
          }));
          setHelperText(helperText => ({
            ...helperText,
            password: 'Required',
          }));
        }
        if (!validateEmail(inputs.email)) {
          setErrors(errors => ({
            ...errors,
            email: true,
          }));
          setHelperText(helperText => ({
            ...helperText,
            email: 'Please enter a valid email address.',
          }));
        }
        return false;
      } else {
        return true;
      }
    }
  };

  const validateEmail = email => {
    const re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return re.test(String(email).toLowerCase());
  };

  const handleClose = () => {
    onClose();
  };

  // handles value changes for Autocomplete Mui components
  const [role, setRole] = React.useState(null);
  const [location, setLocation] = React.useState(null);

  const handleRoleChange = (event, values) => {
    setRole(values);
  };

  const handleLocationChange = (event, values) => {
    setLocation(values)
  }

  // submit new user to api
  const submitData = () => {
    let status;

    // combining inputs with the location and role values from the autocomplete component
    const toSubmit = {
        ...inputs,
        location: location.id,
        role: role.id
    }

    fetch(`api/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({data: toSubmit}),
    })
      .then(response => {
        status = response.status;
        return response.json();
      })
      .then(result => {
        if (status === 201) {
          alert('User submitted successfully.');
          onClose({...toSubmit, location: location.name, role: role.name}, result.data[0].id);
          return;
        } else {
          const error = processError(result);
          throw new Error(`Error in response from server: ${error}`);
        }
      })
      .catch(error => {
        setError(error);
        console.error(error.name + ': ' + error.message);
        alert(
          'An error occurred. Please try again or contact an administrator.',
        );
        onClose();
      });
  };

  const { inputs, handleInputChange, handleSubmit } = useForm(
    submitData,
    validateInputs,
  );

  // fetch library api data
  const [error, setError] = React.useState(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [libraries, setLibraries] = React.useState([]);
  const [groups, setGroups] = React.useState([]);

  const processError = res => {
    let errorString;
    if (res.statusCode && res.error && res.message) {
      errorString = `HTTP ${res.statusCode} ${res.error}: ${res.message}`;
    } else if (res.statusCode && res.status) {
      errorString = `HTTP ${res.statusCode}: ${res.status}`;
    } else {
      errorString = 'Error in response from server.';
    }
    return errorString;
  };

  React.useEffect(() => {
    let status;
    fetch('/api/v1/libraries')
      .then(res => {
        status = res.status;
        return res.json();
      })
      .then(libraries => {
        if (status === 200) {
          setLibraries(libraries.data);
          return;
        } else {
          processError(libraries);
          throw new Error(`Error in response from server.`);
        }
      })
      .then(() => fetch('/api/v1/groups'))
      .then(res => {
        status = res.status;
        return res.json();
      })
      .then(groups => {
        if (status === 200) {
          setGroups(groups.data);
          setIsLoaded(true);
          return;
        } else {
          processError(groups);
          throw new Error(`Error in response from server.`);
        }
      })
      .catch(error => {
        setError(error);
        console.error(error.name + error.message);
        setIsLoaded(true);
      });
  }, [errors, helperText]);

  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!isLoaded) {
    return <Loading />;
  } else {
    return (
      <Suspense>
        <Dialog
          onClose={handleClose}
          modal="true"
          open={open}
          aria-labelledby="add-user-title"
          fullWidth={true}
          maxWidth={'lg'}
          className={classes.dialog}
        >
          <Button
            label="Close"
            primary="true"
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
              error={errors && errors.username}
              helperText={helperText.username}
              className={classes.formField}
              id="user-username"
              label="Username"
              name="username"
              fullWidth
              variant="outlined"
              required
              onChange={handleInputChange}
            />
            <TextField
              error={errors && errors.password}
              helperText={helperText.password}
              className={classes.formField}
              id="user-password"
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              fullWidth
              variant="outlined"
              required
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
              error={errors && errors.email}
              helperText={helperText.email}
              className={classes.formField}
              id="user-email"
              label="Email"
              name="email"
              fullWidth
              variant="outlined"
              required
              onChange={handleInputChange}
            />
            <FormControl variant="outlined" className={classes.formControl}>
              <Autocomplete
                id="library-select"
                options={libraries}
                getOptionLabel={option => option.name}
                getOptionSelected={(option, value) => option.name === value}
                onChange={handleLocationChange}
                renderInput={params => (
                  <TextField {...params} label="Location" variant="outlined" />
                )}
              />
            </FormControl>
            <FormControl variant="outlined" className={classes.formControl}>
              <Autocomplete
                id="user-role"
                options={groups}
                getOptionLabel={option => option.name}
                getOptionSelected={(option, value) => option.name === value}
                onChange={handleRoleChange}
                renderInput={params => (
                  <TextField {...params} label="Roles" variant="outlined" />
                  )}
              />
            </FormControl>
            <Grid container alignItems="center" justify="space-between">
              <Grid item>
                <Button
                  size="small"
                  label="Cancel"
                  primary="true"
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
                  primary="true"
                  onClick={handleSubmit}
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
