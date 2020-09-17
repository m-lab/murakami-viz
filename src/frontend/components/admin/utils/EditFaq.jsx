// base imports
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import _ from 'lodash/core';

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

const useForm = (callback, validated, faq) => {
  const initialValue = { question: faq.question, answer: faq.answer };
  const [inputs, setInputs] = useState(initialValue);
  const handleSubmit = event => {
    if (event) {
      event.preventDefault();
    }
    if (validated(inputs)) {
      callback(faq);
      setInputs({});
    }
  };
  const handleInputChange = event => {
    event.persist();
    setInputs(inputs =>({
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

export default function EditFaq(props) {
  const classes = useStyles();
  const { onClose, open, row } = props;
  const [errors, setErrors] = React.useState({});
  const [helperText, setHelperText] = React.useState({
    question: '',
    answer: '',
  });

  const handleClose = () => {
    onClose();
  };

  const validateInputs = inputs => {
    setErrors({});
    setHelperText({});

    if (_.isEmpty(inputs)) {
      setErrors(errors => ({
        ...errors,
        question: true,
      }));
      setHelperText(helperText => ({
        ...helperText,
        question: 'Please enter a question and answer.',
      }));
      return false;
    } else {
      if (!inputs.question || !inputs.answer) {
        if (!inputs.question) {
          setErrors(errors => ({
            ...errors,
            question: true,
          }));
          setHelperText(helperText => ({
            ...helperText,
            question: 'Please enter a question.',
          }));
        }
        if (!inputs.answer) {
          setErrors(errors => ({
            ...errors,
            answer: true,
          }));
          setHelperText(helperText => ({
            ...helperText,
            answer: 'Please enter an answer.',
          }));
        }
        return false;
      } else {
        return true;
      }
    }
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
    fetch(`api/v1/faqs/${row.id}`, {
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
          alert('FAQ edited successfully.');
          onClose(results.data[0]);
          return;
        } else {
          const error = processError(results);
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

  return (
    <Dialog
      onClose={handleClose}
      modal={true}
      open={open}
      aria-labelledby="edit-faq-title"
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
      <DialogTitle id="edit-faq-title" className={classes.dialogTitleRoot}>
        <div className={classes.dialogTitleText}>Edit Faq</div>
      </DialogTitle>
      <Box className={classes.form}>
        <TextField
          error={errors && errors.question}
          helperText={helperText.question}
          className={classes.formField}
          id="faq-question"
          label="Question"
          name="question"
          fullWidth
          variant="outlined"
          defaultValue={row.question}
          onChange={handleInputChange}
        />
        <TextField
          error={errors && errors.answer}
          helperText={helperText.answer}
          className={classes.formField}
          id="faq-answer"
          label="Answer"
          name="answer"
          multiline="true"
          rows="5"
          fullWidth
          variant="outlined"
          defaultValue={row.answer}
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

EditFaq.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  row: PropTypes.object.isRequired,
};
