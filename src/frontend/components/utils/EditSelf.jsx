// base imports
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

// material ui imports
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';

// icons imports
import ClearIcon from '@material-ui/icons/Clear';

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

export default function EditSelf(props) {
  const classes = useStyles();
  const { onClose, open, row } = props;

  const handleClose = () => {
    onClose();
  };

  const submitData = () => {
    let status;
    fetch(`api/v1/users/${row.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: inputs }),
    })
      .then(response => {
        status = response.status;
        return response.json();
      })
      .then(results => {
        if (status === 200) {
          alert('User edited successfully.');
          onClose(results.data[0]);
          return;
        } else {
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

  const { inputs, handleInputChange, handleSubmit } = useForm(submitData);

  return (
    <Dialog
      onClose={handleClose}
      modal={true}
      open={open}
      aria-labelledby="edit-user-title"
      fullWidth={true}
      maxWidth={'lg'}
      lassName={classes.dialog}
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
          disabled
          className={classes.formField}
          id="user-username"
          label="Username"
          name="username"
          fullWidth
          variant="outlined"
          defaultValue={row.username}
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
        />
        <Grid container>
          <Grid item>
            <TextField
              className={classes.formField}
              id="user-phone"
              label="Phone"
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
              variant="outlined"
              defaultValue={row.extension}
              onChange={handleInputChange}
              value={inputs.extension}
            />
          </Grid>
        </Grid>
        <TextField
          className={classes.formField}
          id="user-oldpassword"
          label="Old Password"
          name="oldPassword"
          fullWidth
          type="password"
          variant="outlined"
          defaultValue={row.oldPassword}
          onChange={handleInputChange}
          value={inputs.oldPassword}
        />
        <TextField
          className={classes.formField}
          id="user-newpassword"
          label="New Password"
          name="newPassword"
          fullWidth
          type="password"
          variant="outlined"
          defaultValue={row.newPassword}
          onChange={handleInputChange}
          value={inputs.newPassword}
        />
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

EditSelf.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  row: PropTypes.object.isRequired,
};
