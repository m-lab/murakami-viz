// base imports
import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { lighten, makeStyles, useTheme } from '@material-ui/core/styles';
import Moment from 'react-moment';
import Truncate from 'react-truncate';

// material ui imports
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

// modules imports
import AddNote from '../utils/AddNote.jsx';
import EditNote from '../utils/EditNote.jsx';
import ViewNote from '../utils/ViewNote.jsx';

function createData(id, date, subject, description) {
  return { id, date, subject, description };
}

const rows = [
  createData(1, '2020-03-02T15:58', 'Printer Connection Issue', 'Hi omnes lingua, institutis, legibus inter se differunt. Unam incolunt Belgae, aliam Aquitani, tertiam. Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua.'),
  createData(2, '2020-03-08T18:31', 'Lorem Ipsum', 'Hi omnes lingua, institutis, legibus inter se differunt. Unam incolunt Belgae, aliam Aquitani, tertiam. Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua.'),
  createData(3, '2020-04-27T16:12', 'Lorem Ipsum', 'Hi omnes lingua, institutis, legibus inter se differunt. Unam incolunt Belgae, aliam Aquitani, tertiam. Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua.'),
  createData(4, '2020-04-13T12:38', 'Lorem Ipsum', 'Hi omnes lingua, institutis, legibus inter se differunt. Unam incolunt Belgae, aliam Aquitani, tertiam. Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua.'),
  createData(5, '2020-04-13T08:41', 'Lorem Ipsum', 'Hi omnes lingua, institutis, legibus inter se differunt. Unam incolunt Belgae, aliam Aquitani, tertiam. Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua.'),
  createData(6, '2020-04-02T18:21', 'Lorem Ipsum', 'Hi omnes lingua, institutis, legibus inter se differunt. Unam incolunt Belgae, aliam Aquitani, tertiam. Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua.'),
  createData(7, '2020-03-30T14:48', 'Lorem Ipsum', 'Hi omnes lingua, institutis, legibus inter se differunt. Unam incolunt Belgae, aliam Aquitani, tertiam. Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua.'),
  createData(8, '2020-03-26T10:32', 'Lorem Ipsum', 'Hi omnes lingua, institutis, legibus inter se differunt. Unam incolunt Belgae, aliam Aquitani, tertiam. Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua.'),
  createData(9, '2020-03-17T08:14', 'Lorem Ipsum', 'Hi omnes lingua, institutis, legibus inter se differunt. Unam incolunt Belgae, aliam Aquitani, tertiam. Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua.'),
  createData(10, '2020-03-12T19:12', 'Lorem Ipsum', 'Hi omnes lingua, institutis, legibus inter se differunt. Unam incolunt Belgae, aliam Aquitani, tertiam. Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua.'),
  createData(11, '2020-03-06T15:27', 'Lorem Ipsum', 'Hi omnes lingua, institutis, legibus inter se differunt. Unam incolunt Belgae, aliam Aquitani, tertiam. Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua.'),
  createData(12, '2020-03-01T12:01', 'Lorem Ipsum', 'Hi omnes lingua, institutis, legibus inter se differunt. Unam incolunt Belgae, aliam Aquitani, tertiam. Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua.'),
  createData(13, '2020-04-28T19:20', 'Lorem Ipsum', 'Hi omnes lingua, institutis, legibus inter se differunt. Unam incolunt Belgae, aliam Aquitani, tertiam. Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua.'),
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
          <Button variant="contained" disableElevation color="primary" onClick={handleClickOpen}>
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
  const [row, setRow] = React.useState({index: 0});
  const [selectedValue, setSelectedValue] = React.useState();

  const handleClickOpen = (row) => {
    setOpen(true);
    setRow(row);
  };

  const handleClose = (value) => {
    setOpen(false);
  };

  // fetch api data
  const [error, setError] = React.useState(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [notes, setNotes] = React.useState([]);

  React.useEffect(() => {
    fetch("/api/v1/notes")
      .then(res => res.json())
      // .then(res => res.text())          // convert to plain text
      // .then(text => console.log(text))  // then log it out
      .then(
        (result) => {
          setIsLoaded(true);
          setNotes(result);
          console.log('result: ', result);
        },
        (error) => {
          setIsLoaded(true);
          setError(error);
        }
      )
  }, [])

  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!isLoaded) {
    return <div>Loading...</div>;
  } else {
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
                  const labelId = `data-row-${index}`;
                  row.index = index;


                  return (
                    <TableRow
                        hover
                        onClick={() => {handleClickOpen(row);}}
                        key={row.date}
                      >
                        <TableCell component="th" id={labelId} scope="row" padding="none">
                          <Moment date={row.date} format="MMMM D, YYYY, h:ma" />
                        </TableCell>
                        <TableCell>{row.subject}</TableCell>
                        <TableCell>
                          <Truncate lines={1} width={300}>
                            {row.description}
                          </Truncate>
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
        <ViewNote
          row={row}
          rows={stableSort(rows, getComparator(order, orderBy))}
          open={open}
          onClose={handleClose} />
      </div>
    );
  }
}
