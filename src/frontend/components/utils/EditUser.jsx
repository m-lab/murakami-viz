// base imports
import React, { useState } from 'react';
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

  const submitData = () => {
    const toSubmit = {
      ...inputs,
      location: location,
      role: role,
    };

    let status;
    fetch(`api/v1/users/${row.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: toSubmit }),
    })
      .then(response => {
        status = response.status;
        return response.json();
      })
      .then(results => {
        if (status === 200 || status === 201 || status === 204) {
          alert(`User edited successfully.`);
          onClose({
            ...toSubmit,
            location_name: locationName,
            role_name: roleName,
          });
          return;
        } else {
          processError(results);
          throw new Error(`Error in response from server.`);
        }
      })
      .catch(error => {
        console.error(error.name + error.message);
        alert(
          'An error occurred. Please try again or contact an administrator.',
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

  const { inputs, handleInputChange, handleSubmit } = useForm(submitData);

  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!isLoaded) {
    return <Loading />;
  } else {
    return (
      <Dialog
        onClose={handleClose}
        modal={true}
        open={open}
        aria-labelledby="edit-user-title"
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
        <DialogTitle id="edit-user-title" className={classes.dialogTitleRoot}>
          <div className={classes.dialogTitleText}>Edit User</div>
        </DialogTitle>
        <Box className={classes.form}>
          <TextField
            className={classes.formField}
            id="user-username"
            label="Username"
            name="username"
            fullWidth
            variant="outlined"
            defaultValue={row.username}
            onChange={handleInputChange}
            value={inputs.username}
            required
          />
          <TextField
            className={classes.formField}
            id="user-first-name"
            label="First Name"
            name="firstName"
            fullWidth
            variant="outlined"
            defaultValue={row.firstName}
            onChange={handleInputChange}
            value={inputs.firstName}
          />
          <TextField
            className={classes.formField}
            id="user-last-name"
            label="Last Name"
            name="lastName"
            fullWidth
            variant="outlined"
            defaultValue={row.lastName}
            onChange={handleInputChange}
            value={inputs.lastName}
          />
          <TextField
            className={classes.formField}
            id="user-email"
            label="Email"
            name="email"
            fullWidth
            variant="outlined"
            defaultValue={row.email}
            onChange={handleInputChange}
            value={inputs.email}
            required
          />
          <FormControl variant="outlined" className={classes.formControl}>
            <Autocomplete
              id="library-select"
              options={libraries}
              getOptionLabel={option => option.name}
              getOptionSelected={(option, value) => option.name === value}
              defaultValue={libraries.find(
                library => library.id === row.location,
              )}
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
              defaultValue={groups.find(group => group.id === row.role)}
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
                onClick={handleSubmit}
                className={classes.cancelButton}
                variant="contained"
                disableElevation
                color="primary"
                primary={true}
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
