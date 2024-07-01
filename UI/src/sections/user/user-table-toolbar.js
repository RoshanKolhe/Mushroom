import PropTypes from 'prop-types';
import { useCallback, useRef} from 'react'; // Import useRef for file input handling
// @mui
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';
// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import * as XLSX from 'xlsx';
import { HOST_API } from 'src/config-global';
import axiosInstance from 'src/utils/axios';
import { enqueueSnackbar } from 'notistack';
import { states } from 'src/utils/constants';
// ----------------------------------------------------------------------

export const investmentType = [
  {value : 'bankLoan', label : 'Bank Loan'},
  {value : 'selfFinanace', label : 'Self Finance'},
];

export const userType = [
  {value : 'individual', label : 'Individual'},
  {value : 'shg', label : 'SHG (Self Hep Group)'},
];

export default function UserTableToolbar({
  filters,
  onFilters,
  roleOptions,
}) {
  const popover = usePopover();
  const fileInputRef = useRef(null); 

  const handleFilterName = useCallback(
    (event) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const handleFilterRole = useCallback(
    (event) => {
      onFilters(
        'role',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
    },
    [onFilters]
  );

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
  
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
  
      console.log('Parsed JSON data:', jsonData);
  
      const parseDate = (dateString) => {
        // If the dateString is a number (Excel serial number), convert it
        if (!Number.isNaN(dateString) && typeof dateString === 'number') {
          const utc_days = Math.floor(dateString - 25569);
          const utc_value = utc_days * 86400; // 86400 seconds in a day
          const date_info = new Date(utc_value * 1000);
          return new Date(date_info.getUTCFullYear(), date_info.getUTCMonth(), date_info.getUTCDate());
        }
        // Otherwise, parse it as a standard date string
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) {
          // If date is invalid, return null
          return null;
        }
        return date;
      };
  
      const stateMap = states.reduce((map, state) => {
        map[state.name.toLowerCase()] = state.id;
        return map;
      }, {});
  
      const userMap = userType.reduce((map, state) => {
        map[state.label.toLowerCase()] = state.value;
        return map;
      }, {});
  
      const investmentMap = investmentType.reduce((map, state) => {
        map[state.label.toLowerCase()] = state.value;
        return map;
      }, {});
  
      // Set for unique phone numbers and emails
      const uniquePhoneNumbers = new Set();
      const uniqueEmails = new Set();
  
      const newData = jsonData.map((item) => {
        const email = item.email || '';
        let phoneNumber = String(item.phoneNumber);
        const countryCode = String(item.countryCode);
        phoneNumber = `+${countryCode}${phoneNumber}`;
        const stateId = stateMap[item.state] || '';
        const userTypeId = item.userType && userMap[item.userType.toLowerCase()] || '';
        const investmentTypeId = item.investmentType && investmentMap[item.investmentType.toLowerCase()] || '';
        const dob = parseDate(item.dob);
        const emiStartDate = parseDate(item.emiStartDate);
  
        return {
          firstName: item.firstName,
          lastName: item.lastName,
          gender: item.gender,
          dob: dob || '',
          fullAddress: item.fullAddress,
          city: item.city,
          state: String(stateId),
          email,
          phoneNumber,
          permissions: Array(String(item.permissions)),
          shgName: String(item.shgName) || '',
          userType: String(userTypeId),
          investmentType: String(investmentTypeId),
          emiStartDate: emiStartDate || '',
          emiDate: String(item.emiDate) || '',
          emiAmount: String(item.emiAmount) || '',
        };
      }).filter((item) => {
        const email = item.email;
        const phoneNumber = item.phoneNumber;
  
        // Validate phone number (must be 10 digits and treated as a string)
        const isPhoneNumberValid = /^\+(?:[0-9] ?){6,14}[0-9]$/.test(phoneNumber);
  
        // Validate email (if present)
        const isEmailValid = email === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
        // Check for unique phone numbers and emails
        const isPhoneNumberUnique = !uniquePhoneNumbers.has(phoneNumber);
        const isEmailUnique = email === '' || !uniqueEmails.has(email);
  
        if (isPhoneNumberValid && isEmailValid && isPhoneNumberUnique && isEmailUnique) {
          uniquePhoneNumbers.add(phoneNumber);
          if (email !== '') uniqueEmails.add(email);
          return true;
        }
        return false;
      });
  
      console.log('Filtered data', newData);
  
      // Ensure the POST request is sent after setting the state
      if (newData.length !== 0) {
        try {
          const response = await axiosInstance.post('/multiple-register', newData);
          enqueueSnackbar('Users Created', { variant: 'success' });
        } catch (error) {
          console.error(error);
          enqueueSnackbar(
            typeof error === 'string' ? error : error.response?.data?.error?.message || 'Failed to create users',
            { variant: 'error' }
          );
        }
      } else {
        enqueueSnackbar('No valid data to upload', { variant: 'warning' });
      }
    };
  
    reader.readAsArrayBuffer(file);
  };
  
  

  const downloadTemplate = () => {
    const templateURL = `${HOST_API}/files/20240701T100450280Z_Template (8).xlsx`;
    const link = document.createElement('a');
    link.href = templateURL;
    link.download = 'Template.xlsx';
    link.click();
  };


  return (
    <>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{
          xs: 'column',
          md: 'row',
        }}
        sx={{
          p: 2.5,
          pr: { xs: 2.5, md: 1 },
        }}
      >
        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 200 },
          }}
        >
          <InputLabel>Role</InputLabel>

          <Select
            multiple
            value={filters.role}
            onChange={handleFilterRole}
            input={<OutlinedInput label="Role" />}
            renderValue={(selected) => selected.map((value) => value).join(', ')}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {roleOptions.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox disableRipple size="small" checked={filters.role.includes(option)} />
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={filters.name}
            onChange={handleFilterName}
            placeholder="Search..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />

          <IconButton onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>

          {/* Hidden file input for uploading */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            onChange={handleFileUpload}
          />
        </Stack>
      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 200 }}
      >
        {/* <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:printer-minimalistic-bold" />
          Print
        </MenuItem> */}

        <MenuItem
          onClick={() => {
            popover.onClose();
            fileInputRef.current.click(); // Trigger file input click on import menu item
          }}
        >
          <Iconify icon="solar:import-bold" />
          Import
        </MenuItem>

        <MenuItem
          onClick={() => {
            downloadTemplate();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:export-bold" />
          Excel Data Format
        </MenuItem>
      </CustomPopover>
    </>
  );
}

UserTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  roleOptions: PropTypes.array,
};
