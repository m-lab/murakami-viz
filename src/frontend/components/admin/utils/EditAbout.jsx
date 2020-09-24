// base imports
import React, { useEffect, useState } from 'react';
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
  formField: {
    marginBottom: '30px',
  },
  saveButton: {
    marginBottom: '0',
  },
}));

export default function EditAbout(props) {
  const classes = useStyles();
  const { onClose, open, aboutValue } = props;
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState('');
  const [about, setAbout] = useState('');

  const handleClose = () => {
    onClose(aboutValue);
  };

  const validated = value => {
    if (!!value.trim() && value.length !== 0) {
      setHelperText('');
      setError(false);
      return true;
    } else {
      setHelperText('This field cannot be blank.');
      setError(true);
      return false;
    }
  };

  const submitData = () => {
    if (validated(about)) {
      let status;
      fetch('api/v1/settings/about', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: about }),
      })
        .then(res => {
          status = res.status;
        })
        .then(() => {
          if (status === 204 || status === 201) {
            alert('About page submitted successfully.');
            onClose(about);
            return;
          } else {
            throw new Error(`Error in response from server.`);
          }
        })
        .catch(error => {
          alert(
            'An error occurred. Please try again or contact an administrator.',
          );
          console.error(error.name + error.message);
          onClose();
        });
    }
  };

  useEffect(() => {
    setAbout(aboutValue);
  }, [aboutValue]);

  return (
    <Dialog
      onClose={handleClose}
      modal={true}
      open={open}
      aria-labelledby="edit-note-title"
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
      <DialogTitle id="edit-note-title" className={classes.dialogTitleRoot}>
        <div className={classes.dialogTitleText}>Edit About Section</div>
      </DialogTitle>
      <Box className={classes.form}>
        <TextField
          error={error}
          helperText={helperText}
          className={classes.formField}
          id="about"
          label="About"
          name="about"
          multiline="true"
          rows="5"
          fullWidth
          variant="outlined"
          onChange={e => setAbout(e.currentTarget.value)}
          value={about}
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
              onClick={submitData}
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

EditAbout.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  aboutValue: PropTypes.string,
};
