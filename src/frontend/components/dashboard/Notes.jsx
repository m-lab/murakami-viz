import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import AddNote from '../utils/AddNote.jsx';
import EditNote from '../utils/EditNote.jsx';
import ViewNote from '../utils/ViewNote.jsx';

function createData(date, subject, description) {
  return { date, subject, description };
}

const rows = [
  createData('March 2, 2020, 3:58pm', 'Printer Connection Issue', 'Lorem Ipsum...'),
  createData('March 8, 2020, 6:31pm', 'Lorem Ipsum', 'Lorem Ipsum...'),
  createData('April 27, 2020, 4:12pm', 'Lorem Ipsum', 'Lorem Ipsum...'),
  createData('April 13, 2020, 12:38pm', 'Lorem Ipsum', 'Lorem Ipsum...'),
  createData('April 13, 2020, 8:41am', 'Lorem Ipsum', 'Lorem Ipsum...'),
  createData('April 2, 2020, 6:21pm', 'Lorem Ipsum', 'Lorem Ipsum...'),
  createData('March 30, 2020, 2:48pm', 'Lorem Ipsum', 'Lorem Ipsum...'),
  createData('March 26, 2020, 10:32am', 'Lorem Ipsum', 'Lorem Ipsum...'),
  createData('March 17, 2020, 8:14am', 'Lorem Ipsum', 'Lorem Ipsum...'),
  createData('March 12, 2020, 7:12pm', 'Lorem Ipsum', 'Lorem Ipsum...'),
  createData('March 6, 2020, 3:27pm', 'Lorem Ipsum', 'Lorem Ipsum...'),
  createData('March 1, 2020, 12:01pm', 'Lorem Ipsum', 'Lorem Ipsum...'),
  createData('Lorem Ipsum', 'Lorem Ipsum', 'Lorem Ipsum...'),
];

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  { id: 'date', numeric: false, disablePadding: true, label: 'Date' },
  { id: 'subject', numeric: false, disablePadding: false, label: 'Subject' },
  { id: 'description', numeric: false, disablePadding: false, label: 'Description' },
];

function EnhancedTableHead(props) {
  const { classes, order, orderBy, rowCount, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            padding={headCell.disablePadding ? 'none' : 'default'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlight:
    theme.palette.type === 'light'
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  title: {
    flex: '1 1 100%',
  },
}));

const EnhancedTableToolbar = (props) => {
  const classes = useToolbarStyles();

  // handle add note
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (value) => {
    setOpen(false);
    setSelectedValue(value);
  };

  return (
    <Toolbar
      className={clsx(classes.root,)}
    >
      <Grid container spacing={2} alignItems="center" justify="flex-start">
        <Grid item>
          <Typography component="h2" variant="h3">
            Notes
          </Typography>
        </Grid>
        <Grid item>
          <Button variant="outlined" color="primary" onClick={handleClickOpen}>
            Add a note
          </Button>
          <AddNote selectedValue={selectedValue} open={open} onClose={handleClose} />
        </Grid>
      </Grid>
    </Toolbar>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    marginBottom: theme.spacing(2),
    width: '100%',
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
}));

export default function EnhancedTable() {
  const classes = useStyles();
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('date');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // handle pagination changes
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  // handle view note
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState();

  const handleClickOpen = (event, row) => {
    setOpen(true);
  }

  const handleClose = () => {
    setOpen(false);
    setSelectedValue(value);
  }

  return (
    <div className={classes.root}>
      <EnhancedTableToolbar />
      <TableContainer>
        <Table
          className={classes.table}
          aria-labelledby="tableTitle"
          aria-label="enhanced table"
        >
          <EnhancedTableHead
            classes={classes}
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
            rowCount={rows.length}
          />
          <TableBody>
            {stableSort(rows, getComparator(order, orderBy))
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                      hover
                      onClick={event => {
                        event.stopPropagation();
                        handleClickOpen(event, row);
                      }}
                      key={row.date}
                    >
                      <TableCell component="th" id={labelId} scope="row" padding="none">
                        {row.date}
                      </TableCell>
                      <TableCell align="right">{row.subject}</TableCell>
                      <TableCell align="right">{row.description}</TableCell>
                      <TableCell>
                        <ViewNote
                          selectedValue={selectedValue}
                          open={open}
                          onClose={handleClose} />
                      </TableCell>
                    </TableRow>
                );
              })}
            {emptyRows > 0 && (
              <TableRow style={{ height: emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[rowsPerPage]}
        page={page}
        onChangePage={handleChangePage}
      />
    </div>
  );
}
