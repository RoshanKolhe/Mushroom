import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
// hooks
import { useMockedUser } from 'src/hooks/use-mocked-user';
// utils
import { fData } from 'src/utils/format-number';
// assets
import { countries } from 'src/assets/data';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSwitch,
  RHFTextField,
  RHFUploadAvatar,
  RHFAutocomplete,
  RHFSelect,
} from 'src/components/hook-form';
import axiosInstance, { endpoints } from 'src/utils/axios';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import { MenuItem } from '@mui/material';

// ----------------------------------------------------------------------

export default function AccountGeneral() {
  const { enqueueSnackbar } = useSnackbar();
  const [user, setUser] = useState();

  const UpdateUserSchema = Yup.object().shape({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    phoneNumber: Yup.string().required('Phone number is required'),
    role: Yup.string().required('Role is required'),
    gender: Yup.string().required('Role is required'),
    isActive: Yup.boolean(),
    dob: Yup.string().required('Date is required'),
    fullAddress: Yup.string().required('Role is required'),
    city: Yup.string().required('Role is required'),
    state: Yup.string().required('Role is required'),

  });

  const defaultValues = useMemo(
    () => ({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      role: user?.permissions[0] || '',
      dob: user?.dob || '',
      gender: user?.gender || '',
      email: user?.email || '',
      isActive: user?.isActive || true,
      avatarUrl: user?.avatar?.fileUrl || null,
      phoneNumber: user?.phoneNumber || '',
      fullAddress: user?.fullAddress || '',
      city: user?.city || '',
      state: user?.state || '',
    }),
    [user]
  );

  const methods = useForm({
    resolver: yupResolver(UpdateUserSchema),
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

  const onSubmit = handleSubmit(async (formData) => {
    try {
      console.log(formData);
      const inputData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        permissions: [formData.role],
        email: formData.email,
        isActive: formData.isActive,
        gender: formData.gender,
        dob: formData.dob,
        fullAddress: formData.fullAddress,
        city: formData.city,
        state: formData.state,
      };
      if (formData.avatarUrl) {
        inputData.avatar = {
          fileUrl: formData.avatarUrl,
        };
      }
      await axiosInstance.patch(`/api/users/${user.id}`, inputData);
      enqueueSnackbar(user ? 'Update success!' : 'Create success!');
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
    }
  });

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('photoURL', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const getCurrentUser = async () => {
    try {
      const response = await axiosInstance.get(endpoints.auth.me);

      const userData = response.data;
      setUser(userData);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
    }
  };

  useEffect(() => {
    if (user) {
      console.log(defaultValues);
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues, reset]);

  useEffect(() => {
    getCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ pt: 10, pb: 5, px: 3, textAlign: 'center' }}>
            <RHFUploadAvatar
              name="avatarUrl"
              maxSize={3145728}
              onDrop={handleDrop}
              helperText={
                <Typography
                  variant="caption"
                  sx={{
                    mt: 3,
                    mx: 'auto',
                    display: 'block',
                    textAlign: 'center',
                    color: 'text.disabled',
                  }}
                >
                  Allowed *.jpeg, *.jpg, *.png, *.gif
                  <br /> max size of {fData(3145728)}
                </Typography>
              }
            />
          </Card>
        </Grid>

        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="firstName" label="First Name" />
              <RHFTextField name="lastName" label="Last Name" />
              <RHFTextField name="email" label="Email Address" />
              <div>
                <Controller
                  name="phoneNumber"
                  control={methods.control}
                  render={({ field }) => (
                    <>
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
                          border: errors.phoneNumber ? '1px solid red' : '1px solid #ced4da',
                        }}
                        containerStyle={
                          errors.phoneNumber ? { color: 'red' } : { color: '#637381' }
                        }
                        disabled
                      />
                      {errors.phoneNumber && (
                        <Box
                          sx={{
                            color: '#FF5630',
                            fontSize: '0.75rem',
                            marginTop: '8px',
                            marginRight: '14px',
                            marginLeft: '14px',
                          }}
                        >
                          {errors.phoneNumber.message}
                        </Box>
                      )}
                    </>
                  )}
                />
              </div>
              <RHFSelect fullWidth name="role" label="Role" disabled>
                {[
                  { value: 'super_admin', name: 'Super Admin' },
                  { value: 'hut_admin', name: 'Hut Admin' },
                  { value: 'cluster_admin', name: 'Cluster Admin' },
                ].map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.name}
                  </MenuItem>
                ))}
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
              <RHFTextField name="fullAddress" label="Full Address" />
              <RHFTextField name="state" label="State" />
              <RHFTextField name="city" label="City" />
              
            </Box>

            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
                style={{
                  backgroundColor: '#00554E',
                  width: '250px',
                  height: '40px',
                  marginTop: '20px',
                }}
              >
                Save Changes
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
