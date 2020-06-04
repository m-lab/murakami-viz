import React, { useRef, useContext } from "react";
import { useDay } from "@datepicker-react/hooks";
import DatepickerContext from "./DatePickerContext.jsx";
import { makeStyles } from '@material-ui/core/styles';

export default function Day({ dayLabel, date }) {
  const dayRef = useRef(null);
  const {
    focusedDate,
    isDateFocused,
    isDateSelected,
    isDateHovered,
    isDateBlocked,
    isFirstOrLastSelectedDate,
    onDateSelect,
    onDateFocus,
    onDateHover
  } = useContext(DatepickerContext);
  const {
    isSelected,
    isSelectedStartOrEnd,
    isWithinHoverRange,
    disabledDate,
    onClick,
    onKeyDown,
    onMouseEnter,
    tabIndex
  } = useDay({
    date,
    focusedDate,
    isDateFocused,
    isDateSelected,
    isDateHovered,
    isDateBlocked,
    isFirstOrLastSelectedDate,
    onDateFocus,
    onDateSelect,
    onDateHover,
    dayRef
  });

  if (!dayLabel) {
    return <div />;
  };

  const getColor = (
    isSelected,
    isSelectedStartOrEnd,
    isWithinHoverRange,
    isDisabled
  ) => {
    return ({
      selectedFirstOrLastColor,
      normalColor,
      selectedColor,
      rangeHoverColor,
      disabledColor
    }) => {
      if (isSelectedStartOrEnd) {
        return selectedFirstOrLastColor;
      } else if (isSelected) {
        return selectedColor;
      } else if (isWithinHoverRange) {
        return rangeHoverColor;
      } else if (isDisabled) {
        return disabledColor;
      } else {
        return normalColor;
      }
    };
  }

  const getColorFn = getColor(
    isSelected,
    isSelectedStartOrEnd,
    isWithinHoverRange,
    disabledDate
  );

  const useStyles = makeStyles(theme => ({
    button: {
      padding: "8px",
      border: 0,
      color: getColorFn({
        selectedFirstOrLastColor: "#FFFFFF",
        normalColor: "#001217",
        selectedColor: "#FFFFFF",
        rangeHoverColor: "#FFFFFF",
        disabledColor: "#808285"
      }),
      background: getColorFn({
        selectedFirstOrLastColor: "#00aeef",
        normalColor: "#FFFFFF",
        selectedColor: "#71c9ed",
        rangeHoverColor: "#71c9ed",
        disabledColor: "#FFFFFF"
      })
    }
  }));

  const classes = useStyles();

  return (
    <button
      onClick={onClick}
      onKeyDown={onKeyDown}
      onMouseEnter={onMouseEnter}
      tabIndex={tabIndex}
      type="button"
      ref={dayRef}
      className={classes.button}
    >
      {dayLabel}
    </button>
  );
}
