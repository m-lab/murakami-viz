import React from "react";
import { useMonth } from "@datepicker-react/hooks";
import Day from "./Day.jsx";
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  grid: {
    display: "grid",
    fontSize: "10px",
    gridTemplateColumns: "repeat(7, 1fr)",
    justifyContent: "center",
    marginBottom: "10px",
  },
  gridCentered: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    justifyContent: "center",
  },
}));

export default function Month({ year, month, firstDayOfWeek }) {
  const classes = useStyles();

  const { days, weekdayLabels, monthLabel } = useMonth({
    year,
    month,
    firstDayOfWeek
  });

  return (
    <div>
      <div css={{ textAlign: "center", margin: "0 0 16px" }}>
        <strong>{monthLabel}</strong>
      </div>
      <div className={classes.grid}>
        {weekdayLabels.map(dayLabel => (
          <div css={{ textAlign: "center" }} key={dayLabel}>
            {dayLabel}
          </div>
        ))}
      </div>
      <div className={classes.gridCentered}>
        {days.map((day, index) => {
          if (typeof day === "object") {
            return (
              <Day
                date={day.date}
                key={day.date.toString()}
                dayLabel={day.dayLabel}
              />
            );
          }
          return <div key={index} />;
        })}
      </div>
    </div>
  );
}
