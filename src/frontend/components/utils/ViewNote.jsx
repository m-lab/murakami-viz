import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
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
  formField: {
    marginBottom: "30px",
  },
  saveButton: {
    marginBottom: "0",
  }
}))

export default function AddNote(props) {
  const classes = useStyles();
  const { onClose, selectedValue, open } = props;

  const handleClose = () => {
    onClose(selectedValue);
  };

  return (
    <Dialog onClose={handleClose} modal={true} open={open} aria-labelledby="add-note-title" fullWidth={ true } maxWidth={"lg"} className={classes.dialog}>
      <Button label="Close" primary={true} onClick={handleClose} className={classes.closeButton}>
        <ClearIcon />
      </Button>
      <DialogTitle id="add-note-title" className={classes.dialogTitleRoot}>
        <div className={classes.dialogTitleText}>View Note</div>
      </DialogTitle>
      <div>
        Printer Connection Issue
      </div>
      <div>
        March 2, 2020, 3:58pm
      </div>
      <div>
        Morbi fringilla convallis sapien, id pulvinar odio volutpat. Ab illo tempore, ab est sed immemorabili. Gallia est omnis divisa in partes tres, quarum.
      </div>
      <Button size="small" label="Cancel" primary={true} onClick={handleClose} className={classes.cancelButton}>
        Cancel
      </Button>
    </Dialog>
  );
}

AddNote.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  selectedValue: PropTypes.string.isRequired,
};
