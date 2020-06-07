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
  formField: {
    marginBottom: '30px',
  },
  saveButton: {
    marginBottom: '0',
  },
}));

function formatDate(date) {
  return date.toISOString().substring(0, 19);
}

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

export default function AddFaq(props) {
  const classes = useStyles();
  const { onClose, open } = props;

  const handleClose = () => {
    onClose();
  };

  // submit new faq to api
  const submitData = () => {
    let status;
    fetch('api/v1/faqs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: inputs }),
    })
      .then(res => {
        status = res.status;
        return res.json();
      })
      .then(() => {
        if (status === 201) {
          alert('Faq submitted successfully.');
          onClose(inputs);
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

  const { inputs, handleInputChange, handleSubmit } = useForm(submitData);

  return (
    <Dialog
      onClose={handleClose}
      modal={true}
      open={open}
      aria-labelledby="add-faq-title"
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
      <DialogTitle id="add-faq-title" className={classes.dialogTitleRoot}>
        <div className={classes.dialogTitleText}>Add a Faq</div>
      </DialogTitle>
      <Box className={classes.form}>
        <TextField
          className={classes.formField}
          id="faq-question"
          label="Question"
          name="question"
          fullWidth
          variant="outlined"
          onChange={handleInputChange}
        />
        <TextField
          className={classes.formField}
          id="faq-answer"
          label="Answer"
          name="answer"
          multiline="true"
          rows="5"
          fullWidth
          variant="outlined"
          onChange={handleInputChange}
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
              onClick={handleSubmit}
            >
              Save
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Dialog>
  );
}

AddFaq.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  library: PropTypes.object,
};