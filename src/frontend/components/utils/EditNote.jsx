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

export default function EditNote(props) {
  const classes = useStyles();
  const { onClose, open, row } = props;
  const [date, setDate] = React.useState(row.date);
  const [description, setDescription] = React.useState(row.description);
  const [subject, setSubject] = React.useState(row.subject);

  const handleClose = () => {
    onClose();
  };

  const submitData = () => {
    fetch(`api/v1/notes/${row.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: { subject: subject, date: date, description: description },
      }),
    })
      .then(response => response.json())
      .then(results => {
        alert('Note edited successfully.');
        onClose(results.data[0]);
        return;
      })
      .catch(error => {
        console.error(error.name + error.message);
        alert(
          'An error occurred. Please try again or contact an administrator.',
        );
        onClose();
      });
  };

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
        <div className={classes.dialogTitleText}>Edit Note</div>
      </DialogTitle>
      <Box className={classes.form}>
        <TextField
          className={classes.formField}
          id="note-subject"
          label="Subject"
          name="subject"
          fullWidth
          variant="outlined"
          defaultValue={row.subject}
          onChange={e => setSubject(e.target.value)}
          value={subject}
        />
        <MuiPickersUtilsProvider utils={DateFnUtils}>
          <DateTimePicker
            className={classes.datePicker}
            value={date}
            onChange={e => setDate(e)}
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
          defaultValue={row.description}
          onChange={e => setDescription(e.target.value)}
          value={description}
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

EditNote.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  row: PropTypes.object.isRequired,
};
