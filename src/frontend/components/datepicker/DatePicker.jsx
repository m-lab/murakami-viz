// base imports
import React, { useState } from "react";
import { useDatepicker, START_DATE } from "@datepicker-react/hooks";
import { makeStyles } from '@material-ui/core/styles';

// material ui imports
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';

// icon imports
import EventIcon from '@material-ui/icons/Event';

// module imports
import Month from "./Month";
import NavButton from "./NavButton";
import DatepickerContext from "./datepickerContext";

const today = new Date();
const weekAgo = new Date(today.setDate(today.getDate() - 7));

export default function Datepicker() {
  const [state, setState] = useState({
    startDate: weekAgo,
    endDate: new Date(),
    focusedInput: START_DATE
  });

  const {
    firstDayOfWeek,
    activeMonths,
    isDateSelected,
    isDateHovered,
    isFirstOrLastSelectedDate,
    isDateBlocked,
    isDateFocused,
    focusedDate,
    onDateHover,
    onDateSelect,
    onDateFocus,
    goToPreviousMonths,
    goToNextMonths
  } = useDatepicker({
    startDate: state.startDate,
    endDate: state.endDate,
    focusedInput: state.focusedInput,
    onDatesChange: handleDateChange
  });
  const useStyles = makeStyles(theme => ({
    buttons: {
      marginLeft: '30px',
    },
    dialog: {
      padding: '20px',
    },
    grid: {
      display: "grid",
      gridGap: "0 15px",
      gridTemplateColumns: `repeat(${activeMonths.length}, 300px)`,
      margin: "32px",
    },
  }));
  const classes = useStyles();

  function handleDateChange(data) {
    if (!data.focusedInput) {
      setState({ ...data, focusedInput: START_DATE });
    } else {
      setState(data);
    }
  }

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (value) => {
    setOpen(false);
  };

  return (
    <DatepickerContext.Provider
      value={{
        focusedDate,
        isDateFocused,
        isDateSelected,
        isDateHovered,
        isDateBlocked,
        isFirstOrLastSelectedDate,
        onDateSelect,
        onDateFocus,
        onDateHover
      }}
    >
      <Button variant="outlined" onClick={handleClickOpen}>
        <EventIcon />
        <span>
          {state.startDate && state.startDate.toLocaleString().split(",")[0]}
        </span>
        -
        <span>
          {state.endDate && state.endDate.toLocaleString().split(",")[0]}
        </span>
      </Button>
      <Dialog
        className={classes.dialog}
        maxWidth={'md'}
        onClose={handleClose}
        aria-labelledby="calendar-title"
        open={open}>
        <Hidden>
          <DialogTitle id="calendar-title">Select date range</DialogTitle>
        </Hidden>
        <Grid container className={classes.buttons} spacing={2}>
          <Grid item>
            <NavButton onClick={goToPreviousMonths}>Previous</NavButton>
          </Grid>
          <Grid item>
            <NavButton onClick={goToNextMonths}>Next</NavButton>
          </Grid>
        </Grid>

        <div className={classes.grid}>
          {activeMonths.map(month => (
            <Month
              key={`${month.year}-${month.month}`}
              year={month.year}
              month={month.month}
              firstDayOfWeek={firstDayOfWeek}
            />
          ))}
        </div>
      </Dialog>
    </DatepickerContext.Provider>
  );
}
