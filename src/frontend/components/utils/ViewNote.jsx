import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
  cancelButton: {
    marginTop: "30px",
  },
  dialogTitleRoot: {
    marginTop: "30px",
  },
  dialogTitleText: {
    fontSize: "2.25rem",
    textAlign: "right"
  },
  form: {
    padding: "50px",
  },
  formField: {
    marginBottom: "30px",
  }
}))

export default function ViewNote(props) {
  const classes = useStyles();
  const { onNoteClose, selectedNoteValue, openNote } = props;

  const handleNoteClose = () => {
    onNoteClose(selectedNoteValue);
  };

  return (
    <Dialog onClose={handleNoteClose} modal={true} open={openNote} aria-labelledby="add-note-title" fullWidth={ true } maxWidth={"lg"}>
      <Grid container spacing={2} alignItems="center" justify="center">
        <Grid item xs={12} sm={7}>
          <DialogTitle id="add-note-title" className={classes.dialogTitleRoot}>
            <div className={classes.dialogTitleText}>View Note</div>
          </DialogTitle>
        </Grid>
        <Grid item xs={12} sm={5}>
          <Button size="small" label="Cancel" primary={true} onClick={handleNoteClose} className={classes.cancelButton}>
            Cancel
          </Button>
        </Grid>
      </Grid>

    </Dialog>
  );
}

ViewNote.propTypes = {
  onNoteClose: PropTypes.func.isRequired,
  openNote: PropTypes.bool.isRequired,
  selectedNoteValue: PropTypes.string.isRequired,
};
