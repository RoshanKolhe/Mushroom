import PropTypes from 'prop-types';
// @mui
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
import moment from 'moment';

//

// ----------------------------------------------------------------------

export default function MissedEntryTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onRefreshHuts,
  isAdmin,
}) {
  const { hutDetails, date } = row;

  const formatDate = (dateString) => moment(dateString).format('DD-MM-YYYY');

  const confirm = useBoolean();

  const quickEdit = useBoolean();

  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        {/* <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell> */}

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{hutDetails?.name}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{`${hutDetails?.user?.firstName} ${
          hutDetails?.user?.lastName ? hutDetails?.user?.lastName : ''
        }`}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{hutDetails?.cluster?.name}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(date)}</TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        {/* <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem> */}

        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
}

MissedEntryTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onRefreshHuts: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  isAdmin: PropTypes.bool,
};
