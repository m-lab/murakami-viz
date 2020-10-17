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
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

// icon imports
import ClearIcon from '@material-ui/icons/Clear';

const useStyles = makeStyles(() => ({
  appBar: {
    backgroundColor: '#fff',
    borderBottom: '1px solid rgba(0, 0, 0, 0.54)',
    boxShadow: 'none',
  },
  cancelButton: {},
  closeButton: {
    marginTop: '15px',
    position: 'absolute',
    right: '0',
    top: '0',
  },
  day: {
    width: '60px',
  },
  dialog: {
    position: 'relative',
  },
  dialogTitleRoot: {
    // marginTop: "30px",
  },
  dialogTitleText: {
    fontSize: '2.25rem',
    textAlign: 'center',
  },
  form: {
    padding: '50px',
  },
  formControl: {
    width: '100%',
  },
  formControlHours: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  formField: {
    marginBottom: '30px',
  },
  formFieldHours: {
    margin: '0 30px',
    width: '115px',
  },
  grid: {
    // marginLeft: "",
    marginTop: '50px',
  },
  gridItem: {
    marginLeft: '30px',
  },
  hours: {
    marginTop: '20px',
  },
  inline: {
    marginLeft: '20px',
  },
  saveButton: {
    marginBottom: '0',
  },
  saveButtonContainer: {
    marginLeft: 'auto',
    marginRight: 'auto',
    textAlign: 'center',
  },
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography component="div">{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `edit-library-tab-${index}`,
    'aria-controls': `edit-library-tabpanel-${index}`,
  };
}

const useForm = (callback, validated, network) => {
  let fullInputs;
  const [inputs, setInputs] = React.useState({});
  const handleSubmit = event => {
    if (event) {
      event.preventDefault();
    }
    delete fullInputs.created_at;
    delete fullInputs.updated_at;
    delete fullInputs.lid;
    delete fullInputs.nid;
    if (validated(fullInputs)) {
      callback(fullInputs);
      setInputs({});
    }
  };
  const handleInputChange = event => {
    event.persist();
    setInputs(inputs => ({
      ...inputs,
      [event.target.name]: event.target.value.trim(),
    }));
  };

  React.useEffect(() => {
    if (network && inputs) {
      fullInputs = Object.assign({}, network, inputs);
    }
  }, [inputs, fullInputs]);

  return {
    handleSubmit,
    handleInputChange,
    inputs,
  };
};

export default function EditLibrary(props) {
  const classes = useStyles();
  const { onClose, onLibraryUpdate, open, row } = props;
  const [errors, setErrors] = React.useState({});
  const [helperText, setHelperText] = React.useState({
    name: '',
  });

  // handle form validation
  const validateInputs = inputs => {
    setErrors({});
    setHelperText({});
    if (_.isEmpty(inputs)) {
      if (_.isEmpty(row)) {
        setErrors(errors => ({
          ...errors,
          name: true,
          primary_contact_email: true,
        }));
        setHelperText(helperText => ({
          ...helperText,
          name: 'This field is required.',
          primary_contact_email: 'This field is required.',
        }));
        return false;
      } else {
        alert('No changes have been made.');
        return false;
      }
    } else {
      if (!inputs.name || !inputs.primary_contact_email) {
        if ((!inputs.name || inputs.name.length < 1) && !row.name) {
          setErrors(errors => ({
            ...errors,
            name: true,
          }));
          setHelperText(helperText => ({
            ...helperText,
            name: 'This field is required.',
          }));
        }
        if (
          (!validateEmail(inputs.primary_contact_email) ||
            inputs.primary_contact_email.length < 1) &&
          !validateEmail(row.primary_contact_email)
        ) {
          setErrors(errors => ({
            ...errors,
            primary_contact_email: true,
          }));
          setHelperText(helperText => ({
            ...helperText,
            primary_contact_email: 'Please enter a valid email address.',
          }));
          return false;
        }
        return true;
      } else {
        return true;
      }
    }
  };

  const validateEmail = email => {
    const re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return re.test(String(email).toLowerCase());
  };

  // handle tabs
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // handle close
  const handleClose = () => {
    onClose();
  };

  const submitData = inputs => {
    for (let key in inputs) {
      if (
        inputs[key] === null ||
        inputs[key] === undefined ||
        key === 'created_at' ||
        key === 'updated_at'
      )
        delete inputs[key];
    }

    const { id, ...data } = inputs;
    fetch(`api/v1/libraries/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: data }),
    })
      .then(response => {
        if (response.status === 201 || response.status === 204) {
          onLibraryUpdate(inputs);
          console.log('***Inputs: ', inputs);
          alert(`Library edited successfully.`);
          onClose(inputs);
          return;
        } else {
          processError(response.json());
          throw new Error(`Error in response from server.`);
        }
      })
      .catch(error => {
        alert(
          `An error occurred. Please try again or contact an administrator. ${
            error.name
          }: ${error.message}`,
        );
      });

    onClose();
  };

  const processError = res => {
    let errorString;
    if (res.statusCode && res.error && res.message) {
      errorString = `HTTP ${res.statusCode} ${res.error}: ${res.message}`;
    } else if (res.statusCode && res.status) {
      errorString = `HTTP ${res.statusCode}: ${res.status}`;
    } else if (res) {
      errorString = res;
    } else {
      errorString = 'Error in response from server.';
    }
    return errorString;
  };

  const { inputs, handleInputChange, handleSubmit } = useForm(
    submitData,
    validateInputs,
    row,
  );

  React.useEffect(() => {}, [row, errors, helperText]);

  return (
    <Dialog
      onClose={handleClose}
      modal="true"
      open={open}
      aria-labelledby="add-library-title"
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
      <Grid
        container
        alignItems="center"
        justify="flex-start"
        className={classes.grid}
      >
        <Grid item className={classes.gridItem}>
          <DialogTitle
            id="add-library-title"
            className={classes.dialogTitleRoot}
          >
            <div className={classes.dialogTitleText}>Edit Library</div>
          </DialogTitle>
        </Grid>
        <Grid item className={classes.gridItem}>
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
        <Grid item className={classes.gridItem}>
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
      </Grid>
      <Box m={4}>
        <Typography variant="overline" display="block" gutterbottom>
          Library Details
        </Typography>
        <FormControl variant="outlined" className={classes.formControl}>
          <InputLabel id="library-system-name">
            Library System Name (if applicable)
          </InputLabel>
          <Select
            labelId="library-system-name"
            className={classes.formField}
            id="library-system-name"
            label="Library System Name (if applicable)"
            name="library_system_name"
            defaultValue=""
            // onChange={handleInputChange}
            value={``}
            disabled
          >
            <MenuItem value="" selected />
          </Select>
        </FormControl>
        <TextField
          error={errors && errors.name}
          helperText={helperText.name}
          className={classes.formField}
          id="library-name"
          label="Library Name"
          name="name"
          fullWidth
          variant="outlined"
          defaultValue={row ? row.name : inputs.name}
          onChange={handleInputChange}
        />
        <TextField
          className={classes.formField}
          id="library-physical-address"
          label="Physical Address"
          name="physical_address"
          fullWidth
          variant="outlined"
          defaultValue={row ? row.physical_address : inputs.physical_address}
          onChange={handleInputChange}
        />
        <TextField
          className={classes.formField}
          id="library-shipping-address"
          label="Shipping Address"
          name="shipping_address"
          fullWidth
          variant="outlined"
          onChange={handleInputChange}
          defaultValue={row ? row.shipping_address : inputs.shipping_address}
        />
        <FormControl variant="outlined" className={classes.formControl}>
          <InputLabel id="library-timezone">Timezone</InputLabel>
          <Select
            className={classes.formField}
            labelId="library-timezone"
            id="library-timezone"
            label="Timezone"
            name="timezone"
            fullWidth
            variant="outlined"
            onChange={handleInputChange}
            defaultValue={row ? row.timezone : inputs.timezone}
          >
            <MenuItem value="Africa/Abidjan">Africa/Abidjan</MenuItem>
            <MenuItem value="Africa/Accra">Africa/Accra</MenuItem>
            <MenuItem value="Africa/Algiers">Africa/Algiers</MenuItem>
            <MenuItem value="Africa/Bissau">Africa/Bissau</MenuItem>
            <MenuItem value="Africa/Cairo">Africa/Cairo</MenuItem>
            <MenuItem value="Africa/Casablanca">Africa/Casablanca</MenuItem>
            <MenuItem value="Africa/Ceuta">Africa/Ceuta</MenuItem>
            <MenuItem value="Africa/El_Aaiun">Africa/El_Aaiun</MenuItem>
            <MenuItem value="Africa/Johannesburg">Africa/Johannesburg</MenuItem>
            <MenuItem value="Africa/Juba">Africa/Juba</MenuItem>
            <MenuItem value="Africa/Khartoum">Africa/Khartoum</MenuItem>
            <MenuItem value="Africa/Lagos">Africa/Lagos</MenuItem>
            <MenuItem value="Africa/Maputo">Africa/Maputo</MenuItem>
            <MenuItem value="Africa/Monrovia">Africa/Monrovia</MenuItem>
            <MenuItem value="Africa/Nairobi">Africa/Nairobi</MenuItem>
            <MenuItem value="Africa/Ndjamena">Africa/Ndjamena</MenuItem>
            <MenuItem value="Africa/Sao_Tome">Africa/Sao_Tome</MenuItem>
            <MenuItem value="Africa/Tripoli">Africa/Tripoli</MenuItem>
            <MenuItem value="Africa/Tunis">Africa/Tunis</MenuItem>
            <MenuItem value="Africa/Windhoek">Africa/Windhoek</MenuItem>
            <MenuItem value="America/Adak">America/Adak</MenuItem>
            <MenuItem value="America/Anchorage">America/Anchorage</MenuItem>
            <MenuItem value="America/Araguaina">America/Araguaina</MenuItem>
            <MenuItem value="America/Argentina/Buenos_Aires">
              America/Argentina/Buenos_Aires
            </MenuItem>
            <MenuItem value="America/Argentina/Catamarca">
              America/Argentina/Catamarca
            </MenuItem>
            <MenuItem value="America/Argentina/Cordoba">
              America/Argentina/Cordoba
            </MenuItem>
            <MenuItem value="America/Argentina/Jujuy">
              America/Argentina/Jujuy
            </MenuItem>
            <MenuItem value="America/Argentina/La_Rioja">
              America/Argentina/La_Rioja
            </MenuItem>
            <MenuItem value="America/Argentina/Mendoza">
              America/Argentina/Mendoza
            </MenuItem>
            <MenuItem value="America/Argentina/Rio_Gallegos">
              America/Argentina/Rio_Gallegos
            </MenuItem>
            <MenuItem value="America/Argentina/Salta">
              America/Argentina/Salta
            </MenuItem>
            <MenuItem value="America/Argentina/San_Juan">
              America/Argentina/San_Juan
            </MenuItem>
            <MenuItem value="America/Argentina/San_Luis">
              America/Argentina/San_Luis
            </MenuItem>
            <MenuItem value="America/Argentina/Tucuman">
              America/Argentina/Tucuman
            </MenuItem>
            <MenuItem value="America/Argentina/Ushuaia">
              America/Argentina/Ushuaia
            </MenuItem>
            <MenuItem value="America/Asuncion">America/Asuncion</MenuItem>
            <MenuItem value="America/Atikokan">America/Atikokan</MenuItem>
            <MenuItem value="America/Bahia">America/Bahia</MenuItem>
            <MenuItem value="America/Bahia_Banderas">
              America/Bahia_Banderas
            </MenuItem>
            <MenuItem value="America/Barbados">America/Barbados</MenuItem>
            <MenuItem value="America/Belem">America/Belem</MenuItem>
            <MenuItem value="America/Belize">America/Belize</MenuItem>
            <MenuItem value="America/Blanc-Sablon">
              America/Blanc-Sablon
            </MenuItem>
            <MenuItem value="America/Boa_Vista">America/Boa_Vista</MenuItem>
            <MenuItem value="America/Bogota">America/Bogota</MenuItem>
            <MenuItem value="America/Boise">America/Boise</MenuItem>
            <MenuItem value="America/Cambridge_Bay">
              America/Cambridge_Bay
            </MenuItem>
            <MenuItem value="America/Campo_Grande">
              America/Campo_Grande
            </MenuItem>
            <MenuItem value="America/Cancun">America/Cancun</MenuItem>
            <MenuItem value="America/Caracas">America/Caracas</MenuItem>
            <MenuItem value="America/Cayenne">America/Cayenne</MenuItem>
            <MenuItem value="America/Chicago">America/Chicago</MenuItem>
            <MenuItem value="America/Chihuahua">America/Chihuahua</MenuItem>
            <MenuItem value="America/Costa_Rica">America/Costa_Rica</MenuItem>
            <MenuItem value="America/Creston">America/Creston</MenuItem>
            <MenuItem value="America/Cuiaba">America/Cuiaba</MenuItem>
            <MenuItem value="America/Curacao">America/Curacao</MenuItem>
            <MenuItem value="America/Danmarkshavn">
              America/Danmarkshavn
            </MenuItem>
            <MenuItem value="America/Dawson">America/Dawson</MenuItem>
            <MenuItem value="America/Dawson_Creek">
              America/Dawson_Creek
            </MenuItem>
            <MenuItem value="America/Denver">America/Denver</MenuItem>
            <MenuItem value="America/Detroit">America/Detroit</MenuItem>
            <MenuItem value="America/Edmonton">America/Edmonton</MenuItem>
            <MenuItem value="America/Eirunepe">America/Eirunepe</MenuItem>
            <MenuItem value="America/El_Salvador">America/El_Salvador</MenuItem>
            <MenuItem value="America/Fort_Nelson">America/Fort_Nelson</MenuItem>
            <MenuItem value="America/Fortaleza">America/Fortaleza</MenuItem>
            <MenuItem value="America/Glace_Bay">America/Glace_Bay</MenuItem>
            <MenuItem value="America/Goose_Bay">America/Goose_Bay</MenuItem>
            <MenuItem value="America/Grand_Turk">America/Grand_Turk</MenuItem>
            <MenuItem value="America/Guatemala">America/Guatemala</MenuItem>
            <MenuItem value="America/Guayaquil">America/Guayaquil</MenuItem>
            <MenuItem value="America/Guyana">America/Guyana</MenuItem>
            <MenuItem value="America/Halifax">America/Halifax</MenuItem>
            <MenuItem value="America/Havana">America/Havana</MenuItem>
            <MenuItem value="America/Hermosillo">America/Hermosillo</MenuItem>
            <MenuItem value="America/Indiana/Indianapolis">
              America/Indiana/Indianapolis
            </MenuItem>
            <MenuItem value="America/Indiana/Knox">
              America/Indiana/Knox
            </MenuItem>
            <MenuItem value="America/Indiana/Marengo">
              America/Indiana/Marengo
            </MenuItem>
            <MenuItem value="America/Indiana/Petersburg">
              America/Indiana/Petersburg
            </MenuItem>
            <MenuItem value="America/Indiana/Tell_City">
              America/Indiana/Tell_City
            </MenuItem>
            <MenuItem value="America/Indiana/Vevay">
              America/Indiana/Vevay
            </MenuItem>
            <MenuItem value="America/Indiana/Vincennes">
              America/Indiana/Vincennes
            </MenuItem>
            <MenuItem value="America/Indiana/Winamac">
              America/Indiana/Winamac
            </MenuItem>
            <MenuItem value="America/Inuvik">America/Inuvik</MenuItem>
            <MenuItem value="America/Iqaluit">America/Iqaluit</MenuItem>
            <MenuItem value="America/Jamaica">America/Jamaica</MenuItem>
            <MenuItem value="America/Juneau">America/Juneau</MenuItem>
            <MenuItem value="America/Kentucky/Louisville">
              America/Kentucky/Louisville
            </MenuItem>
            <MenuItem value="America/Kentucky/Monticello">
              America/Kentucky/Monticello
            </MenuItem>
            <MenuItem value="America/La_Paz">America/La_Paz</MenuItem>
            <MenuItem value="America/Lima">America/Lima</MenuItem>
            <MenuItem value="America/Los_Angeles">America/Los_Angeles</MenuItem>
            <MenuItem value="America/Maceio">America/Maceio</MenuItem>
            <MenuItem value="America/Managua">America/Managua</MenuItem>
            <MenuItem value="America/Manaus">America/Manaus</MenuItem>
            <MenuItem value="America/Martinique">America/Martinique</MenuItem>
            <MenuItem value="America/Matamoros">America/Matamoros</MenuItem>
            <MenuItem value="America/Mazatlan">America/Mazatlan</MenuItem>
            <MenuItem value="America/Menominee">America/Menominee</MenuItem>
            <MenuItem value="America/Merida">America/Merida</MenuItem>
            <MenuItem value="America/Metlakatla">America/Metlakatla</MenuItem>
            <MenuItem value="America/Mexico_City">America/Mexico_City</MenuItem>
            <MenuItem value="America/Miquelon">America/Miquelon</MenuItem>
            <MenuItem value="America/Moncton">America/Moncton</MenuItem>
            <MenuItem value="America/Monterrey">America/Monterrey</MenuItem>
            <MenuItem value="America/Montevideo">America/Montevideo</MenuItem>
            <MenuItem value="America/Nassau">America/Nassau</MenuItem>
            <MenuItem value="America/New_York">America/New_York</MenuItem>
            <MenuItem value="America/Nipigon">America/Nipigon</MenuItem>
            <MenuItem value="America/Nome">America/Nome</MenuItem>
            <MenuItem value="America/Noronha">America/Noronha</MenuItem>
            <MenuItem value="America/North_Dakota/Beulah">
              America/North_Dakota/Beulah
            </MenuItem>
            <MenuItem value="America/North_Dakota/Center">
              America/North_Dakota/Center
            </MenuItem>
            <MenuItem value="America/North_Dakota/New_Salem">
              America/North_Dakota/New_Salem
            </MenuItem>
            <MenuItem value="America/Nuuk">America/Nuuk</MenuItem>
            <MenuItem value="America/Ojinaga">America/Ojinaga</MenuItem>
            <MenuItem value="America/Panama">America/Panama</MenuItem>
            <MenuItem value="America/Pangnirtung">America/Pangnirtung</MenuItem>
            <MenuItem value="America/Paramaribo">America/Paramaribo</MenuItem>
            <MenuItem value="America/Phoenix">America/Phoenix</MenuItem>
            <MenuItem value="America/Port-au-Prince">
              America/Port-au-Prince
            </MenuItem>
            <MenuItem value="America/Port_of_Spain">
              America/Port_of_Spain
            </MenuItem>
            <MenuItem value="America/Porto_Velho">America/Porto_Velho</MenuItem>
            <MenuItem value="America/Puerto_Rico">America/Puerto_Rico</MenuItem>
            <MenuItem value="America/Punta_Arenas">
              America/Punta_Arenas
            </MenuItem>
            <MenuItem value="America/Rainy_River">America/Rainy_River</MenuItem>
            <MenuItem value="America/Rankin_Inlet">
              America/Rankin_Inlet
            </MenuItem>
            <MenuItem value="America/Recife">America/Recife</MenuItem>
            <MenuItem value="America/Regina">America/Regina</MenuItem>
            <MenuItem value="America/Resolute">America/Resolute</MenuItem>
            <MenuItem value="America/Rio_Branco">America/Rio_Branco</MenuItem>
            <MenuItem value="America/Santarem">America/Santarem</MenuItem>
            <MenuItem value="America/Santiago">America/Santiago</MenuItem>
            <MenuItem value="America/Santo_Domingo">
              America/Santo_Domingo
            </MenuItem>
            <MenuItem value="America/Sao_Paulo">America/Sao_Paulo</MenuItem>
            <MenuItem value="America/Scoresbysund">
              America/Scoresbysund
            </MenuItem>
            <MenuItem value="America/Sitka">America/Sitka</MenuItem>
            <MenuItem value="America/St_Johns">America/St_Johns</MenuItem>
            <MenuItem value="America/Swift_Current">
              America/Swift_Current
            </MenuItem>
            <MenuItem value="America/Tegucigalpa">America/Tegucigalpa</MenuItem>
            <MenuItem value="America/Thule">America/Thule</MenuItem>
            <MenuItem value="America/Thunder_Bay">America/Thunder_Bay</MenuItem>
            <MenuItem value="America/Tijuana">America/Tijuana</MenuItem>
            <MenuItem value="America/Toronto">America/Toronto</MenuItem>
            <MenuItem value="America/Vancouver">America/Vancouver</MenuItem>
            <MenuItem value="America/Whitehorse">America/Whitehorse</MenuItem>
            <MenuItem value="America/Winnipeg">America/Winnipeg</MenuItem>
            <MenuItem value="America/Yakutat">America/Yakutat</MenuItem>
            <MenuItem value="America/Yellowknife">America/Yellowknife</MenuItem>
            <MenuItem value="Antarctica/Casey">Antarctica/Casey</MenuItem>
            <MenuItem value="Antarctica/Davis">Antarctica/Davis</MenuItem>
            <MenuItem value="Antarctica/DumontDUrville">
              Antarctica/DumontDUrville
            </MenuItem>
            <MenuItem value="Antarctica/Macquarie">
              Antarctica/Macquarie
            </MenuItem>
            <MenuItem value="Antarctica/Mawson">Antarctica/Mawson</MenuItem>
            <MenuItem value="Antarctica/Palmer">Antarctica/Palmer</MenuItem>
            <MenuItem value="Antarctica/Rothera">Antarctica/Rothera</MenuItem>
            <MenuItem value="Antarctica/Syowa">Antarctica/Syowa</MenuItem>
            <MenuItem value="Antarctica/Troll">Antarctica/Troll</MenuItem>
            <MenuItem value="Antarctica/Vostok">Antarctica/Vostok</MenuItem>
            <MenuItem value="Asia/Almaty">Asia/Almaty</MenuItem>
            <MenuItem value="Asia/Amman">Asia/Amman</MenuItem>
            <MenuItem value="Asia/Anadyr">Asia/Anadyr</MenuItem>
            <MenuItem value="Asia/Aqtau">Asia/Aqtau</MenuItem>
            <MenuItem value="Asia/Aqtobe">Asia/Aqtobe</MenuItem>
            <MenuItem value="Asia/Ashgabat">Asia/Ashgabat</MenuItem>
            <MenuItem value="Asia/Atyrau">Asia/Atyrau</MenuItem>
            <MenuItem value="Asia/Baghdad">Asia/Baghdad</MenuItem>
            <MenuItem value="Asia/Baku">Asia/Baku</MenuItem>
            <MenuItem value="Asia/Bangkok">Asia/Bangkok</MenuItem>
            <MenuItem value="Asia/Barnaul">Asia/Barnaul</MenuItem>
            <MenuItem value="Asia/Beirut">Asia/Beirut</MenuItem>
            <MenuItem value="Asia/Bishkek">Asia/Bishkek</MenuItem>
            <MenuItem value="Asia/Brunei">Asia/Brunei</MenuItem>
            <MenuItem value="Asia/Chita">Asia/Chita</MenuItem>
            <MenuItem value="Asia/Choibalsan">Asia/Choibalsan</MenuItem>
            <MenuItem value="Asia/Colombo">Asia/Colombo</MenuItem>
            <MenuItem value="Asia/Damascus">Asia/Damascus</MenuItem>
            <MenuItem value="Asia/Dhaka">Asia/Dhaka</MenuItem>
            <MenuItem value="Asia/Dili">Asia/Dili</MenuItem>
            <MenuItem value="Asia/Dubai">Asia/Dubai</MenuItem>
            <MenuItem value="Asia/Dushanbe">Asia/Dushanbe</MenuItem>
            <MenuItem value="Asia/Famagusta">Asia/Famagusta</MenuItem>
            <MenuItem value="Asia/Gaza">Asia/Gaza</MenuItem>
            <MenuItem value="Asia/Hebron">Asia/Hebron</MenuItem>
            <MenuItem value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</MenuItem>
            <MenuItem value="Asia/Hong_Kong">Asia/Hong_Kong</MenuItem>
            <MenuItem value="Asia/Hovd">Asia/Hovd</MenuItem>
            <MenuItem value="Asia/Irkutsk">Asia/Irkutsk</MenuItem>
            <MenuItem value="Asia/Jakarta">Asia/Jakarta</MenuItem>
            <MenuItem value="Asia/Jayapura">Asia/Jayapura</MenuItem>
            <MenuItem value="Asia/Jerusalem">Asia/Jerusalem</MenuItem>
            <MenuItem value="Asia/Kabul">Asia/Kabul</MenuItem>
            <MenuItem value="Asia/Kamchatka">Asia/Kamchatka</MenuItem>
            <MenuItem value="Asia/Karachi">Asia/Karachi</MenuItem>
            <MenuItem value="Asia/Kathmandu">Asia/Kathmandu</MenuItem>
            <MenuItem value="Asia/Khandyga">Asia/Khandyga</MenuItem>
            <MenuItem value="Asia/Kolkata">Asia/Kolkata</MenuItem>
            <MenuItem value="Asia/Krasnoyarsk">Asia/Krasnoyarsk</MenuItem>
            <MenuItem value="Asia/Kuala_Lumpur">Asia/Kuala_Lumpur</MenuItem>
            <MenuItem value="Asia/Kuching">Asia/Kuching</MenuItem>
            <MenuItem value="Asia/Macau">Asia/Macau</MenuItem>
            <MenuItem value="Asia/Magadan">Asia/Magadan</MenuItem>
            <MenuItem value="Asia/Makassar">Asia/Makassar</MenuItem>
            <MenuItem value="Asia/Manila">Asia/Manila</MenuItem>
            <MenuItem value="Asia/Nicosia">Asia/Nicosia</MenuItem>
            <MenuItem value="Asia/Novokuznetsk">Asia/Novokuznetsk</MenuItem>
            <MenuItem value="Asia/Novosibirsk">Asia/Novosibirsk</MenuItem>
            <MenuItem value="Asia/Omsk">Asia/Omsk</MenuItem>
            <MenuItem value="Asia/Oral">Asia/Oral</MenuItem>
            <MenuItem value="Asia/Pontianak">Asia/Pontianak</MenuItem>
            <MenuItem value="Asia/Pyongyang">Asia/Pyongyang</MenuItem>
            <MenuItem value="Asia/Qatar">Asia/Qatar</MenuItem>
            <MenuItem value="Asia/Qostanay">Asia/Qostanay</MenuItem>
            <MenuItem value="Asia/Qyzylorda">Asia/Qyzylorda</MenuItem>
            <MenuItem value="Asia/Riyadh">Asia/Riyadh</MenuItem>
            <MenuItem value="Asia/Sakhalin">Asia/Sakhalin</MenuItem>
            <MenuItem value="Asia/Samarkand">Asia/Samarkand</MenuItem>
            <MenuItem value="Asia/Seoul">Asia/Seoul</MenuItem>
            <MenuItem value="Asia/Shanghai">Asia/Shanghai</MenuItem>
            <MenuItem value="Asia/Singapore">Asia/Singapore</MenuItem>
            <MenuItem value="Asia/Srednekolymsk">Asia/Srednekolymsk</MenuItem>
            <MenuItem value="Asia/Taipei">Asia/Taipei</MenuItem>
            <MenuItem value="Asia/Tashkent">Asia/Tashkent</MenuItem>
            <MenuItem value="Asia/Tbilisi">Asia/Tbilisi</MenuItem>
            <MenuItem value="Asia/Tehran">Asia/Tehran</MenuItem>
            <MenuItem value="Asia/Thimphu">Asia/Thimphu</MenuItem>
            <MenuItem value="Asia/Tokyo">Asia/Tokyo</MenuItem>
            <MenuItem value="Asia/Tomsk">Asia/Tomsk</MenuItem>
            <MenuItem value="Asia/Ulaanbaatar">Asia/Ulaanbaatar</MenuItem>
            <MenuItem value="Asia/Urumqi">Asia/Urumqi</MenuItem>
            <MenuItem value="Asia/Ust-Nera">Asia/Ust-Nera</MenuItem>
            <MenuItem value="Asia/Vladivostok">Asia/Vladivostok</MenuItem>
            <MenuItem value="Asia/Yakutsk">Asia/Yakutsk</MenuItem>
            <MenuItem value="Asia/Yangon">Asia/Yangon</MenuItem>
            <MenuItem value="Asia/Yekaterinburg">Asia/Yekaterinburg</MenuItem>
            <MenuItem value="Asia/Yerevan">Asia/Yerevan</MenuItem>
            <MenuItem value="Atlantic/Azores">Atlantic/Azores</MenuItem>
            <MenuItem value="Atlantic/Bermuda">Atlantic/Bermuda</MenuItem>
            <MenuItem value="Atlantic/Canary">Atlantic/Canary</MenuItem>
            <MenuItem value="Atlantic/Cape_Verde">Atlantic/Cape_Verde</MenuItem>
            <MenuItem value="Atlantic/Faroe">Atlantic/Faroe</MenuItem>
            <MenuItem value="Atlantic/Madeira">Atlantic/Madeira</MenuItem>
            <MenuItem value="Atlantic/Reykjavik">Atlantic/Reykjavik</MenuItem>
            <MenuItem value="Atlantic/South_Georgia">
              Atlantic/South_Georgia
            </MenuItem>
            <MenuItem value="Atlantic/Stanley">Atlantic/Stanley</MenuItem>
            <MenuItem value="Australia/Adelaide">Australia/Adelaide</MenuItem>
            <MenuItem value="Australia/Brisbane">Australia/Brisbane</MenuItem>
            <MenuItem value="Australia/Broken_Hill">
              Australia/Broken_Hill
            </MenuItem>
            <MenuItem value="Australia/Currie">Australia/Currie</MenuItem>
            <MenuItem value="Australia/Darwin">Australia/Darwin</MenuItem>
            <MenuItem value="Australia/Eucla">Australia/Eucla</MenuItem>
            <MenuItem value="Australia/Hobart">Australia/Hobart</MenuItem>
            <MenuItem value="Australia/Lindeman">Australia/Lindeman</MenuItem>
            <MenuItem value="Australia/Lord_Howe">Australia/Lord_Howe</MenuItem>
            <MenuItem value="Australia/Melbourne">Australia/Melbourne</MenuItem>
            <MenuItem value="Australia/Perth">Australia/Perth</MenuItem>
            <MenuItem value="Australia/Sydney">Australia/Sydney</MenuItem>
            <MenuItem value="Europe/Amsterdam">Europe/Amsterdam</MenuItem>
            <MenuItem value="Europe/Andorra">Europe/Andorra</MenuItem>
            <MenuItem value="Europe/Astrakhan">Europe/Astrakhan</MenuItem>
            <MenuItem value="Europe/Athens">Europe/Athens</MenuItem>
            <MenuItem value="Europe/Belgrade">Europe/Belgrade</MenuItem>
            <MenuItem value="Europe/Berlin">Europe/Berlin</MenuItem>
            <MenuItem value="Europe/Brussels">Europe/Brussels</MenuItem>
            <MenuItem value="Europe/Bucharest">Europe/Bucharest</MenuItem>
            <MenuItem value="Europe/Budapest">Europe/Budapest</MenuItem>
            <MenuItem value="Europe/Chisinau">Europe/Chisinau</MenuItem>
            <MenuItem value="Europe/Copenhagen">Europe/Copenhagen</MenuItem>
            <MenuItem value="Europe/Dublin">Europe/Dublin</MenuItem>
            <MenuItem value="Europe/Gibraltar">Europe/Gibraltar</MenuItem>
            <MenuItem value="Europe/Helsinki">Europe/Helsinki</MenuItem>
            <MenuItem value="Europe/Istanbul">Europe/Istanbul</MenuItem>
            <MenuItem value="Europe/Kaliningrad">Europe/Kaliningrad</MenuItem>
            <MenuItem value="Europe/Kiev">Europe/Kiev</MenuItem>
            <MenuItem value="Europe/Kirov">Europe/Kirov</MenuItem>
            <MenuItem value="Europe/Lisbon">Europe/Lisbon</MenuItem>
            <MenuItem value="Europe/London">Europe/London</MenuItem>
            <MenuItem value="Europe/Luxembourg">Europe/Luxembourg</MenuItem>
            <MenuItem value="Europe/Madrid">Europe/Madrid</MenuItem>
            <MenuItem value="Europe/Malta">Europe/Malta</MenuItem>
            <MenuItem value="Europe/Minsk">Europe/Minsk</MenuItem>
            <MenuItem value="Europe/Monaco">Europe/Monaco</MenuItem>
            <MenuItem value="Europe/Moscow">Europe/Moscow</MenuItem>
            <MenuItem value="Europe/Oslo">Europe/Oslo</MenuItem>
            <MenuItem value="Europe/Paris">Europe/Paris</MenuItem>
            <MenuItem value="Europe/Prague">Europe/Prague</MenuItem>
            <MenuItem value="Europe/Riga">Europe/Riga</MenuItem>
            <MenuItem value="Europe/Rome">Europe/Rome</MenuItem>
            <MenuItem value="Europe/Samara">Europe/Samara</MenuItem>
            <MenuItem value="Europe/Saratov">Europe/Saratov</MenuItem>
            <MenuItem value="Europe/Simferopol">Europe/Simferopol</MenuItem>
            <MenuItem value="Europe/Sofia">Europe/Sofia</MenuItem>
            <MenuItem value="Europe/Stockholm">Europe/Stockholm</MenuItem>
            <MenuItem value="Europe/Tallinn">Europe/Tallinn</MenuItem>
            <MenuItem value="Europe/Tirane">Europe/Tirane</MenuItem>
            <MenuItem value="Europe/Ulyanovsk">Europe/Ulyanovsk</MenuItem>
            <MenuItem value="Europe/Uzhgorod">Europe/Uzhgorod</MenuItem>
            <MenuItem value="Europe/Vienna">Europe/Vienna</MenuItem>
            <MenuItem value="Europe/Vilnius">Europe/Vilnius</MenuItem>
            <MenuItem value="Europe/Volgograd">Europe/Volgograd</MenuItem>
            <MenuItem value="Europe/Warsaw">Europe/Warsaw</MenuItem>
            <MenuItem value="Europe/Zaporozhye">Europe/Zaporozhye</MenuItem>
            <MenuItem value="Europe/Zurich">Europe/Zurich</MenuItem>
            <MenuItem value="Indian/Chagos">Indian/Chagos</MenuItem>
            <MenuItem value="Indian/Christmas">Indian/Christmas</MenuItem>
            <MenuItem value="Indian/Cocos">Indian/Cocos</MenuItem>
            <MenuItem value="Indian/Kerguelen">Indian/Kerguelen</MenuItem>
            <MenuItem value="Indian/Mahe">Indian/Mahe</MenuItem>
            <MenuItem value="Indian/Maldives">Indian/Maldives</MenuItem>
            <MenuItem value="Indian/Mauritius">Indian/Mauritius</MenuItem>
            <MenuItem value="Indian/Reunion">Indian/Reunion</MenuItem>
            <MenuItem value="Pacific/Apia">Pacific/Apia</MenuItem>
            <MenuItem value="Pacific/Auckland">Pacific/Auckland</MenuItem>
            <MenuItem value="Pacific/Bougainville">
              Pacific/Bougainville
            </MenuItem>
            <MenuItem value="Pacific/Chatham">Pacific/Chatham</MenuItem>
            <MenuItem value="Pacific/Chuuk">Pacific/Chuuk</MenuItem>
            <MenuItem value="Pacific/Easter">Pacific/Easter</MenuItem>
            <MenuItem value="Pacific/Efate">Pacific/Efate</MenuItem>
            <MenuItem value="Pacific/Enderbury">Pacific/Enderbury</MenuItem>
            <MenuItem value="Pacific/Fakaofo">Pacific/Fakaofo</MenuItem>
            <MenuItem value="Pacific/Fiji">Pacific/Fiji</MenuItem>
            <MenuItem value="Pacific/Funafuti">Pacific/Funafuti</MenuItem>
            <MenuItem value="Pacific/Galapagos">Pacific/Galapagos</MenuItem>
            <MenuItem value="Pacific/Gambier">Pacific/Gambier</MenuItem>
            <MenuItem value="Pacific/Guadalcanal">Pacific/Guadalcanal</MenuItem>
            <MenuItem value="Pacific/Guam">Pacific/Guam</MenuItem>
            <MenuItem value="Pacific/Honolulu">Pacific/Honolulu</MenuItem>
            <MenuItem value="Pacific/Kiritimati">Pacific/Kiritimati</MenuItem>
            <MenuItem value="Pacific/Kosrae">Pacific/Kosrae</MenuItem>
            <MenuItem value="Pacific/Kwajalein">Pacific/Kwajalein</MenuItem>
            <MenuItem value="Pacific/Majuro">Pacific/Majuro</MenuItem>
            <MenuItem value="Pacific/Marquesas">Pacific/Marquesas</MenuItem>
            <MenuItem value="Pacific/Nauru">Pacific/Nauru</MenuItem>
            <MenuItem value="Pacific/Niue">Pacific/Niue</MenuItem>
            <MenuItem value="Pacific/Norfolk">Pacific/Norfolk</MenuItem>
            <MenuItem value="Pacific/Noumea">Pacific/Noumea</MenuItem>
            <MenuItem value="Pacific/Pago_Pago">Pacific/Pago_Pago</MenuItem>
            <MenuItem value="Pacific/Palau">Pacific/Palau</MenuItem>
            <MenuItem value="Pacific/Pitcairn">Pacific/Pitcairn</MenuItem>
            <MenuItem value="Pacific/Pohnpei">Pacific/Pohnpei</MenuItem>
            <MenuItem value="Pacific/Port_Moresby">
              Pacific/Port_Moresby
            </MenuItem>
            <MenuItem value="Pacific/Rarotonga">Pacific/Rarotonga</MenuItem>
            <MenuItem value="Pacific/Tahiti">Pacific/Tahiti</MenuItem>
            <MenuItem value="Pacific/Tarawa">Pacific/Tarawa</MenuItem>
            <MenuItem value="Pacific/Tongatapu">Pacific/Tongatapu</MenuItem>
            <MenuItem value="Pacific/Wake">Pacific/Wake</MenuItem>
            <MenuItem value="Pacific/Wallis">Pacific/Wallis</MenuItem>
            <MenuItem value="UTC">UTC</MenuItem>
          </Select>
        </FormControl>
        <TextField
          className={classes.formField}
          id="library-coordinates"
          label="Coordinates"
          name="coordinates"
          fullWidth
          variant="outlined"
          onChange={handleInputChange}
          defaultValue={row ? row.coordinates : inputs.coordinates}
        />
        <Typography variant="overline" display="block" gutterbottom>
          Library Contact for MLBN Devices
        </Typography>
        <TextField
          className={classes.formField}
          id="library-primary-contact-name"
          label="Name"
          name="primary_contact_name"
          fullWidth
          variant="outlined"
          onChange={handleInputChange}
          defaultValue={
            row ? row.primary_contact_name : inputs.primary_contact_name
          }
        />
        <TextField
          error={errors.primary_contact_email}
          helperText={helperText.primary_contact_email}
          className={classes.formField}
          id="library-primary-contact-email"
          label="Email"
          name="primary_contact_email"
          fullWidth
          variant="outlined"
          onChange={handleInputChange}
          defaultValue={
            row ? row.primary_contact_email : inputs.primary_contact_email
          }
        />
        <Typography variant="overline" display="block" gutterbottom>
          Library Hours
        </Typography>
        <Box className={classes.hours}>
          <FormControl variant="outlined" className={classes.formControlHours}>
            <Typography
              className={classes.day}
              variant="body1"
              component="p"
              display="inline"
              gutterbottom
            >
              Sunday
            </Typography>
            <Hidden xsUp>
              <InputLabel id="sunday-open">Sunday open</InputLabel>
            </Hidden>
            <Select
              labelId="sunday-open"
              className={classes.formFieldHours}
              id="sunday-open"
              name="sunday_open"
              onChange={handleInputChange}
              defaultValue={row.sunday_open ? row.sunday_open : ``}
            >
              <MenuItem value="closed">
                <em>Closed</em>
              </MenuItem>
              <MenuItem value={'12:00 a.m.'}>12:00 a.m.</MenuItem>
              <MenuItem value={'12:30 a.m.'}>12:30 a.m.</MenuItem>
              <MenuItem value={'1:00 a.m.'}>1:00 a.m.</MenuItem>
              <MenuItem value={'1:30 a.m.'}>1:30 a.m.</MenuItem>
              <MenuItem value={'2:00 a.m.'}>2:00 a.m.</MenuItem>
              <MenuItem value={'2:30 a.m.'}>2:30 a.m.</MenuItem>
              <MenuItem value={'3:00 a.m.'}>3:00 a.m.</MenuItem>
              <MenuItem value={'3:30 a.m.'}>3:30 a.m.</MenuItem>
              <MenuItem value={'4:00 a.m.'}>4:00 a.m.</MenuItem>
              <MenuItem value={'4:30 a.m.'}>4:30 a.m.</MenuItem>
              <MenuItem value={'5:00 a.m.'}>5:00 a.m.</MenuItem>
              <MenuItem value={'5:30 a.m.'}>5:30 a.m.</MenuItem>
              <MenuItem value={'6:00 a.m.'}>6:00 a.m.</MenuItem>
              <MenuItem value={'6:30 a.m.'}>6:30 a.m.</MenuItem>
              <MenuItem value={'7:00 a.m.'}>7:00 a.m.</MenuItem>
              <MenuItem value={'7:30 a.m.'}>7:30 a.m.</MenuItem>
              <MenuItem value={'8:00 a.m.'}>8:00 a.m.</MenuItem>
              <MenuItem value={'8:30 a.m.'}>8:30 a.m.</MenuItem>
              <MenuItem value={'9:00 a.m.'}>9:00 a.m.</MenuItem>
              <MenuItem value={'9:30 a.m.'}>9:30 a.m.</MenuItem>
              <MenuItem value={'10:00 a.m.'}>10:00 a.m.</MenuItem>
              <MenuItem value={'10:30 a.m.'}>10:30 a.m.</MenuItem>
              <MenuItem value={'11:00 a.m.'}>11:00 a.m.</MenuItem>
              <MenuItem value={'11:30 a.m.'}>11:30 a.m.</MenuItem>
              <MenuItem value={'12:00 p.m.'}>12:00 p.m.</MenuItem>
              <MenuItem value={'12:30 p.m.'}>12:30 p.m.</MenuItem>
              <MenuItem value={'1:00 p.m.'}>1:00 p.m.</MenuItem>
              <MenuItem value={'1:30 p.m.'}>1:30 p.m.</MenuItem>
              <MenuItem value={'2:00 p.m.'}>2:00 p.m.</MenuItem>
              <MenuItem value={'2:30 p.m.'}>2:30 p.m.</MenuItem>
              <MenuItem value={'3:00 p.m.'}>3:00 p.m.</MenuItem>
              <MenuItem value={'3:30 p.m.'}>3:30 p.m.</MenuItem>
              <MenuItem value={'4:00 p.m.'}>4:00 p.m.</MenuItem>
              <MenuItem value={'4:30 p.m.'}>4:30 p.m.</MenuItem>
              <MenuItem value={'5:00 p.m.'}>5:00 p.m.</MenuItem>
              <MenuItem value={'5:30 p.m.'}>5:30 p.m.</MenuItem>
              <MenuItem value={'6:00 p.m.'}>6:00 p.m.</MenuItem>
              <MenuItem value={'6:30 p.m.'}>6:30 p.m.</MenuItem>
              <MenuItem value={'7:00 p.m.'}>7:00 p.m.</MenuItem>
              <MenuItem value={'7:30 p.m.'}>7:30 p.m.</MenuItem>
              <MenuItem value={'8:00 p.m.'}>8:00 p.m.</MenuItem>
              <MenuItem value={'8:30 p.m.'}>8:30 p.m.</MenuItem>
              <MenuItem value={'9:00 p.m.'}>9:00 p.m.</MenuItem>
              <MenuItem value={'9:30 p.m.'}>9:30 p.m.</MenuItem>
              <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
              <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
              <MenuItem value={'11:00 p.m.'}>11:00 p.m.</MenuItem>
              <MenuItem value={'11:30 p.m.'}>11:30 p.m.</MenuItem>
            </Select>
          </FormControl>
          <FormControl variant="outlined" className={classes.formControlHours}>
            <Typography
              variant="body1"
              component="p"
              display="inline"
              gutterbottom
            >
              to
            </Typography>
            <Hidden xsUp>
              <InputLabel id="sunday-close">Sunday close</InputLabel>
            </Hidden>
            <Select
              labelId="sunday-close"
              className={classes.formFieldHours}
              id="sunday-close"
              name="sunday_close"
              onChange={handleInputChange}
              defaultValue={row.sunday_close ? row.sunday_close : ``}
            >
              <MenuItem value="closed">
                <em>Closed</em>
              </MenuItem>
              <MenuItem value={'12:00 a.m.'}>12:00 a.m.</MenuItem>
              <MenuItem value={'12:30 a.m.'}>12:30 a.m.</MenuItem>
              <MenuItem value={'1:00 a.m.'}>1:00 a.m.</MenuItem>
              <MenuItem value={'1:30 a.m.'}>1:30 a.m.</MenuItem>
              <MenuItem value={'2:00 a.m.'}>2:00 a.m.</MenuItem>
              <MenuItem value={'2:30 a.m.'}>2:30 a.m.</MenuItem>
              <MenuItem value={'3:00 a.m.'}>3:00 a.m.</MenuItem>
              <MenuItem value={'3:30 a.m.'}>3:30 a.m.</MenuItem>
              <MenuItem value={'4:00 a.m.'}>4:00 a.m.</MenuItem>
              <MenuItem value={'4:30 a.m.'}>4:30 a.m.</MenuItem>
              <MenuItem value={'5:00 a.m.'}>5:00 a.m.</MenuItem>
              <MenuItem value={'5:30 a.m.'}>5:30 a.m.</MenuItem>
              <MenuItem value={'6:00 a.m.'}>6:00 a.m.</MenuItem>
              <MenuItem value={'6:30 a.m.'}>6:30 a.m.</MenuItem>
              <MenuItem value={'7:00 a.m.'}>7:00 a.m.</MenuItem>
              <MenuItem value={'7:30 a.m.'}>7:30 a.m.</MenuItem>
              <MenuItem value={'8:00 a.m.'}>8:00 a.m.</MenuItem>
              <MenuItem value={'8:30 a.m.'}>8:30 a.m.</MenuItem>
              <MenuItem value={'9:00 a.m.'}>9:00 a.m.</MenuItem>
              <MenuItem value={'9:30 a.m.'}>9:30 a.m.</MenuItem>
              <MenuItem value={'10:00 a.m.'}>10:00 a.m.</MenuItem>
              <MenuItem value={'10:30 a.m.'}>10:30 a.m.</MenuItem>
              <MenuItem value={'11:00 a.m.'}>11:00 a.m.</MenuItem>
              <MenuItem value={'11:30 a.m.'}>11:30 a.m.</MenuItem>
              <MenuItem value={'12:00 p.m.'}>12:00 p.m.</MenuItem>
              <MenuItem value={'12:30 p.m.'}>12:30 p.m.</MenuItem>
              <MenuItem value={'1:00 p.m.'}>1:00 p.m.</MenuItem>
              <MenuItem value={'1:30 p.m.'}>1:30 p.m.</MenuItem>
              <MenuItem value={'2:00 p.m.'}>2:00 p.m.</MenuItem>
              <MenuItem value={'2:30 p.m.'}>2:30 p.m.</MenuItem>
              <MenuItem value={'3:00 p.m.'}>3:00 p.m.</MenuItem>
              <MenuItem value={'3:30 p.m.'}>3:30 p.m.</MenuItem>
              <MenuItem value={'4:00 p.m.'}>4:00 p.m.</MenuItem>
              <MenuItem value={'4:30 p.m.'}>4:30 p.m.</MenuItem>
              <MenuItem value={'5:00 p.m.'}>5:00 p.m.</MenuItem>
              <MenuItem value={'5:30 p.m.'}>5:30 p.m.</MenuItem>
              <MenuItem value={'6:00 p.m.'}>6:00 p.m.</MenuItem>
              <MenuItem value={'6:30 p.m.'}>6:30 p.m.</MenuItem>
              <MenuItem value={'7:00 p.m.'}>7:00 p.m.</MenuItem>
              <MenuItem value={'7:30 p.m.'}>7:30 p.m.</MenuItem>
              <MenuItem value={'8:00 p.m.'}>8:00 p.m.</MenuItem>
              <MenuItem value={'8:30 p.m.'}>8:30 p.m.</MenuItem>
              <MenuItem value={'9:00 p.m.'}>9:00 p.m.</MenuItem>
              <MenuItem value={'9:30 p.m.'}>9:30 p.m.</MenuItem>
              <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
              <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
              <MenuItem value={'11:00 p.m.'}>11:00 p.m.</MenuItem>
              <MenuItem value={'11:30 p.m.'}>11:30 p.m.</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box className={classes.hours}>
          <FormControl variant="outlined" className={classes.formControlHours}>
            <Typography
              className={classes.day}
              variant="body1"
              component="p"
              display="inline"
              gutterbottom
            >
              Monday
            </Typography>
            <Hidden xsUp>
              <InputLabel id="monday-open">Monday open</InputLabel>
            </Hidden>
            <Select
              labelId="monday-open"
              className={classes.formFieldHours}
              id="monday-open"
              name="monday_open"
              onChange={handleInputChange}
              defaultValue={row.monday_open ? row.monday_open : ``}
            >
              <MenuItem value="closed">
                <em>Closed</em>
              </MenuItem>
              <MenuItem value={'12:00 a.m.'}>12:00 a.m.</MenuItem>
              <MenuItem value={'12:30 a.m.'}>12:30 a.m.</MenuItem>
              <MenuItem value={'1:00 a.m.'}>1:00 a.m.</MenuItem>
              <MenuItem value={'1:30 a.m.'}>1:30 a.m.</MenuItem>
              <MenuItem value={'2:00 a.m.'}>2:00 a.m.</MenuItem>
              <MenuItem value={'2:30 a.m.'}>2:30 a.m.</MenuItem>
              <MenuItem value={'3:00 a.m.'}>3:00 a.m.</MenuItem>
              <MenuItem value={'3:30 a.m.'}>3:30 a.m.</MenuItem>
              <MenuItem value={'4:00 a.m.'}>4:00 a.m.</MenuItem>
              <MenuItem value={'4:30 a.m.'}>4:30 a.m.</MenuItem>
              <MenuItem value={'5:00 a.m.'}>5:00 a.m.</MenuItem>
              <MenuItem value={'5:30 a.m.'}>5:30 a.m.</MenuItem>
              <MenuItem value={'6:00 a.m.'}>6:00 a.m.</MenuItem>
              <MenuItem value={'6:30 a.m.'}>6:30 a.m.</MenuItem>
              <MenuItem value={'7:00 a.m.'}>7:00 a.m.</MenuItem>
              <MenuItem value={'7:30 a.m.'}>7:30 a.m.</MenuItem>
              <MenuItem value={'8:00 a.m.'}>8:00 a.m.</MenuItem>
              <MenuItem value={'8:30 a.m.'}>8:30 a.m.</MenuItem>
              <MenuItem value={'9:00 a.m.'}>9:00 a.m.</MenuItem>
              <MenuItem value={'9:30 a.m.'}>9:30 a.m.</MenuItem>
              <MenuItem value={'10:00 a.m.'}>10:00 a.m.</MenuItem>
              <MenuItem value={'10:30 a.m.'}>10:30 a.m.</MenuItem>
              <MenuItem value={'11:00 a.m.'}>11:00 a.m.</MenuItem>
              <MenuItem value={'11:30 a.m.'}>11:30 a.m.</MenuItem>
              <MenuItem value={'12:00 p.m.'}>12:00 p.m.</MenuItem>
              <MenuItem value={'12:30 p.m.'}>12:30 p.m.</MenuItem>
              <MenuItem value={'1:00 p.m.'}>1:00 p.m.</MenuItem>
              <MenuItem value={'1:30 p.m.'}>1:30 p.m.</MenuItem>
              <MenuItem value={'2:00 p.m.'}>2:00 p.m.</MenuItem>
              <MenuItem value={'2:30 p.m.'}>2:30 p.m.</MenuItem>
              <MenuItem value={'3:00 p.m.'}>3:00 p.m.</MenuItem>
              <MenuItem value={'3:30 p.m.'}>3:30 p.m.</MenuItem>
              <MenuItem value={'4:00 p.m.'}>4:00 p.m.</MenuItem>
              <MenuItem value={'4:30 p.m.'}>4:30 p.m.</MenuItem>
              <MenuItem value={'5:00 p.m.'}>5:00 p.m.</MenuItem>
              <MenuItem value={'5:30 p.m.'}>5:30 p.m.</MenuItem>
              <MenuItem value={'6:00 p.m.'}>6:00 p.m.</MenuItem>
              <MenuItem value={'6:30 p.m.'}>6:30 p.m.</MenuItem>
              <MenuItem value={'7:00 p.m.'}>7:00 p.m.</MenuItem>
              <MenuItem value={'7:30 p.m.'}>7:30 p.m.</MenuItem>
              <MenuItem value={'8:00 p.m.'}>8:00 p.m.</MenuItem>
              <MenuItem value={'8:30 p.m.'}>8:30 p.m.</MenuItem>
              <MenuItem value={'9:00 p.m.'}>9:00 p.m.</MenuItem>
              <MenuItem value={'9:30 p.m.'}>9:30 p.m.</MenuItem>
              <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
              <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
              <MenuItem value={'11:00 p.m.'}>11:00 p.m.</MenuItem>
              <MenuItem value={'11:30 p.m.'}>11:30 p.m.</MenuItem>
            </Select>
          </FormControl>
          <FormControl variant="outlined" className={classes.formControlHours}>
            <Typography
              variant="body1"
              component="p"
              display="inline"
              gutterbottom
            >
              to
            </Typography>
            <Hidden xsUp>
              <InputLabel id="monday-close">Monday close</InputLabel>
            </Hidden>
            <Select
              labelId="monday-close"
              className={classes.formFieldHours}
              id="monday-close"
              name="monday_close"
              onChange={handleInputChange}
              defaultValue={row.monday_close ? row.monday_close : ``}
            >
              <MenuItem value="closed">
                <em>Closed</em>
              </MenuItem>
              <MenuItem value={'12:00 a.m.'}>12:00 a.m.</MenuItem>
              <MenuItem value={'12:30 a.m.'}>12:30 a.m.</MenuItem>
              <MenuItem value={'1:00 a.m.'}>1:00 a.m.</MenuItem>
              <MenuItem value={'1:30 a.m.'}>1:30 a.m.</MenuItem>
              <MenuItem value={'2:00 a.m.'}>2:00 a.m.</MenuItem>
              <MenuItem value={'2:30 a.m.'}>2:30 a.m.</MenuItem>
              <MenuItem value={'3:00 a.m.'}>3:00 a.m.</MenuItem>
              <MenuItem value={'3:30 a.m.'}>3:30 a.m.</MenuItem>
              <MenuItem value={'4:00 a.m.'}>4:00 a.m.</MenuItem>
              <MenuItem value={'4:30 a.m.'}>4:30 a.m.</MenuItem>
              <MenuItem value={'5:00 a.m.'}>5:00 a.m.</MenuItem>
              <MenuItem value={'5:30 a.m.'}>5:30 a.m.</MenuItem>
              <MenuItem value={'6:00 a.m.'}>6:00 a.m.</MenuItem>
              <MenuItem value={'6:30 a.m.'}>6:30 a.m.</MenuItem>
              <MenuItem value={'7:00 a.m.'}>7:00 a.m.</MenuItem>
              <MenuItem value={'7:30 a.m.'}>7:30 a.m.</MenuItem>
              <MenuItem value={'8:00 a.m.'}>8:00 a.m.</MenuItem>
              <MenuItem value={'8:30 a.m.'}>8:30 a.m.</MenuItem>
              <MenuItem value={'9:00 a.m.'}>9:00 a.m.</MenuItem>
              <MenuItem value={'9:30 a.m.'}>9:30 a.m.</MenuItem>
              <MenuItem value={'10:00 a.m.'}>10:00 a.m.</MenuItem>
              <MenuItem value={'10:30 a.m.'}>10:30 a.m.</MenuItem>
              <MenuItem value={'11:00 a.m.'}>11:00 a.m.</MenuItem>
              <MenuItem value={'11:30 a.m.'}>11:30 a.m.</MenuItem>
              <MenuItem value={'12:00 p.m.'}>12:00 p.m.</MenuItem>
              <MenuItem value={'12:30 p.m.'}>12:30 p.m.</MenuItem>
              <MenuItem value={'1:00 p.m.'}>1:00 p.m.</MenuItem>
              <MenuItem value={'1:30 p.m.'}>1:30 p.m.</MenuItem>
              <MenuItem value={'2:00 p.m.'}>2:00 p.m.</MenuItem>
              <MenuItem value={'2:30 p.m.'}>2:30 p.m.</MenuItem>
              <MenuItem value={'3:00 p.m.'}>3:00 p.m.</MenuItem>
              <MenuItem value={'3:30 p.m.'}>3:30 p.m.</MenuItem>
              <MenuItem value={'4:00 p.m.'}>4:00 p.m.</MenuItem>
              <MenuItem value={'4:30 p.m.'}>4:30 p.m.</MenuItem>
              <MenuItem value={'5:00 p.m.'}>5:00 p.m.</MenuItem>
              <MenuItem value={'5:30 p.m.'}>5:30 p.m.</MenuItem>
              <MenuItem value={'6:00 p.m.'}>6:00 p.m.</MenuItem>
              <MenuItem value={'6:30 p.m.'}>6:30 p.m.</MenuItem>
              <MenuItem value={'7:00 p.m.'}>7:00 p.m.</MenuItem>
              <MenuItem value={'7:30 p.m.'}>7:30 p.m.</MenuItem>
              <MenuItem value={'8:00 p.m.'}>8:00 p.m.</MenuItem>
              <MenuItem value={'8:30 p.m.'}>8:30 p.m.</MenuItem>
              <MenuItem value={'9:00 p.m.'}>9:00 p.m.</MenuItem>
              <MenuItem value={'9:30 p.m.'}>9:30 p.m.</MenuItem>
              <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
              <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
              <MenuItem value={'11:00 p.m.'}>11:00 p.m.</MenuItem>
              <MenuItem value={'11:30 p.m.'}>11:30 p.m.</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box className={classes.hours}>
          <FormControl variant="outlined" className={classes.formControlHours}>
            <Typography
              className={classes.day}
              variant="body1"
              component="p"
              display="inline"
              gutterbottom
            >
              Tuesday
            </Typography>
            <Hidden xsUp>
              <InputLabel id="tuesday-open">Tuesday open</InputLabel>
            </Hidden>
            <Select
              labelId="tuesday-open"
              className={classes.formFieldHours}
              id="tuesday-open"
              name="tuesday_open"
              onChange={handleInputChange}
              defaultValue={row.tuesday_open ? row.tuesday_open : ``}
            >
              <MenuItem value="closed">
                <em>Closed</em>
              </MenuItem>
              <MenuItem value={'12:00 a.m.'}>12:00 a.m.</MenuItem>
              <MenuItem value={'12:30 a.m.'}>12:30 a.m.</MenuItem>
              <MenuItem value={'1:00 a.m.'}>1:00 a.m.</MenuItem>
              <MenuItem value={'1:30 a.m.'}>1:30 a.m.</MenuItem>
              <MenuItem value={'2:00 a.m.'}>2:00 a.m.</MenuItem>
              <MenuItem value={'2:30 a.m.'}>2:30 a.m.</MenuItem>
              <MenuItem value={'3:00 a.m.'}>3:00 a.m.</MenuItem>
              <MenuItem value={'3:30 a.m.'}>3:30 a.m.</MenuItem>
              <MenuItem value={'4:00 a.m.'}>4:00 a.m.</MenuItem>
              <MenuItem value={'4:30 a.m.'}>4:30 a.m.</MenuItem>
              <MenuItem value={'5:00 a.m.'}>5:00 a.m.</MenuItem>
              <MenuItem value={'5:30 a.m.'}>5:30 a.m.</MenuItem>
              <MenuItem value={'6:00 a.m.'}>6:00 a.m.</MenuItem>
              <MenuItem value={'6:30 a.m.'}>6:30 a.m.</MenuItem>
              <MenuItem value={'7:00 a.m.'}>7:00 a.m.</MenuItem>
              <MenuItem value={'7:30 a.m.'}>7:30 a.m.</MenuItem>
              <MenuItem value={'8:00 a.m.'}>8:00 a.m.</MenuItem>
              <MenuItem value={'8:30 a.m.'}>8:30 a.m.</MenuItem>
              <MenuItem value={'9:00 a.m.'}>9:00 a.m.</MenuItem>
              <MenuItem value={'9:30 a.m.'}>9:30 a.m.</MenuItem>
              <MenuItem value={'10:00 a.m.'}>10:00 a.m.</MenuItem>
              <MenuItem value={'10:30 a.m.'}>10:30 a.m.</MenuItem>
              <MenuItem value={'11:00 a.m.'}>11:00 a.m.</MenuItem>
              <MenuItem value={'11:30 a.m.'}>11:30 a.m.</MenuItem>
              <MenuItem value={'12:00 p.m.'}>12:00 p.m.</MenuItem>
              <MenuItem value={'12:30 p.m.'}>12:30 p.m.</MenuItem>
              <MenuItem value={'1:00 p.m.'}>1:00 p.m.</MenuItem>
              <MenuItem value={'1:30 p.m.'}>1:30 p.m.</MenuItem>
              <MenuItem value={'2:00 p.m.'}>2:00 p.m.</MenuItem>
              <MenuItem value={'2:30 p.m.'}>2:30 p.m.</MenuItem>
              <MenuItem value={'3:00 p.m.'}>3:00 p.m.</MenuItem>
              <MenuItem value={'3:30 p.m.'}>3:30 p.m.</MenuItem>
              <MenuItem value={'4:00 p.m.'}>4:00 p.m.</MenuItem>
              <MenuItem value={'4:30 p.m.'}>4:30 p.m.</MenuItem>
              <MenuItem value={'5:00 p.m.'}>5:00 p.m.</MenuItem>
              <MenuItem value={'5:30 p.m.'}>5:30 p.m.</MenuItem>
              <MenuItem value={'6:00 p.m.'}>6:00 p.m.</MenuItem>
              <MenuItem value={'6:30 p.m.'}>6:30 p.m.</MenuItem>
              <MenuItem value={'7:00 p.m.'}>7:00 p.m.</MenuItem>
              <MenuItem value={'7:30 p.m.'}>7:30 p.m.</MenuItem>
              <MenuItem value={'8:00 p.m.'}>8:00 p.m.</MenuItem>
              <MenuItem value={'8:30 p.m.'}>8:30 p.m.</MenuItem>
              <MenuItem value={'9:00 p.m.'}>9:00 p.m.</MenuItem>
              <MenuItem value={'9:30 p.m.'}>9:30 p.m.</MenuItem>
              <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
              <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
              <MenuItem value={'11:00 p.m.'}>11:00 p.m.</MenuItem>
              <MenuItem value={'11:30 p.m.'}>11:30 p.m.</MenuItem>
            </Select>
          </FormControl>
          <FormControl variant="outlined" className={classes.formControlHours}>
            <Typography
              variant="body1"
              component="p"
              display="inline"
              gutterbottom
            >
              to
            </Typography>
            <Hidden xsUp>
              <InputLabel id="tuesday-close">Tuesday close</InputLabel>
            </Hidden>
            <Select
              labelId="tuesday-close"
              className={classes.formFieldHours}
              id="tuesday-close"
              name="tuesday_close"
              onChange={handleInputChange}
              defaultValue={row.tuesday_close ? row.tuesday_close : ``}
            >
              <MenuItem value="closed">
                <em>Closed</em>
              </MenuItem>
              <MenuItem value={'12:00 a.m.'}>12:00 a.m.</MenuItem>
              <MenuItem value={'12:30 a.m.'}>12:30 a.m.</MenuItem>
              <MenuItem value={'1:00 a.m.'}>1:00 a.m.</MenuItem>
              <MenuItem value={'1:30 a.m.'}>1:30 a.m.</MenuItem>
              <MenuItem value={'2:00 a.m.'}>2:00 a.m.</MenuItem>
              <MenuItem value={'2:30 a.m.'}>2:30 a.m.</MenuItem>
              <MenuItem value={'3:00 a.m.'}>3:00 a.m.</MenuItem>
              <MenuItem value={'3:30 a.m.'}>3:30 a.m.</MenuItem>
              <MenuItem value={'4:00 a.m.'}>4:00 a.m.</MenuItem>
              <MenuItem value={'4:30 a.m.'}>4:30 a.m.</MenuItem>
              <MenuItem value={'5:00 a.m.'}>5:00 a.m.</MenuItem>
              <MenuItem value={'5:30 a.m.'}>5:30 a.m.</MenuItem>
              <MenuItem value={'6:00 a.m.'}>6:00 a.m.</MenuItem>
              <MenuItem value={'6:30 a.m.'}>6:30 a.m.</MenuItem>
              <MenuItem value={'7:00 a.m.'}>7:00 a.m.</MenuItem>
              <MenuItem value={'7:30 a.m.'}>7:30 a.m.</MenuItem>
              <MenuItem value={'8:00 a.m.'}>8:00 a.m.</MenuItem>
              <MenuItem value={'8:30 a.m.'}>8:30 a.m.</MenuItem>
              <MenuItem value={'9:00 a.m.'}>9:00 a.m.</MenuItem>
              <MenuItem value={'9:30 a.m.'}>9:30 a.m.</MenuItem>
              <MenuItem value={'10:00 a.m.'}>10:00 a.m.</MenuItem>
              <MenuItem value={'10:30 a.m.'}>10:30 a.m.</MenuItem>
              <MenuItem value={'11:00 a.m.'}>11:00 a.m.</MenuItem>
              <MenuItem value={'11:30 a.m.'}>11:30 a.m.</MenuItem>
              <MenuItem value={'12:00 p.m.'}>12:00 p.m.</MenuItem>
              <MenuItem value={'12:30 p.m.'}>12:30 p.m.</MenuItem>
              <MenuItem value={'1:00 p.m.'}>1:00 p.m.</MenuItem>
              <MenuItem value={'1:30 p.m.'}>1:30 p.m.</MenuItem>
              <MenuItem value={'2:00 p.m.'}>2:00 p.m.</MenuItem>
              <MenuItem value={'2:30 p.m.'}>2:30 p.m.</MenuItem>
              <MenuItem value={'3:00 p.m.'}>3:00 p.m.</MenuItem>
              <MenuItem value={'3:30 p.m.'}>3:30 p.m.</MenuItem>
              <MenuItem value={'4:00 p.m.'}>4:00 p.m.</MenuItem>
              <MenuItem value={'4:30 p.m.'}>4:30 p.m.</MenuItem>
              <MenuItem value={'5:00 p.m.'}>5:00 p.m.</MenuItem>
              <MenuItem value={'5:30 p.m.'}>5:30 p.m.</MenuItem>
              <MenuItem value={'6:00 p.m.'}>6:00 p.m.</MenuItem>
              <MenuItem value={'6:30 p.m.'}>6:30 p.m.</MenuItem>
              <MenuItem value={'7:00 p.m.'}>7:00 p.m.</MenuItem>
              <MenuItem value={'7:30 p.m.'}>7:30 p.m.</MenuItem>
              <MenuItem value={'8:00 p.m.'}>8:00 p.m.</MenuItem>
              <MenuItem value={'8:30 p.m.'}>8:30 p.m.</MenuItem>
              <MenuItem value={'9:00 p.m.'}>9:00 p.m.</MenuItem>
              <MenuItem value={'9:30 p.m.'}>9:30 p.m.</MenuItem>
              <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
              <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
              <MenuItem value={'11:00 p.m.'}>11:00 p.m.</MenuItem>
              <MenuItem value={'11:30 p.m.'}>11:30 p.m.</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box className={classes.hours}>
          <FormControl variant="outlined" className={classes.formControlHours}>
            <Typography
              className={classes.day}
              variant="body1"
              component="p"
              display="inline"
              gutterbottom
            >
              Wednesday
            </Typography>
            <Hidden xsUp>
              <InputLabel id="wednesday-open">Wednesday open</InputLabel>
            </Hidden>
            <Select
              labelId="wednesday-open"
              className={classes.formFieldHours}
              id="wednesday-open"
              name="wednesday_open"
              onChange={handleInputChange}
              defaultValue={row.wednesday_open ? row.wednesday_open : ``}
            >
              <MenuItem value="closed">
                <em>Closed</em>
              </MenuItem>
              <MenuItem value={'12:00 a.m.'}>12:00 a.m.</MenuItem>
              <MenuItem value={'12:30 a.m.'}>12:30 a.m.</MenuItem>
              <MenuItem value={'1:00 a.m.'}>1:00 a.m.</MenuItem>
              <MenuItem value={'1:30 a.m.'}>1:30 a.m.</MenuItem>
              <MenuItem value={'2:00 a.m.'}>2:00 a.m.</MenuItem>
              <MenuItem value={'2:30 a.m.'}>2:30 a.m.</MenuItem>
              <MenuItem value={'3:00 a.m.'}>3:00 a.m.</MenuItem>
              <MenuItem value={'3:30 a.m.'}>3:30 a.m.</MenuItem>
              <MenuItem value={'4:00 a.m.'}>4:00 a.m.</MenuItem>
              <MenuItem value={'4:30 a.m.'}>4:30 a.m.</MenuItem>
              <MenuItem value={'5:00 a.m.'}>5:00 a.m.</MenuItem>
              <MenuItem value={'5:30 a.m.'}>5:30 a.m.</MenuItem>
              <MenuItem value={'6:00 a.m.'}>6:00 a.m.</MenuItem>
              <MenuItem value={'6:30 a.m.'}>6:30 a.m.</MenuItem>
              <MenuItem value={'7:00 a.m.'}>7:00 a.m.</MenuItem>
              <MenuItem value={'7:30 a.m.'}>7:30 a.m.</MenuItem>
              <MenuItem value={'8:00 a.m.'}>8:00 a.m.</MenuItem>
              <MenuItem value={'8:30 a.m.'}>8:30 a.m.</MenuItem>
              <MenuItem value={'9:00 a.m.'}>9:00 a.m.</MenuItem>
              <MenuItem value={'9:30 a.m.'}>9:30 a.m.</MenuItem>
              <MenuItem value={'10:00 a.m.'}>10:00 a.m.</MenuItem>
              <MenuItem value={'10:30 a.m.'}>10:30 a.m.</MenuItem>
              <MenuItem value={'11:00 a.m.'}>11:00 a.m.</MenuItem>
              <MenuItem value={'11:30 a.m.'}>11:30 a.m.</MenuItem>
              <MenuItem value={'12:00 p.m.'}>12:00 p.m.</MenuItem>
              <MenuItem value={'12:30 p.m.'}>12:30 p.m.</MenuItem>
              <MenuItem value={'1:00 p.m.'}>1:00 p.m.</MenuItem>
              <MenuItem value={'1:30 p.m.'}>1:30 p.m.</MenuItem>
              <MenuItem value={'2:00 p.m.'}>2:00 p.m.</MenuItem>
              <MenuItem value={'2:30 p.m.'}>2:30 p.m.</MenuItem>
              <MenuItem value={'3:00 p.m.'}>3:00 p.m.</MenuItem>
              <MenuItem value={'3:30 p.m.'}>3:30 p.m.</MenuItem>
              <MenuItem value={'4:00 p.m.'}>4:00 p.m.</MenuItem>
              <MenuItem value={'4:30 p.m.'}>4:30 p.m.</MenuItem>
              <MenuItem value={'5:00 p.m.'}>5:00 p.m.</MenuItem>
              <MenuItem value={'5:30 p.m.'}>5:30 p.m.</MenuItem>
              <MenuItem value={'6:00 p.m.'}>6:00 p.m.</MenuItem>
              <MenuItem value={'6:30 p.m.'}>6:30 p.m.</MenuItem>
              <MenuItem value={'7:00 p.m.'}>7:00 p.m.</MenuItem>
              <MenuItem value={'7:30 p.m.'}>7:30 p.m.</MenuItem>
              <MenuItem value={'8:00 p.m.'}>8:00 p.m.</MenuItem>
              <MenuItem value={'8:30 p.m.'}>8:30 p.m.</MenuItem>
              <MenuItem value={'9:00 p.m.'}>9:00 p.m.</MenuItem>
              <MenuItem value={'9:30 p.m.'}>9:30 p.m.</MenuItem>
              <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
              <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
              <MenuItem value={'11:00 p.m.'}>11:00 p.m.</MenuItem>
              <MenuItem value={'11:30 p.m.'}>11:30 p.m.</MenuItem>
            </Select>
          </FormControl>
          <FormControl variant="outlined" className={classes.formControlHours}>
            <Typography
              variant="body1"
              component="p"
              display="inline"
              gutterbottom
            >
              to
            </Typography>
            <Hidden xsUp>
              <InputLabel id="wednesday-close">Wednesday close</InputLabel>
            </Hidden>
            <Select
              labelId="wednesday-close"
              className={classes.formFieldHours}
              id="wednesday-close"
              name="wednesday_close"
              onChange={handleInputChange}
              defaultValue={row.wednesday_close ? row.wednesday_close : ``}
            >
              <MenuItem value="closed">
                <em>Closed</em>
              </MenuItem>
              <MenuItem value={'12:00 a.m.'}>12:00 a.m.</MenuItem>
              <MenuItem value={'12:30 a.m.'}>12:30 a.m.</MenuItem>
              <MenuItem value={'1:00 a.m.'}>1:00 a.m.</MenuItem>
              <MenuItem value={'1:30 a.m.'}>1:30 a.m.</MenuItem>
              <MenuItem value={'2:00 a.m.'}>2:00 a.m.</MenuItem>
              <MenuItem value={'2:30 a.m.'}>2:30 a.m.</MenuItem>
              <MenuItem value={'3:00 a.m.'}>3:00 a.m.</MenuItem>
              <MenuItem value={'3:30 a.m.'}>3:30 a.m.</MenuItem>
              <MenuItem value={'4:00 a.m.'}>4:00 a.m.</MenuItem>
              <MenuItem value={'4:30 a.m.'}>4:30 a.m.</MenuItem>
              <MenuItem value={'5:00 a.m.'}>5:00 a.m.</MenuItem>
              <MenuItem value={'5:30 a.m.'}>5:30 a.m.</MenuItem>
              <MenuItem value={'6:00 a.m.'}>6:00 a.m.</MenuItem>
              <MenuItem value={'6:30 a.m.'}>6:30 a.m.</MenuItem>
              <MenuItem value={'7:00 a.m.'}>7:00 a.m.</MenuItem>
              <MenuItem value={'7:30 a.m.'}>7:30 a.m.</MenuItem>
              <MenuItem value={'8:00 a.m.'}>8:00 a.m.</MenuItem>
              <MenuItem value={'8:30 a.m.'}>8:30 a.m.</MenuItem>
              <MenuItem value={'9:00 a.m.'}>9:00 a.m.</MenuItem>
              <MenuItem value={'9:30 a.m.'}>9:30 a.m.</MenuItem>
              <MenuItem value={'10:00 a.m.'}>10:00 a.m.</MenuItem>
              <MenuItem value={'10:30 a.m.'}>10:30 a.m.</MenuItem>
              <MenuItem value={'11:00 a.m.'}>11:00 a.m.</MenuItem>
              <MenuItem value={'11:30 a.m.'}>11:30 a.m.</MenuItem>
              <MenuItem value={'12:00 p.m.'}>12:00 p.m.</MenuItem>
              <MenuItem value={'12:30 p.m.'}>12:30 p.m.</MenuItem>
              <MenuItem value={'1:00 p.m.'}>1:00 p.m.</MenuItem>
              <MenuItem value={'1:30 p.m.'}>1:30 p.m.</MenuItem>
              <MenuItem value={'2:00 p.m.'}>2:00 p.m.</MenuItem>
              <MenuItem value={'2:30 p.m.'}>2:30 p.m.</MenuItem>
              <MenuItem value={'3:00 p.m.'}>3:00 p.m.</MenuItem>
              <MenuItem value={'3:30 p.m.'}>3:30 p.m.</MenuItem>
              <MenuItem value={'4:00 p.m.'}>4:00 p.m.</MenuItem>
              <MenuItem value={'4:30 p.m.'}>4:30 p.m.</MenuItem>
              <MenuItem value={'5:00 p.m.'}>5:00 p.m.</MenuItem>
              <MenuItem value={'5:30 p.m.'}>5:30 p.m.</MenuItem>
              <MenuItem value={'6:00 p.m.'}>6:00 p.m.</MenuItem>
              <MenuItem value={'6:30 p.m.'}>6:30 p.m.</MenuItem>
              <MenuItem value={'7:00 p.m.'}>7:00 p.m.</MenuItem>
              <MenuItem value={'7:30 p.m.'}>7:30 p.m.</MenuItem>
              <MenuItem value={'8:00 p.m.'}>8:00 p.m.</MenuItem>
              <MenuItem value={'8:30 p.m.'}>8:30 p.m.</MenuItem>
              <MenuItem value={'9:00 p.m.'}>9:00 p.m.</MenuItem>
              <MenuItem value={'9:30 p.m.'}>9:30 p.m.</MenuItem>
              <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
              <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
              <MenuItem value={'11:00 p.m.'}>11:00 p.m.</MenuItem>
              <MenuItem value={'11:30 p.m.'}>11:30 p.m.</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box className={classes.hours}>
          <FormControl variant="outlined" className={classes.formControlHours}>
            <Typography
              className={classes.day}
              variant="body1"
              component="p"
              display="inline"
              gutterbottom
            >
              Thursday
            </Typography>
            <Hidden xsUp>
              <InputLabel id="thursday-open">Thursday open</InputLabel>
            </Hidden>
            <Select
              labelId="thursday-open"
              className={classes.formFieldHours}
              id="thursday-open"
              name="thursday_open"
              onChange={handleInputChange}
              defaultValue={row.thursday_open ? row.thursday_open : ``}
            >
              <MenuItem value="closed">
                <em>Closed</em>
              </MenuItem>
              <MenuItem value={'12:00 a.m.'}>12:00 a.m.</MenuItem>
              <MenuItem value={'12:30 a.m.'}>12:30 a.m.</MenuItem>
              <MenuItem value={'1:00 a.m.'}>1:00 a.m.</MenuItem>
              <MenuItem value={'1:30 a.m.'}>1:30 a.m.</MenuItem>
              <MenuItem value={'2:00 a.m.'}>2:00 a.m.</MenuItem>
              <MenuItem value={'2:30 a.m.'}>2:30 a.m.</MenuItem>
              <MenuItem value={'3:00 a.m.'}>3:00 a.m.</MenuItem>
              <MenuItem value={'3:30 a.m.'}>3:30 a.m.</MenuItem>
              <MenuItem value={'4:00 a.m.'}>4:00 a.m.</MenuItem>
              <MenuItem value={'4:30 a.m.'}>4:30 a.m.</MenuItem>
              <MenuItem value={'5:00 a.m.'}>5:00 a.m.</MenuItem>
              <MenuItem value={'5:30 a.m.'}>5:30 a.m.</MenuItem>
              <MenuItem value={'6:00 a.m.'}>6:00 a.m.</MenuItem>
              <MenuItem value={'6:30 a.m.'}>6:30 a.m.</MenuItem>
              <MenuItem value={'7:00 a.m.'}>7:00 a.m.</MenuItem>
              <MenuItem value={'7:30 a.m.'}>7:30 a.m.</MenuItem>
              <MenuItem value={'8:00 a.m.'}>8:00 a.m.</MenuItem>
              <MenuItem value={'8:30 a.m.'}>8:30 a.m.</MenuItem>
              <MenuItem value={'9:00 a.m.'}>9:00 a.m.</MenuItem>
              <MenuItem value={'9:30 a.m.'}>9:30 a.m.</MenuItem>
              <MenuItem value={'10:00 a.m.'}>10:00 a.m.</MenuItem>
              <MenuItem value={'10:30 a.m.'}>10:30 a.m.</MenuItem>
              <MenuItem value={'11:00 a.m.'}>11:00 a.m.</MenuItem>
              <MenuItem value={'11:30 a.m.'}>11:30 a.m.</MenuItem>
              <MenuItem value={'12:00 p.m.'}>12:00 p.m.</MenuItem>
              <MenuItem value={'12:30 p.m.'}>12:30 p.m.</MenuItem>
              <MenuItem value={'1:00 p.m.'}>1:00 p.m.</MenuItem>
              <MenuItem value={'1:30 p.m.'}>1:30 p.m.</MenuItem>
              <MenuItem value={'2:00 p.m.'}>2:00 p.m.</MenuItem>
              <MenuItem value={'2:30 p.m.'}>2:30 p.m.</MenuItem>
              <MenuItem value={'3:00 p.m.'}>3:00 p.m.</MenuItem>
              <MenuItem value={'3:30 p.m.'}>3:30 p.m.</MenuItem>
              <MenuItem value={'4:00 p.m.'}>4:00 p.m.</MenuItem>
              <MenuItem value={'4:30 p.m.'}>4:30 p.m.</MenuItem>
              <MenuItem value={'5:00 p.m.'}>5:00 p.m.</MenuItem>
              <MenuItem value={'5:30 p.m.'}>5:30 p.m.</MenuItem>
              <MenuItem value={'6:00 p.m.'}>6:00 p.m.</MenuItem>
              <MenuItem value={'6:30 p.m.'}>6:30 p.m.</MenuItem>
              <MenuItem value={'7:00 p.m.'}>7:00 p.m.</MenuItem>
              <MenuItem value={'7:30 p.m.'}>7:30 p.m.</MenuItem>
              <MenuItem value={'8:00 p.m.'}>8:00 p.m.</MenuItem>
              <MenuItem value={'8:30 p.m.'}>8:30 p.m.</MenuItem>
              <MenuItem value={'9:00 p.m.'}>9:00 p.m.</MenuItem>
              <MenuItem value={'9:30 p.m.'}>9:30 p.m.</MenuItem>
              <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
              <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
              <MenuItem value={'11:00 p.m.'}>11:00 p.m.</MenuItem>
              <MenuItem value={'11:30 p.m.'}>11:30 p.m.</MenuItem>
            </Select>
          </FormControl>
          <FormControl variant="outlined" className={classes.formControlHours}>
            <Typography
              variant="body1"
              component="p"
              display="inline"
              gutterbottom
            >
              to
            </Typography>
            <Hidden xsUp>
              <InputLabel id="thursday-close">Thursday close</InputLabel>
            </Hidden>
            <Select
              labelId="thursday-close"
              className={classes.formFieldHours}
              id="thursday-close"
              name="thursday_close"
              onChange={handleInputChange}
              defaultValue={row.thursday_close ? row.thursday_close : ``}
            >
              <MenuItem value="closed">
                <em>Closed</em>
              </MenuItem>
              <MenuItem value={'12:00 a.m.'}>12:00 a.m.</MenuItem>
              <MenuItem value={'12:30 a.m.'}>12:30 a.m.</MenuItem>
              <MenuItem value={'1:00 a.m.'}>1:00 a.m.</MenuItem>
              <MenuItem value={'1:30 a.m.'}>1:30 a.m.</MenuItem>
              <MenuItem value={'2:00 a.m.'}>2:00 a.m.</MenuItem>
              <MenuItem value={'2:30 a.m.'}>2:30 a.m.</MenuItem>
              <MenuItem value={'3:00 a.m.'}>3:00 a.m.</MenuItem>
              <MenuItem value={'3:30 a.m.'}>3:30 a.m.</MenuItem>
              <MenuItem value={'4:00 a.m.'}>4:00 a.m.</MenuItem>
              <MenuItem value={'4:30 a.m.'}>4:30 a.m.</MenuItem>
              <MenuItem value={'5:00 a.m.'}>5:00 a.m.</MenuItem>
              <MenuItem value={'5:30 a.m.'}>5:30 a.m.</MenuItem>
              <MenuItem value={'6:00 a.m.'}>6:00 a.m.</MenuItem>
              <MenuItem value={'6:30 a.m.'}>6:30 a.m.</MenuItem>
              <MenuItem value={'7:00 a.m.'}>7:00 a.m.</MenuItem>
              <MenuItem value={'7:30 a.m.'}>7:30 a.m.</MenuItem>
              <MenuItem value={'8:00 a.m.'}>8:00 a.m.</MenuItem>
              <MenuItem value={'8:30 a.m.'}>8:30 a.m.</MenuItem>
              <MenuItem value={'9:00 a.m.'}>9:00 a.m.</MenuItem>
              <MenuItem value={'9:30 a.m.'}>9:30 a.m.</MenuItem>
              <MenuItem value={'10:00 a.m.'}>10:00 a.m.</MenuItem>
              <MenuItem value={'10:30 a.m.'}>10:30 a.m.</MenuItem>
              <MenuItem value={'11:00 a.m.'}>11:00 a.m.</MenuItem>
              <MenuItem value={'11:30 a.m.'}>11:30 a.m.</MenuItem>
              <MenuItem value={'12:00 p.m.'}>12:00 p.m.</MenuItem>
              <MenuItem value={'12:30 p.m.'}>12:30 p.m.</MenuItem>
              <MenuItem value={'1:00 p.m.'}>1:00 p.m.</MenuItem>
              <MenuItem value={'1:30 p.m.'}>1:30 p.m.</MenuItem>
              <MenuItem value={'2:00 p.m.'}>2:00 p.m.</MenuItem>
              <MenuItem value={'2:30 p.m.'}>2:30 p.m.</MenuItem>
              <MenuItem value={'3:00 p.m.'}>3:00 p.m.</MenuItem>
              <MenuItem value={'3:30 p.m.'}>3:30 p.m.</MenuItem>
              <MenuItem value={'4:00 p.m.'}>4:00 p.m.</MenuItem>
              <MenuItem value={'4:30 p.m.'}>4:30 p.m.</MenuItem>
              <MenuItem value={'5:00 p.m.'}>5:00 p.m.</MenuItem>
              <MenuItem value={'5:30 p.m.'}>5:30 p.m.</MenuItem>
              <MenuItem value={'6:00 p.m.'}>6:00 p.m.</MenuItem>
              <MenuItem value={'6:30 p.m.'}>6:30 p.m.</MenuItem>
              <MenuItem value={'7:00 p.m.'}>7:00 p.m.</MenuItem>
              <MenuItem value={'7:30 p.m.'}>7:30 p.m.</MenuItem>
              <MenuItem value={'8:00 p.m.'}>8:00 p.m.</MenuItem>
              <MenuItem value={'8:30 p.m.'}>8:30 p.m.</MenuItem>
              <MenuItem value={'9:00 p.m.'}>9:00 p.m.</MenuItem>
              <MenuItem value={'9:30 p.m.'}>9:30 p.m.</MenuItem>
              <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
              <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
              <MenuItem value={'11:00 p.m.'}>11:00 p.m.</MenuItem>
              <MenuItem value={'11:30 p.m.'}>11:30 p.m.</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box className={classes.hours}>
          <FormControl variant="outlined" className={classes.formControlHours}>
            <Typography
              className={classes.day}
              variant="body1"
              component="p"
              display="inline"
              gutterbottom
            >
              Friday
            </Typography>
            <Hidden xsUp>
              <InputLabel id="friday-open">Friday open</InputLabel>
            </Hidden>
            <Select
              labelId="friday-open"
              className={classes.formFieldHours}
              id="friday-open"
              name="friday_open"
              onChange={handleInputChange}
              defaultValue={row.friday_open ? row.friday_open : ``}
            >
              <MenuItem value="closed">
                <em>Closed</em>
              </MenuItem>
              <MenuItem value={'12:00 a.m.'}>12:00 a.m.</MenuItem>
              <MenuItem value={'12:30 a.m.'}>12:30 a.m.</MenuItem>
              <MenuItem value={'1:00 a.m.'}>1:00 a.m.</MenuItem>
              <MenuItem value={'1:30 a.m.'}>1:30 a.m.</MenuItem>
              <MenuItem value={'2:00 a.m.'}>2:00 a.m.</MenuItem>
              <MenuItem value={'2:30 a.m.'}>2:30 a.m.</MenuItem>
              <MenuItem value={'3:00 a.m.'}>3:00 a.m.</MenuItem>
              <MenuItem value={'3:30 a.m.'}>3:30 a.m.</MenuItem>
              <MenuItem value={'4:00 a.m.'}>4:00 a.m.</MenuItem>
              <MenuItem value={'4:30 a.m.'}>4:30 a.m.</MenuItem>
              <MenuItem value={'5:00 a.m.'}>5:00 a.m.</MenuItem>
              <MenuItem value={'5:30 a.m.'}>5:30 a.m.</MenuItem>
              <MenuItem value={'6:00 a.m.'}>6:00 a.m.</MenuItem>
              <MenuItem value={'6:30 a.m.'}>6:30 a.m.</MenuItem>
              <MenuItem value={'7:00 a.m.'}>7:00 a.m.</MenuItem>
              <MenuItem value={'7:30 a.m.'}>7:30 a.m.</MenuItem>
              <MenuItem value={'8:00 a.m.'}>8:00 a.m.</MenuItem>
              <MenuItem value={'8:30 a.m.'}>8:30 a.m.</MenuItem>
              <MenuItem value={'9:00 a.m.'}>9:00 a.m.</MenuItem>
              <MenuItem value={'9:30 a.m.'}>9:30 a.m.</MenuItem>
              <MenuItem value={'10:00 a.m.'}>10:00 a.m.</MenuItem>
              <MenuItem value={'10:30 a.m.'}>10:30 a.m.</MenuItem>
              <MenuItem value={'11:00 a.m.'}>11:00 a.m.</MenuItem>
              <MenuItem value={'11:30 a.m.'}>11:30 a.m.</MenuItem>
              <MenuItem value={'12:00 p.m.'}>12:00 p.m.</MenuItem>
              <MenuItem value={'12:30 p.m.'}>12:30 p.m.</MenuItem>
              <MenuItem value={'1:00 p.m.'}>1:00 p.m.</MenuItem>
              <MenuItem value={'1:30 p.m.'}>1:30 p.m.</MenuItem>
              <MenuItem value={'2:00 p.m.'}>2:00 p.m.</MenuItem>
              <MenuItem value={'2:30 p.m.'}>2:30 p.m.</MenuItem>
              <MenuItem value={'3:00 p.m.'}>3:00 p.m.</MenuItem>
              <MenuItem value={'3:30 p.m.'}>3:30 p.m.</MenuItem>
              <MenuItem value={'4:00 p.m.'}>4:00 p.m.</MenuItem>
              <MenuItem value={'4:30 p.m.'}>4:30 p.m.</MenuItem>
              <MenuItem value={'5:00 p.m.'}>5:00 p.m.</MenuItem>
              <MenuItem value={'5:30 p.m.'}>5:30 p.m.</MenuItem>
              <MenuItem value={'6:00 p.m.'}>6:00 p.m.</MenuItem>
              <MenuItem value={'6:30 p.m.'}>6:30 p.m.</MenuItem>
              <MenuItem value={'7:00 p.m.'}>7:00 p.m.</MenuItem>
              <MenuItem value={'7:30 p.m.'}>7:30 p.m.</MenuItem>
              <MenuItem value={'8:00 p.m.'}>8:00 p.m.</MenuItem>
              <MenuItem value={'8:30 p.m.'}>8:30 p.m.</MenuItem>
              <MenuItem value={'9:00 p.m.'}>9:00 p.m.</MenuItem>
              <MenuItem value={'9:30 p.m.'}>9:30 p.m.</MenuItem>
              <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
              <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
              <MenuItem value={'11:00 p.m.'}>11:00 p.m.</MenuItem>
              <MenuItem value={'11:30 p.m.'}>11:30 p.m.</MenuItem>
            </Select>
          </FormControl>
          <FormControl variant="outlined" className={classes.formControlHours}>
            <Typography
              variant="body1"
              component="p"
              display="inline"
              gutterbottom
            >
              to
            </Typography>
            <Hidden xsUp>
              <InputLabel id="friday-close">Friday close</InputLabel>
            </Hidden>
            <Select
              labelId="friday-close"
              className={classes.formFieldHours}
              id="friday-close"
              name="friday_close"
              onChange={handleInputChange}
              defaultValue={row.friday_close ? row.friday_close : ``}
            >
              <MenuItem value="closed">
                <em>Closed</em>
              </MenuItem>
              <MenuItem value={'12:00 a.m.'}>12:00 a.m.</MenuItem>
              <MenuItem value={'12:30 a.m.'}>12:30 a.m.</MenuItem>
              <MenuItem value={'1:00 a.m.'}>1:00 a.m.</MenuItem>
              <MenuItem value={'1:30 a.m.'}>1:30 a.m.</MenuItem>
              <MenuItem value={'2:00 a.m.'}>2:00 a.m.</MenuItem>
              <MenuItem value={'2:30 a.m.'}>2:30 a.m.</MenuItem>
              <MenuItem value={'3:00 a.m.'}>3:00 a.m.</MenuItem>
              <MenuItem value={'3:30 a.m.'}>3:30 a.m.</MenuItem>
              <MenuItem value={'4:00 a.m.'}>4:00 a.m.</MenuItem>
              <MenuItem value={'4:30 a.m.'}>4:30 a.m.</MenuItem>
              <MenuItem value={'5:00 a.m.'}>5:00 a.m.</MenuItem>
              <MenuItem value={'5:30 a.m.'}>5:30 a.m.</MenuItem>
              <MenuItem value={'6:00 a.m.'}>6:00 a.m.</MenuItem>
              <MenuItem value={'6:30 a.m.'}>6:30 a.m.</MenuItem>
              <MenuItem value={'7:00 a.m.'}>7:00 a.m.</MenuItem>
              <MenuItem value={'7:30 a.m.'}>7:30 a.m.</MenuItem>
              <MenuItem value={'8:00 a.m.'}>8:00 a.m.</MenuItem>
              <MenuItem value={'8:30 a.m.'}>8:30 a.m.</MenuItem>
              <MenuItem value={'9:00 a.m.'}>9:00 a.m.</MenuItem>
              <MenuItem value={'9:30 a.m.'}>9:30 a.m.</MenuItem>
              <MenuItem value={'10:00 a.m.'}>10:00 a.m.</MenuItem>
              <MenuItem value={'10:30 a.m.'}>10:30 a.m.</MenuItem>
              <MenuItem value={'11:00 a.m.'}>11:00 a.m.</MenuItem>
              <MenuItem value={'11:30 a.m.'}>11:30 a.m.</MenuItem>
              <MenuItem value={'12:00 p.m.'}>12:00 p.m.</MenuItem>
              <MenuItem value={'12:30 p.m.'}>12:30 p.m.</MenuItem>
              <MenuItem value={'1:00 p.m.'}>1:00 p.m.</MenuItem>
              <MenuItem value={'1:30 p.m.'}>1:30 p.m.</MenuItem>
              <MenuItem value={'2:00 p.m.'}>2:00 p.m.</MenuItem>
              <MenuItem value={'2:30 p.m.'}>2:30 p.m.</MenuItem>
              <MenuItem value={'3:00 p.m.'}>3:00 p.m.</MenuItem>
              <MenuItem value={'3:30 p.m.'}>3:30 p.m.</MenuItem>
              <MenuItem value={'4:00 p.m.'}>4:00 p.m.</MenuItem>
              <MenuItem value={'4:30 p.m.'}>4:30 p.m.</MenuItem>
              <MenuItem value={'5:00 p.m.'}>5:00 p.m.</MenuItem>
              <MenuItem value={'5:30 p.m.'}>5:30 p.m.</MenuItem>
              <MenuItem value={'6:00 p.m.'}>6:00 p.m.</MenuItem>
              <MenuItem value={'6:30 p.m.'}>6:30 p.m.</MenuItem>
              <MenuItem value={'7:00 p.m.'}>7:00 p.m.</MenuItem>
              <MenuItem value={'7:30 p.m.'}>7:30 p.m.</MenuItem>
              <MenuItem value={'8:00 p.m.'}>8:00 p.m.</MenuItem>
              <MenuItem value={'8:30 p.m.'}>8:30 p.m.</MenuItem>
              <MenuItem value={'9:00 p.m.'}>9:00 p.m.</MenuItem>
              <MenuItem value={'9:30 p.m.'}>9:30 p.m.</MenuItem>
              <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
              <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
              <MenuItem value={'11:00 p.m.'}>11:00 p.m.</MenuItem>
              <MenuItem value={'11:30 p.m.'}>11:30 p.m.</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box className={classes.hours}>
          <FormControl variant="outlined" className={classes.formControlHours}>
            <Typography
              className={classes.day}
              variant="body1"
              component="p"
              display="inline"
              gutterbottom
            >
              Saturday
            </Typography>
            <Hidden xsUp>
              <InputLabel id="saturday-open">Saturday open</InputLabel>
            </Hidden>
            <Select
              labelId="saturday-open"
              className={classes.formFieldHours}
              id="saturday-open"
              name="saturday_open"
              onChange={handleInputChange}
              defaultValue={row.saturday_open ? row.saturday_open : ``}
            >
              <MenuItem value="closed">
                <em>Closed</em>
              </MenuItem>
              <MenuItem value={'12:00 a.m.'}>12:00 a.m.</MenuItem>
              <MenuItem value={'12:30 a.m.'}>12:30 a.m.</MenuItem>
              <MenuItem value={'1:00 a.m.'}>1:00 a.m.</MenuItem>
              <MenuItem value={'1:30 a.m.'}>1:30 a.m.</MenuItem>
              <MenuItem value={'2:00 a.m.'}>2:00 a.m.</MenuItem>
              <MenuItem value={'2:30 a.m.'}>2:30 a.m.</MenuItem>
              <MenuItem value={'3:00 a.m.'}>3:00 a.m.</MenuItem>
              <MenuItem value={'3:30 a.m.'}>3:30 a.m.</MenuItem>
              <MenuItem value={'4:00 a.m.'}>4:00 a.m.</MenuItem>
              <MenuItem value={'4:30 a.m.'}>4:30 a.m.</MenuItem>
              <MenuItem value={'5:00 a.m.'}>5:00 a.m.</MenuItem>
              <MenuItem value={'5:30 a.m.'}>5:30 a.m.</MenuItem>
              <MenuItem value={'6:00 a.m.'}>6:00 a.m.</MenuItem>
              <MenuItem value={'6:30 a.m.'}>6:30 a.m.</MenuItem>
              <MenuItem value={'7:00 a.m.'}>7:00 a.m.</MenuItem>
              <MenuItem value={'7:30 a.m.'}>7:30 a.m.</MenuItem>
              <MenuItem value={'8:00 a.m.'}>8:00 a.m.</MenuItem>
              <MenuItem value={'8:30 a.m.'}>8:30 a.m.</MenuItem>
              <MenuItem value={'9:00 a.m.'}>9:00 a.m.</MenuItem>
              <MenuItem value={'9:30 a.m.'}>9:30 a.m.</MenuItem>
              <MenuItem value={'10:00 a.m.'}>10:00 a.m.</MenuItem>
              <MenuItem value={'10:30 a.m.'}>10:30 a.m.</MenuItem>
              <MenuItem value={'11:00 a.m.'}>11:00 a.m.</MenuItem>
              <MenuItem value={'11:30 a.m.'}>11:30 a.m.</MenuItem>
              <MenuItem value={'12:00 p.m.'}>12:00 p.m.</MenuItem>
              <MenuItem value={'12:30 p.m.'}>12:30 p.m.</MenuItem>
              <MenuItem value={'1:00 p.m.'}>1:00 p.m.</MenuItem>
              <MenuItem value={'1:30 p.m.'}>1:30 p.m.</MenuItem>
              <MenuItem value={'2:00 p.m.'}>2:00 p.m.</MenuItem>
              <MenuItem value={'2:30 p.m.'}>2:30 p.m.</MenuItem>
              <MenuItem value={'3:00 p.m.'}>3:00 p.m.</MenuItem>
              <MenuItem value={'3:30 p.m.'}>3:30 p.m.</MenuItem>
              <MenuItem value={'4:00 p.m.'}>4:00 p.m.</MenuItem>
              <MenuItem value={'4:30 p.m.'}>4:30 p.m.</MenuItem>
              <MenuItem value={'5:00 p.m.'}>5:00 p.m.</MenuItem>
              <MenuItem value={'5:30 p.m.'}>5:30 p.m.</MenuItem>
              <MenuItem value={'6:00 p.m.'}>6:00 p.m.</MenuItem>
              <MenuItem value={'6:30 p.m.'}>6:30 p.m.</MenuItem>
              <MenuItem value={'7:00 p.m.'}>7:00 p.m.</MenuItem>
              <MenuItem value={'7:30 p.m.'}>7:30 p.m.</MenuItem>
              <MenuItem value={'8:00 p.m.'}>8:00 p.m.</MenuItem>
              <MenuItem value={'8:30 p.m.'}>8:30 p.m.</MenuItem>
              <MenuItem value={'9:00 p.m.'}>9:00 p.m.</MenuItem>
              <MenuItem value={'9:30 p.m.'}>9:30 p.m.</MenuItem>
              <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
              <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
              <MenuItem value={'11:00 p.m.'}>11:00 p.m.</MenuItem>
              <MenuItem value={'11:30 p.m.'}>11:30 p.m.</MenuItem>
            </Select>
          </FormControl>
          <FormControl variant="outlined" className={classes.formControlHours}>
            <Typography
              variant="body1"
              component="p"
              display="inline"
              gutterbottom
            >
              to
            </Typography>
            <Hidden xsUp>
              <InputLabel id="saturday-close">Saturday close</InputLabel>
            </Hidden>
            <Select
              labelId="saturday-close"
              className={classes.formFieldHours}
              id="saturday-close"
              name="saturday_close"
              onChange={handleInputChange}
              defaultValue={row.saturday_close ? row.saturday_close : ``}
            >
              <MenuItem value="closed">
                <em>Closed</em>
              </MenuItem>
              <MenuItem value={'12:00 a.m.'}>12:00 a.m.</MenuItem>
              <MenuItem value={'12:30 a.m.'}>12:30 a.m.</MenuItem>
              <MenuItem value={'1:00 a.m.'}>1:00 a.m.</MenuItem>
              <MenuItem value={'1:30 a.m.'}>1:30 a.m.</MenuItem>
              <MenuItem value={'2:00 a.m.'}>2:00 a.m.</MenuItem>
              <MenuItem value={'2:30 a.m.'}>2:30 a.m.</MenuItem>
              <MenuItem value={'3:00 a.m.'}>3:00 a.m.</MenuItem>
              <MenuItem value={'3:30 a.m.'}>3:30 a.m.</MenuItem>
              <MenuItem value={'4:00 a.m.'}>4:00 a.m.</MenuItem>
              <MenuItem value={'4:30 a.m.'}>4:30 a.m.</MenuItem>
              <MenuItem value={'5:00 a.m.'}>5:00 a.m.</MenuItem>
              <MenuItem value={'5:30 a.m.'}>5:30 a.m.</MenuItem>
              <MenuItem value={'6:00 a.m.'}>6:00 a.m.</MenuItem>
              <MenuItem value={'6:30 a.m.'}>6:30 a.m.</MenuItem>
              <MenuItem value={'7:00 a.m.'}>7:00 a.m.</MenuItem>
              <MenuItem value={'7:30 a.m.'}>7:30 a.m.</MenuItem>
              <MenuItem value={'8:00 a.m.'}>8:00 a.m.</MenuItem>
              <MenuItem value={'8:30 a.m.'}>8:30 a.m.</MenuItem>
              <MenuItem value={'9:00 a.m.'}>9:00 a.m.</MenuItem>
              <MenuItem value={'9:30 a.m.'}>9:30 a.m.</MenuItem>
              <MenuItem value={'10:00 a.m.'}>10:00 a.m.</MenuItem>
              <MenuItem value={'10:30 a.m.'}>10:30 a.m.</MenuItem>
              <MenuItem value={'11:00 a.m.'}>11:00 a.m.</MenuItem>
              <MenuItem value={'11:30 a.m.'}>11:30 a.m.</MenuItem>
              <MenuItem value={'12:00 p.m.'}>12:00 p.m.</MenuItem>
              <MenuItem value={'12:30 p.m.'}>12:30 p.m.</MenuItem>
              <MenuItem value={'1:00 p.m.'}>1:00 p.m.</MenuItem>
              <MenuItem value={'1:30 p.m.'}>1:30 p.m.</MenuItem>
              <MenuItem value={'2:00 p.m.'}>2:00 p.m.</MenuItem>
              <MenuItem value={'2:30 p.m.'}>2:30 p.m.</MenuItem>
              <MenuItem value={'3:00 p.m.'}>3:00 p.m.</MenuItem>
              <MenuItem value={'3:30 p.m.'}>3:30 p.m.</MenuItem>
              <MenuItem value={'4:00 p.m.'}>4:00 p.m.</MenuItem>
              <MenuItem value={'4:30 p.m.'}>4:30 p.m.</MenuItem>
              <MenuItem value={'5:00 p.m.'}>5:00 p.m.</MenuItem>
              <MenuItem value={'5:30 p.m.'}>5:30 p.m.</MenuItem>
              <MenuItem value={'6:00 p.m.'}>6:00 p.m.</MenuItem>
              <MenuItem value={'6:30 p.m.'}>6:30 p.m.</MenuItem>
              <MenuItem value={'7:00 p.m.'}>7:00 p.m.</MenuItem>
              <MenuItem value={'7:30 p.m.'}>7:30 p.m.</MenuItem>
              <MenuItem value={'8:00 p.m.'}>8:00 p.m.</MenuItem>
              <MenuItem value={'8:30 p.m.'}>8:30 p.m.</MenuItem>
              <MenuItem value={'9:00 p.m.'}>9:00 p.m.</MenuItem>
              <MenuItem value={'9:30 p.m.'}>9:30 p.m.</MenuItem>
              <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
              <MenuItem value={'10:00 p.m.'}>10:00 p.m.</MenuItem>
              <MenuItem value={'11:00 p.m.'}>11:00 p.m.</MenuItem>
              <MenuItem value={'11:30 p.m.'}>11:30 p.m.</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <div className={classes.saveButtonContainer}>
          <Button
            type="submit"
            label="Save"
            onClick={handleSubmit}
            className={classes.saveButton}
            variant="contained"
            disableElevation
            color="primary"
            primary="true"
          >
            Save
          </Button>
        </div>
      </Box>
    </Dialog>
  );
}

EditLibrary.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  row: PropTypes.object.isRequired,
};
