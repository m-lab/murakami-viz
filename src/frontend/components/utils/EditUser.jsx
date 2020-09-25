// base imports
import React, { useState } from 'react';
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
import FormHelperText from '@material-ui/core/FormHelperText';
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

const useForm = (callback, validated, user) => {
  const [inputs, setInputs] = useState(user);
  const handleSubmit = event => {
    if (event) {
      event.preventDefault();
    }
    if (validated(inputs)) {
      callback(inputs);
      setInputs({});
    }
  };
  const handleInputChange = event => {
    event.persist();
    setInputs(inputs => ({
      ...inputs,
      [event.target.name]: event.target.value.trim(), // removes whitespace
    }));
  };
  return {
    handleSubmit,
    handleInputChange,
    inputs,
  };
};

export default function EditUser(props) {
  const classes = useStyles();
  const { onClose, open, row } = props;
  const [error, setError] = React.useState(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [libraries, setLibraries] = React.useState([]);
  const [groups, setGroups] = React.useState([]);
  const [role, setRole] = React.useState(row.role);
  const [roleName, setRoleName] = React.useState(row.role_name);
  const [location, setLocation] = React.useState(row.location);
  const [locationName, setLocationName] = React.useState(row.location_name);
  const [errors, setErrors] = React.useState({});
  const [helperText, setHelperText] = React.useState({
    username: '',
  });

  const handleClose = () => {
    onClose(row);
  };

  const handleRoleChange = (event, values) => {
    setRole(values.id);
    setRoleName(values.name);
  };

  const handleLocationChange = (event, values) => {
    setLocation(values.id);
    setLocationName(values.name);
  };

  const validateEmail = email => {
    const re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return re.test(String(email).toLowerCase());
  };

  const validateInputs = inputs => {
    setErrors({});
    setHelperText({});

    if (_.isEmpty(inputs)) {
      setErrors(errors => ({
        ...errors,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        location: true,
        role: true,
      }));
      setHelperText(helperText => ({
        ...helperText,
        username: 'This field is required.',
        email: 'This field is required.',
        firstName: 'This field is required.',
        lastName: 'This field is required.',
        location: 'This field is required.',
        role: 'This field is required.',
      }));
      return false;
    } else {
      if (
        !inputs.username ||
        !inputs.firstName ||
        !inputs.lastName ||
        !inputs.email ||
        !location ||
        !role
      ) {
        if ((!inputs.username || inputs.username.length < 1) && !row.username) {
          setErrors(errors => ({
            ...errors,
            username: true,
          }));
          setHelperText(helperText => ({
            ...helperText,
            username: 'This field is required.',
          }));
        }
        if (!inputs.firstName) {
          setErrors(errors => ({
            ...errors,
            firstName: true,
          }));
          setHelperText(helperText => ({
            ...helperText,
            firstName: 'This field is required.',
          }));
        }
        if (!inputs.lastName) {
          setErrors(errors => ({
            ...errors,
            lastName: true,
          }));
          setHelperText(helperText => ({
            ...helperText,
            lastName: 'This field is required.',
          }));
        }
        if (
          (!validateEmail(inputs.email) || inputs.email.length < 1) &&
          !validateEmail(row.email)
        ) {
          setErrors(errors => ({
            ...errors,
            email: true,
          }));
          setHelperText(helperText => ({
            ...helperText,
            email: 'Please enter a valid email address.',
          }));
        }
        if (!location) {
          setErrors(errors => ({
            ...errors,
            location: true,
          }));
          setHelperText(helperText => ({
            ...helperText,
            location:
              'Please select a location with which to associate this user.',
          }));
        }
        if (!role) {
          setErrors(errors => ({
            ...errors,
            role: true,
          }));
          setHelperText(helperText => ({
            ...helperText,
            role: 'Please select a role for this user.',
          }));
        }
        return false;
      } else {
        return true;
      }
    }
  };

  const submitData = inputs => {
    // workaround to ensure that the PUT body is idempotent
    const toSubmit = {
      ...inputs,
      location: location,
      role: role,
    };
    // these attributes are necessary for the user object on the frontend
    // but the backend does not accept them
    for (let key in toSubmit) {
      if (
        toSubmit[key] === null ||
        toSubmit[key] === undefined ||
        key === 'location_name' ||
        key === 'isActive' ||
        key === 'location_address' ||
        key === 'role_name' ||
        key === 'id'
      ) {
        delete toSubmit[key];
      }
    }

    fetch(`api/v1/users/${row.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: toSubmit }),
    })
      .then(response => {
        if (response.status === 201 || response.status === 204) {
          alert(`User edited successfully.`);
          onClose({
            ...toSubmit,
            location_name: locationName,
            role_name: roleName,
          });
          return;
        } else {
          const error = processError(response.json());
          throw new Error(error);
        }
      })
      .catch(error => {
        alert(
          `An error occurred. Please try again or contact an administrator. ${
            error.name
          }: ${error.message}`,
        );
        onClose();
      });
  };

  const processError = res => {
    let errorString;
    if (res.statusCode && res.error && res.message) {
      errorString = `HTTP ${res.statusCode} ${res.error}: ${res.message}`;
    } else if (res.statusCode && res.status) {
      errorString = `HTTP ${res.statusCode}: ${res.status}`;
    } else if (res) {
      errorString = res;
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
  }, []);

  const { inputs, handleInputChange, handleSubmit } = useForm(
    submitData,
    validateInputs,
    row,
  );

  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!isLoaded) {
    return <Loading />;
  } else {
    return (
      <Dialog
        onClose={handleClose}
        modal="true"
        open={open}
        aria-labelledby="edit-user-title"
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
        <DialogTitle id="edit-user-title" className={classes.dialogTitleRoot}>
          <div className={classes.dialogTitleText}>Edit User</div>
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
            defaultValue={row.username}
            onChange={handleInputChange}
            required
          />
          <TextField
            error={errors && errors.firstName}
            helperText={helperText.firstName}
            className={classes.formField}
            id="user-first-name"
            label="First Name"
            name="firstName"
            fullWidth
            required
            variant="outlined"
            defaultValue={row.firstName}
            onChange={handleInputChange}
          />
          <TextField
            error={errors && errors.lastName}
            helperText={helperText.lastName}
            className={classes.formField}
            id="user-last-name"
            label="Last Name"
            name="lastName"
            fullWidth
            required
            variant="outlined"
            defaultValue={row.lastName}
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
            defaultValue={row.email}
            onChange={handleInputChange}
            required
          />
          <Grid container>
            <Grid item>
              <TextField
                className={classes.formField}
                id="user-phone"
                label="Phone number"
                name="phone"
                fullWidth
                variant="outlined"
                defaultValue={row.phone}
                onChange={handleInputChange}
                value={inputs.phone}
              />
            </Grid>
            <Grid item>
              <TextField
                className={classes.formField}
                id="user-extension"
                label="Extension"
                name="extension"
                fullWidth
                variant="outlined"
                defaultValue={row.extension}
                onChange={handleInputChange}
                value={inputs.extension}
              />
            </Grid>
          </Grid>
          <TextField
            className={classes.formField}
            id="user-password"
            label="Password"
            name="password"
            fullWidth
            type="password"
            variant="outlined"
            onChange={handleInputChange}
            value={inputs.password}
          />
          <FormControl
            variant="outlined"
            className={classes.formControl}
            error={errors && errors.location}
          >
            <Autocomplete
              id="library-select"
              options={libraries}
              getOptionLabel={option => option.name}
              getOptionSelected={(option, value) => option.name === value.name}
              defaultValue={libraries.find(
                library => library.id === row.location,
              )}
              onChange={handleLocationChange}
              renderInput={params => (
                <TextField {...params} label="Location" variant="outlined" />
              )}
            />
            <FormHelperText>{helperText.location}</FormHelperText>
          </FormControl>
          <FormControl
            variant="outlined"
            className={classes.formControl}
            error={errors && errors.role}
          >
            <Autocomplete
              id="user-role"
              options={groups}
              getOptionLabel={option => option.name}
              getOptionSelected={(option, value) => option.name === value.name}
              defaultValue={groups.find(group => group.id === row.role)}
              onChange={handleRoleChange}
              renderInput={params => (
                <TextField {...params} label="Roles" variant="outlined" />
              )}
            />
            <FormHelperText>{helperText.role}</FormHelperText>
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
                onClick={handleSubmit}
                className={classes.cancelButton}
                variant="contained"
                disableElevation
                color="primary"
                primary="true"
              >
                Save
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Dialog>
    );
  }
}

EditUser.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  row: PropTypes.object.isRequired,
};
