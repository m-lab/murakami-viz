// base imports
import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import DateFnUtils from '@date-io/date-fns';
import _ from 'lodash/core';

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

const useForm = (callback, validated, note) => {
  const [inputs, setInputs] = React.useState(note);
  const handleSubmit = event => {
    if (event) {
      event.preventDefault();
    }
    setInputs(inputs => {
      delete inputs.created_at;
      delete inputs.updated_at;
      delete inputs.lid;
      delete inputs.nid;
    });
    if (validated(inputs)) {
      callback();
      setInputs({});
    }
  };
  const handleInputChange = event => {
      event.persist();
      setInputs(inputs => ({
        ...inputs,
        [event.target.name]: event.target.value.trim(),
      }));
    }
  

  return {
    handleSubmit,
    handleInputChange,
    inputs,
  };
};

export default function EditNote(props) {
  const classes = useStyles();
  const { onClose, open, row } = props;
  const [errors, setErrors] = React.useState({});
  const [date, setDate] = React.useState(null)
  const [helperText, setHelperText] = React.useState({
    name: '',
  });

  // handle form validation
  const validateInputs = inputs => {
    setErrors({});
    setHelperText({});
    if (_.isEmpty(inputs)) {
      setErrors(errors => ({
        ...errors,
        subject: true,
      }));
      setHelperText(helperText => ({
        ...helperText,
        subject: 'Please enter a subject and description.',
      }));
      return false;
    } else {
      if (!inputs.subject || !inputs.description) {
        if (!inputs.subject) {
          setErrors(errors => ({
            ...errors,
            subject: true,
          }));
          setHelperText(helperText => ({
            ...helperText,
            subject: 'Please enter a subject.',
          }));
        }
        if (!inputs.description) {
          setErrors(errors => ({
            ...errors,
            description: true,
          }));
          setHelperText(helperText => ({
            ...helperText,
            description: 'Please enter a description.',
          }));
        }
        return false;
      } else {
        return true;
      }
    }
  };

  const handleClose = () => {
    onClose();
  };

  // handle api data errors
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

  const submitData = () => {
    let status;
    
    delete inputs['author']

    const noteToSubmit = {
      ...inputs,
      date: date.toISOString()
    }

    fetch(`api/v1/notes/${inputs.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: noteToSubmit })
    })
      .then(response => {
        status = response.status;
        return !!response.bodyUsed ? response.json() : null
      })
      .then(result => {
        if (status === 204) {
          alert('Note edited successfully.');
          onClose(noteToSubmit);
          return;
        } else if (status === 201) {
          alert('New note created.');
          onClose(noteToSubmit);
        } else {
          const error = processError(result);
          throw new Error(`Error in response from server: ${error}`);
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

  const { inputs, handleInputChange, handleSubmit } = useForm(
    submitData,
    validateInputs,
    row,
  );

  React.useEffect(() => {}, [errors, helperText]);

  return (
    <Dialog
      onClose={handleClose}
      modal="true"
      open={open}
      aria-labelledby="edit-note-title"
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
      <DialogTitle id="edit-note-title" className={classes.dialogTitleRoot}>
        <div className={classes.dialogTitleText}>Edit Note</div>
      </DialogTitle>
      <Box className={classes.form}>
        <TextField
          error={errors && errors.subject}
          helperText={helperText.subject}
          className={classes.formField}
          id="note-subject"
          label="Subject"
          name="subject"
          fullWidth
          variant="outlined"
          onChange={handleInputChange}
          defaultValue={row.subject || inputs.subject || ''}
          required
        />
        <MuiPickersUtilsProvider utils={DateFnUtils}>
          <DateTimePicker
            className={classes.datePicker}
            value={!date ? row.date : date}
            onChange={setDate}
          />
        </MuiPickersUtilsProvider>

        <TextField
          error={errors && errors.description}
          helperText={helperText.description}
          className={classes.formField}
          id="note-description"
          label="Description"
          name="description"
          multiline={true}
          rows="5"
          fullWidth
          variant="outlined"
          onChange={handleInputChange}
          defaultValue={row.description || inputs.description || ''}
          required
        />
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

EditNote.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  row: PropTypes.object.isRequired,
};
