import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
import axiosInstance from 'src/utils/axios';
// ----------------------------------------------------------------------

export default function TicketQuickEditForm({ currentTicket, open, onClose, onRefreshTickets }) {
  const { enqueueSnackbar } = useSnackbar();

  const NewTicketSchema = Yup.object().shape({
    query: Yup.string().required('Query is required'),
    description: Yup.string().required('Description is required'),
    status: Yup.string(),
  });

  const defaultValues = useMemo(
    () => ({
      query: currentTicket?.query || '',
      description: currentTicket?.description || '',
      status: currentTicket?.status || '',
    }),
    [currentTicket]
  );

  const methods = useForm({
    resolver: yupResolver(NewTicketSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      console.log(data);
      const inputData = {
        query: data.query,
        description: data.description,
        status: data.status,
      };
      await axiosInstance.patch(`/tickets/${currentTicket.id}`, inputData);
      // reset();
      onRefreshTickets();
      onClose();
      enqueueSnackbar('Update success!');
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 720 },
      }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Quick Update</DialogTitle>

        <DialogContent>
          <Box
            mt={2}
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
          >
            <RHFSelect name="status" label="Status">
              {[
                { value: 'open', label: 'Open' },
                { value: 'closed', label: 'Closed' },
                { value: 'rejected', label: 'Rejected' },
              ].map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </RHFSelect>

            <Box sx={{ display: { xs: 'none', sm: 'block' } }} />
            <RHFTextField name="query" label="Query" disabled />

            <RHFTextField name="description" label="Description" disabled />
          </Box>
        </DialogContent>

        <DialogActions sx={{ display: 'flex', justifyContent: 'center !important' }}>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
            style={{
              backgroundColor: '#00554E',
              width: '160px',
              height: '40px',
            }}
          >
            Update
          </LoadingButton>
          <Button
            variant="outlined"
            onClick={onClose}
            style={{
              width: '160px',
              height: '40px',
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

TicketQuickEditForm.propTypes = {
  currentTicket: PropTypes.object,
  onClose: PropTypes.func,
  onRefreshTickets: PropTypes.func,
  open: PropTypes.bool,
};
