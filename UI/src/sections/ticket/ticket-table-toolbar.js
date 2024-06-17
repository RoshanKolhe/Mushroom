import PropTypes from 'prop-types';
import { useCallback } from 'react';
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
import { Button, Typography } from '@mui/material';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

export default function TicketTableToolbar({ isDashboard, filters, onFilters, statusOptions }) {
  const popover = usePopover();

  const handleFilterName = useCallback(
    (event) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const handleFilterStatus = useCallback(
    (event) => {
      onFilters(
        'status',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
    },
    [onFilters]
  );

  return (
    <>
      {!isDashboard ? (
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
              <InputLabel>Status</InputLabel>

              <Select
                multiple
                value={filters.status}
                onChange={handleFilterStatus}
                input={<OutlinedInput label="Status" />}
                renderValue={(selected) => selected.map((value) => value).join(', ')}
                MenuProps={{
                  PaperProps: {
                    sx: { maxHeight: 240 },
                  },
                }}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    <Checkbox
                      disableRipple
                      size="small"
                      checked={filters.status.includes(option)}
                    />
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

              {/* <IconButton onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton> */}
            </Stack>
          </Stack>
          <CustomPopover
            open={popover.open}
            onClose={popover.onClose}
            arrow="right-top"
            sx={{ width: 140 }}
          >
            <MenuItem
              onClick={() => {
                popover.onClose();
              }}
            >
              <Iconify icon="solar:printer-minimalistic-bold" />
              Print
            </MenuItem>

            <MenuItem
              onClick={() => {
                popover.onClose();
              }}
            >
              <Iconify icon="solar:import-bold" />
              Import
            </MenuItem>

            <MenuItem
              onClick={() => {
                popover.onClose();
              }}
            >
              <Iconify icon="solar:export-bold" />
              Export
            </MenuItem>
          </CustomPopover>
        </>
      ) : (
        <Stack
          spacing={2}
          direction={{
            xs: 'row',
            md: 'row',
          }}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            p: 2.5,
            pr: { xs: 2.5, md: 1 },
          }}
        >
          <Typography variant="h5" style={{ display: 'flex', alignItems: 'center' }}>
            Open Tickets List
          </Typography>
          <Button
            component={RouterLink}
            href={paths.dashboard.ticket.list}
            variant="contained"
            startIcon={<Iconify icon="carbon:download" />}
            color="primary"
            style={{
              backgroundColor: 'transparent',
              color: '#212B36',
              border: 'solid 1px #00554E',
            }}
          >
            View more
          </Button>
        </Stack>
      )}
    </>
  );
}

TicketTableToolbar.propTypes = {
  filters: PropTypes.object,
  isDashboard: PropTypes.any,
  onFilters: PropTypes.func,
  statusOptions: PropTypes.array,
};
