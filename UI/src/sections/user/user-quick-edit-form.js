import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
// _mock
import { USER_STATUS_OPTIONS } from 'src/_mock';
import PhoneInput from 'react-phone-input-2';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
import axiosInstance from 'src/utils/axios';

// ----------------------------------------------------------------------

export default function UserQuickEditForm({ currentUser, open, onClose, onRefreshUsers }) {
  console.log(currentUser);
  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    phoneNumber: Yup.string().required('Phone number is required'),
    role: Yup.string().required('Role is required'),
    isActive: Yup.boolean(),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentUser?.fullName || '',
      email: currentUser?.email || '',
      phoneNumber: currentUser?.phoneNumber || '',
      isActive: currentUser?.isActive ? '1' : '0' || '',
      role: currentUser?.permissions[0] || '',
    }),
    [currentUser]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
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
        fullName: data.name,
        permissions: [data.role],
        email: data.email,
        isActive: data.isActive,
      };
      await axiosInstance.patch(`/api/users/${currentUser.id}`, inputData);
      // reset();
      onRefreshUsers();
      onClose();
      enqueueSnackbar('Update success!');
    } catch (error) {
      console.error(error);
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
          {!currentUser.isActive && (
            <Alert variant="outlined" severity="error" sx={{ mb: 3 }}>
              Account is In-Active
            </Alert>
          )}

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
            <RHFSelect name="isActive" label="Status">
              {USER_STATUS_OPTIONS.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </RHFSelect>

            <Box sx={{ display: { xs: 'none', sm: 'block' } }} />

            <RHFTextField name="name" label="Full Name" />
            <RHFTextField name="email" label="Email Address" />
            <div>
              <Controller
                name="phoneNumber"
                control={methods.control}
                render={({ field }) => (
                  <PhoneInput
                    country="in"
                    value={field.value}
                    onChange={(phoneNumber) => field.onChange(phoneNumber)}
                    inputProps={{
                      autoComplete: 'on',
                    }}
                    inputStyle={{
                      width: '100%',
                      height: '50px',
                      border: '1px solid #ced4da',
                    }}
                    disabled
                  />
                )}
              />
            </div>

            <RHFSelect fullWidth name="role" label="Role">
              {[
                { value: 'hut_admin', name: 'Hut Admin' },
                { value: 'cluster_admin', name: 'Cluster Admin' },
              ].map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.name}
                </MenuItem>
              ))}
            </RHFSelect>
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

UserQuickEditForm.propTypes = {
  currentUser: PropTypes.object,
  onClose: PropTypes.func,
  onRefreshUsers: PropTypes.func,
  open: PropTypes.bool,
};
