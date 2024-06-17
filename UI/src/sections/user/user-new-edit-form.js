import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
// utils
import { fData } from 'src/utils/format-number';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// assets
import { countries } from 'src/assets/data';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSwitch,
  RHFTextField,
  RHFUploadAvatar,
  RHFAutocomplete,
  RHFSelect,
} from 'src/components/hook-form';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import { MenuItem } from '@mui/material';
import { color } from 'framer-motion';
import axiosInstance from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';
import { states } from 'src/utils/constants';

// ----------------------------------------------------------------------

const classes = {
  labelStyle: {
    '&.react-tel-input .special-label': {
      color: 'red !important',
    },
  },
};
export default function UserNewEditForm({ currentUser }) {
  const router = useRouter();

  const { user: userData } = useAuthContext();

  const isAdmin = userData ? userData.permissions.includes('super_admin') : false;

  const { enqueueSnackbar } = useSnackbar();

  const days = Array.from({ length: 31 }, (_, i) => ({
    value: (i + 1).toString(),
    name: (i + 1).toString(),
  }));

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
      isActive: currentUser?.isActive || true,
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
  console.log(errors);
  const values = watch();
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
        userType: formData.userType,
        shgName: formData.shgName,
        investmentType: formData.investmentType,
        emiStartDate: formData.emiStartDate,
        emiAmount: formData.emiAmount,
        emiDate: formData.emiDate,
      };
      if (formData.avatarUrl) {
        inputData.avatar = {
          fileUrl: formData.avatarUrl,
        };
      }
      if (!currentUser) {
        inputData.phoneNumber = `+${formData.phoneNumber}`;
        await axiosInstance.post('/register', inputData);
      } else {
        inputData.phoneNumber = formData.phoneNumber;
        await axiosInstance.patch(`/api/users/${currentUser.id}`, inputData);
      }
      reset();
      enqueueSnackbar(currentUser ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.user.list);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
    }
  });

  const handleDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];

      // const newFile = Object.assign(file, {
      //   preview: URL.createObjectURL(file),
      // });

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axiosInstance.post('/files', formData);
        const { data } = response;
        console.log(data);
        setValue('avatarUrl', data?.files[0].fileUrl, {
          shouldValidate: true,
        });
      }
    },
    [setValue]
  );

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

  console.log(values);

  useEffect(() => {
    if (values.investmentType === 'bankLoan') {
      setValidationSchema((prevSchema) =>
        prevSchema.concat(
          Yup.object().shape({
            emiStartDate: Yup.string().required('Emi Start date is required'),
            emiAmount: Yup.string().required('Emi Amount date is required'),
            emiDate: Yup.string().required('Emi Date is required'),
          })
        )
      );
    } else {
      setValidationSchema((prevSchema) =>
        prevSchema.concat(
          Yup.object().shape({
            emiStartDate: Yup.string(),
            emiAmount: Yup.string(),
            emiDate: Yup.string(),
          })
        )
      );
    }
  }, [values.investmentType]);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ pt: 10, pb: 5, px: 3 }}>
            {currentUser && (
              <Label
                color={(values.isActive && 'success') || (!values.isActive && 'error') || 'warning'}
                sx={{ position: 'absolute', top: 24, right: 24 }}
              >
                {values.isActive ? 'Active' : 'In-Active'}
              </Label>
            )}

            <Box sx={{ mb: 5 }}>
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
            </Box>
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

            <Stack alignItems="center" sx={{ mt: 3 }}>
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
                {!currentUser ? 'Create User' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

UserNewEditForm.propTypes = {
  currentUser: PropTypes.object,
};
