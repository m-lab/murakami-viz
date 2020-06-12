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

export default function EditForum(props) {
  const classes = useStyles();
  const { onClose, open, forumValue } = props;
  const [forum, setForum] = useState('https://example.com');

  const handleClose = () => {
    onClose(forum);
  };

  const submitData = () => {
    let status;
    fetch('api/v1/settings/forum', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: forum }),
    })
      .then(res => {
        status = res.status;
        return res.json();
      })
      .then(() => {
        if (status === 200 || status === 201) {
          alert('Forum link submitted successfully.');
          onClose(forum);
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
  };

  useEffect(() => {
    setForum(forumValue);
  }, [forumValue]);

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
        <div className={classes.dialogTitleText}>Edit Forum Link</div>
      </DialogTitle>
      <Box className={classes.form}>
        <TextField
          className={classes.formField}
          id="forum"
          label="Forum"
          name="forum"
          multiline="false"
          fullWidth
          variant="outlined"
          onChange={e => setForum(e.currentTarget.value)}
          value={forum}
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

EditForum.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  forumValue: PropTypes.string,
};
