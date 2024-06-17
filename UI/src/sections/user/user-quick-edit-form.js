import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useEffect, useMemo, useState } from 'react';
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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import DialogContent from '@mui/material/DialogContent';
// _mock
import { USER_STATUS_OPTIONS } from 'src/_mock';
import PhoneInput from 'react-phone-input-2';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
import axiosInstance from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';
import { states } from 'src/utils/constants';

// ----------------------------------------------------------------------

export default function UserQuickEditForm({ currentUser, open, onClose, onRefreshUsers }) {
  const { enqueueSnackbar } = useSnackbar();

  const days = Array.from({ length: 31 }, (_, i) => ({
    value: (i + 1).toString(),
    name: (i + 1).toString(),
  }));

  const { user: userData } = useAuthContext();

  const isAdmin = userData ? userData.permissions.includes('super_admin') : false;

  const [validationSchema, setValidationSchema] = useState(
    Yup.object().shape({
      firstName: Yup.string().required('First Name is required'),
      lastName: Yup.string().required('Last Name is required'),
      email: Yup.string().email('Email must be a valid email address'),
      phoneNumber: Yup.string().required('Phone number is required'),
      role: Yup.string().required('Role is required'),
      gender: Yup.string().required('Gender is required'),
      isActive: Yup.boolean(),
      dob: Yup.string().required('Date is required'),
      fullAddress: Yup.string().required('Full Address is required'),
      city: Yup.string().required('City is required'),
      state: Yup.string().required('State is required'),
      userType: Yup.string(),
      investmentType: Yup.string(),
      shgName: Yup.string(),
      emiStartDate: Yup.string(),
      emiAmount: Yup.string(),
      emiDate: Yup.string(),
    })
  );

  const defaultValues = useMemo(
    () => ({
      firstName: currentUser?.firstName || '',
      lastName: currentUser?.lastName || '',
      role: currentUser?.permissions[0] || '',
      dob: currentUser?.dob || '',
      gender: currentUser?.gender || '',
      email: currentUser?.email || '',
      isActive: currentUser?.isActive ? '1' : '0' || '',
      avatarUrl: currentUser?.avatar?.fileUrl || null,
      phoneNumber: currentUser?.phoneNumber || '',
      fullAddress: currentUser?.fullAddress || '',
      city: currentUser?.city || '',
      state: currentUser?.state || '',
      shgName: currentUser?.shgName || '',
      userType: currentUser?.userType || '',
      investmentType: currentUser?.investmentType || '',
      emiStartDate: currentUser?.emiStartDate || '',
      emiAmount: currentUser?.emiAmount || '',
      emiDate: currentUser?.emiDate || '',
    }),
    [currentUser]
  );

  const methods = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      console.log(data);
      const inputData = {
        firstName: data.firstName,
        lastName: data.lastName,
        permissions: [data.role],
        email: data.email,
        isActive: data.isActive,
        gender: data.gender,
        dob: data.dob,
        fullAddress: data.fullAddress,
        city: data.city,
        state: data.state,
        userType: data.userType,
        shgName: data.shgName,
        investmentType: data.investmentType,
        emiStartDate: data.emiStartDate,
        emiAmount: data.emiAmount,
        emiDate: data.emiDate,
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

  useEffect(() => {
    if (currentUser) {
      reset(defaultValues);
    }
  }, [currentUser, defaultValues, reset]);

  useEffect(() => {
    if (values.userType === 'shg') {
      setValidationSchema((prevSchema) =>
        prevSchema.concat(
          Yup.object().shape({ shgName: Yup.string().required('SHG Name is required') })
        )
      );
    } else {
      setValidationSchema((prevSchema) =>
        prevSchema.concat(Yup.object().shape({ shgName: Yup.string() }))
      );
    }

    if (values.role !== 'hut_user') {
      console.log('here');
      setValidationSchema((prevSchema) =>
        prevSchema.concat(
          Yup.object().shape({
            email: Yup.string()
              .required('Email is required')
              .email('Email must be a valid email address'),
            userType: Yup.string(),
            investmentType: Yup.string(),
          })
        )
      );
    } else {
      setValidationSchema((prevSchema) =>
        prevSchema.concat(
          Yup.object().shape({
            email: Yup.string().email('Email must be a valid email address'),
            userType: Yup.string().required('User Type is required'),
            investmentType: Yup.string().required('Investment Type is required'),
          })
        )
      );
    }
  }, [values.userType, values.role]);

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

            <RHFTextField name="firstName" label="First Name" />
            <RHFTextField name="lastName" label="Last Name" />
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
                  />
                )}
              />
            </div>

            <RHFSelect fullWidth name="role" label="Role">
              {[
                { value: 'hut_user', name: 'Hut User' },
                { value: 'cluster_admin', name: 'Cluster Admin' },
                { value: 'group_admin', name: 'Group Admin' },
              ].map((option) => {
                if (option.value === 'cluster_admin' && isAdmin) {
                  return (
                    <MenuItem key={option.value} value={option.value}>
                      {option.name}
                    </MenuItem>
                  );
                }
                return (
                  <MenuItem key={option.value} value={option.value}>
                    {option.name}
                  </MenuItem>
                );
              })}
            </RHFSelect>
            <RHFSelect fullWidth name="gender" label="Gender">
              {[
                { value: 'male', name: 'Male' },
                { value: 'female', name: 'Female' },
                { value: 'other', name: 'Other' },
              ].map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.name}
                </MenuItem>
              ))}
            </RHFSelect>
            <Controller
              name="dob"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  label="DOB"
                  value={new Date(field.value)}
                  onChange={(newValue) => {
                    field.onChange(newValue);
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!error,
                      helperText: error?.message,
                    },
                  }}
                />
              )}
            />
            {values.role === 'hut_user' ? (
              <RHFSelect fullWidth name="userType" label="User Type">
                {[
                  { value: 'individual', name: 'Individual' },
                  { value: 'shg', name: 'SHG ( Self Hep Group)' },
                ].map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.name}
                  </MenuItem>
                ))}
              </RHFSelect>
            ) : null}
            {values.userType === 'shg' ? <RHFTextField name="shgName" label="SHG Name" /> : null}
            {values.role === 'hut_user' ? (
              <RHFSelect fullWidth name="investmentType" label="Investment Type">
                {[
                  { value: 'bankLoan', name: 'Bank Loan' },
                  { value: 'selfFinanace', name: 'Self Finance' },
                ].map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.name}
                  </MenuItem>
                ))}
              </RHFSelect>
            ) : null}
            {values.investmentType === 'bankLoan' ? (
              <>
                <Controller
                  name="emiStartDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      label="EMI Start Date"
                      value={new Date(field.value)}
                      onChange={(newValue) => {
                        field.onChange(newValue);
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!error,
                          helperText: error?.message,
                        },
                      }}
                    />
                  )}
                />
                <RHFTextField name="emiAmount" label="Emi Amount" />
                <RHFSelect fullWidth name="emiDate" label="Emi Date">
                  {days.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.name}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </>
            ) : null}
            <RHFTextField name="fullAddress" label="Full Address" />
            <RHFTextField name="city" label="City" />
            <RHFSelect fullWidth name="state" label="State">
              {states.map((option) => (
                <MenuItem key={option.id} value={option.id}>
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
