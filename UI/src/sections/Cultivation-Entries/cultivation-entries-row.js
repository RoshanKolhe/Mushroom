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
import CultivationQuickEditForm from './cultivation-quick-edit-form';
//

// ----------------------------------------------------------------------

export default function CultivationEntryTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onRefreshCultivations,
  isAdmin,
}) {
  const {mushroomType,  hut, quantity, moisture, temprature, changedColor, longitude, latitude, date, time } = row;

  const {name} = hut;
  const confirm = useBoolean();


  const { name: mushroomTypeName } = mushroomType;
  
  const quickEdit = useBoolean();


  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        {/* <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell> */}

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{mushroomTypeName}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{name}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{quantity}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{moisture}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{temprature}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{changedColor}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{longitude}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{latitude}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{date}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{time}</TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          {isAdmin ? (
            <>
              <Tooltip title="Quick Edit" placement="top" arrow>
                <IconButton
                  color={quickEdit.value ? 'inherit' : 'default'}
                  onClick={quickEdit.onTrue}
                >
                  <Iconify icon="solar:pen-bold" />
                </IconButton>
              </Tooltip>
              <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
                <Iconify icon="eva:more-vertical-fill" />
              </IconButton>
            </>
          ) : null}
        </TableCell>
      </TableRow>

      <CultivationQuickEditForm
        currentCultivationEntry={row}
        open={quickEdit.value}
        onClose={quickEdit.onFalse}
        onRefreshCultivationEntry={onRefreshCultivations}
      />

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

CultivationEntryTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onRefreshCultivations: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  isAdmin: PropTypes.bool,
};
