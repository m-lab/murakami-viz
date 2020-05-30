// base imports
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

// material ui imports
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

// icons imports
import ClearIcon from '@material-ui/icons/Clear';

const useStyles = makeStyles(theme => ({
  cancelButton: {
  },
  closeButton: {
    marginTop: "15px",
    position: "absolute",
    right: "0",
    top: "0"
  },
  dialog: {
    position: "relative"
  },
  dialogTitleRoot: {
    marginTop: "30px",
  },
  dialogTitleText: {
    fontSize: "2.25rem",
    textAlign: "center"
  },
  form: {
    padding: "50px",
  },
  formControl: {
    width: "100%",
  },
  formField: {
    marginBottom: "30px",
    width: "100%",
  },
  saveButton: {
    marginBottom: "0",
  }
}))

function formatName(first, last) {
  return (`${first} ${last}`);
}

const useForm = (callback) => {
  const [inputs, setInputs] = useState({});
  const handleSubmit = (event) => {
    if (event) {
      event.preventDefault();
    }
    callback();
  }
  const handleInputChange = (event) => {
    event.persist();
    setInputs(inputs => ({...inputs, [event.target.name]: event.target.value}));
  }
  return {
    handleSubmit,
    handleInputChange,
    inputs
  };
}

export default function EditUser(props) {
  const classes = useStyles();
  const { onClose, open, row } = props;

  const handleClose = () => {
    onClose();
  };

  const submitData = () => {
    fetch(`api/v1/users/${props.row.id}`, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inputs),
    })
    .then(response => response.json())
    .then(results => {
      alert('User edited successfully.');
      onClose(results.data[0]);
    })
    .catch(error => {
      alert('An error occurred. Please try again or contact an administrator.');
      onClose();
    });

  }

  const {inputs, handleInputChange, handleSubmit} = useForm(submitData);

  return (
    <Dialog
      onClose={handleClose}
      modal={true}
      open={open}
      aria-labelledby="edit-user-title"
      fullWidth={ true }
      maxWidth={"lg"}
      lassName={classes.dialog}>
      <Button label="Close" primary={true} onClick={handleClose} className={classes.closeButton}>
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
          defaultValue={props.row.username}
          onChange={handleInputChange}
          value={inputs.username}
        />
        <TextField
          className={classes.formField}
          id="user-first-name"
          label="First Name"
          name="firstName"
          fullWidth
          variant="outlined"
          defaultValue={props.row.firstName}
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
          defaultValue={props.row.lastName}
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
          defaultValue={props.row.email}
          onChange={handleInputChange}
          value={inputs.email}
        />
        <TextField
          className={classes.formField}
          id="user-location"
          label="Location"
          name="location"
          fullWidth
          variant="outlined"
          defaultValue={props.row.location}
          onChange={handleInputChange}
          value={inputs.location}
        />
        <FormControl variant="outlined" className={classes.formControl}>
          <InputLabel id="user-role">Role</InputLabel>
          <Select
            labelId="user-role"
            className={classes.formField}
            id="user-role"
            label="Role"
            name="role"
            defaultValue={props.row.role}
            onChange={handleInputChange}
            value={inputs.role}
          >
            <MenuItem value='editor'>Editor</MenuItem>
            <MenuItem value='viewer'>Viewer</MenuItem>
          </Select>
        </FormControl>
        <Grid container alignItems="center" justify="space-between">
          <Grid item>
            <Button size="small" label="Cancel" primary={true} onClick={handleClose} className={classes.cancelButton}>
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
              primary={true}>
              Save
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Dialog>
  );
}

EditUser.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  row: PropTypes.object.isRequired,
};
