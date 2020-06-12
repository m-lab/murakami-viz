// base imports
import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import DateFnUtils from '@date-io/date-fns';

// material ui imports
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { MuiPickersUtilsProvider, DateTimePicker } from '@material-ui/pickers';

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
  datePicker: {
    marginBottom: '30px',
  },
  saveButton: {
    marginBottom: '0',
  },
}));

export default function AddNote(props) {
  const classes = useStyles();
  const { onClose, open, library } = props;
  const [date, setDate] = React.useState(new Date());
  const [description, setDescription] = React.useState();
  const [subject, setSubject] = React.useState();

  const handleClose = () => {
    onClose();
  };

  // submit new note to api
  const submitData = () => {
    let status;
    fetch(`api/v1/libraries/${library.id}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: { subject: subject, date: date, description: description },
      }),
    })
      .then(res => {
        status = res.status;
        return res.json();
      })
      .then(() => {
        if (status === 201) {
          alert('Note submitted successfully.');
          onClose({ subject: subject, date: date, description: description });
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

  return (
    <Dialog
      onClose={handleClose}
      modal={true}
      open={open}
      aria-labelledby="add-note-title"
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
      <DialogTitle id="add-note-title" className={classes.dialogTitleRoot}>
        <div className={classes.dialogTitleText}>Add a Note</div>
      </DialogTitle>
      <Box className={classes.form}>
        <TextField
          className={classes.formField}
          id="note-subject"
          label="Subject"
          name="subject"
          fullWidth
          variant="outlined"
          onChange={e => setSubject(e.target.value)}
        />

        <MuiPickersUtilsProvider utils={DateFnUtils}>
          <DateTimePicker
            className={classes.datePicker}
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </MuiPickersUtilsProvider>

        <TextField
          className={classes.formField}
          id="note-description"
          label="Description"
          name="description"
          multiline="true"
          rows="5"
          fullWidth
          variant="outlined"
          onChange={e => setDescription(e.target.value)}
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
  );
}

AddNote.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  library: PropTypes.object,
};
