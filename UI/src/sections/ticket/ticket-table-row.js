import PropTypes from 'prop-types';
// @mui
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
//
import { Typography } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';

// ----------------------------------------------------------------------

export default function TicketTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onQuickEdit,
}) {
  const { ticketId, query, description, status, user } = row;

  const confirm = useBoolean();
  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{`#${ticketId}`}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{`${user?.firstName} ${
          user?.lastName ? user?.lastName : ''
        }`}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Tooltip title={query} placement="top" arrow>
            <Typography
              variant="subtitle2"
              component="span"
              sx={{
                display: 'block',
                alignItems: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                width: 200,
              }}
            >
              {query}
            </Typography>
          </Tooltip>
        </TableCell>
        <TableCell>
          <Tooltip title={description} placement="top" arrow>
            <Typography
              variant="subtitle2"
              component="span"
              sx={{
                display: 'block',
                alignItems: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                width: 200,
              }}
            >
              {description}
            </Typography>
          </Tooltip>
        </TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={
              (status === 'open' && 'warning') ||
              (status === 'closed' && 'success') ||
              (status === 'rejected' && 'error') ||
              'default'
            }
          >
            {status}
          </Label>
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Quick Edit" placement="top" arrow>
            <IconButton color="default" onClick={() => onQuickEdit(row)}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
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

TicketTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onQuickEdit: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
