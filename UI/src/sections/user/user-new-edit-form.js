import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
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

// ----------------------------------------------------------------------

const classes = {
  labelStyle: {
    '&.react-tel-input .special-label': {
      color: 'red !important',
    },
  },
};
export default function UserNewEditForm({ currentUser }) {
  console.log(currentUser);
  const router = useRouter();

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
      role: currentUser?.permissions[0] || '',
      email: currentUser?.email || '',
      isActive: currentUser?.isActive || true,
      avatarUrl: currentUser?.avatar?.fileUrl || null,
      phoneNumber: currentUser?.phoneNumber || '',
    }),
    [currentUser]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
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
  const onSubmit = handleSubmit(async (formData) => {
    try {
      console.log(formData);
      const inputData = {
        fullName: formData.name,
        permissions: [formData.role],
        email: formData.email,
        phoneNumber: `+${formData.phoneNumber}`,
        isActive: formData.isActive,
      };
      if (formData.avatarUrl) {
        inputData.avatar = {
          fileUrl: formData.avatarUrl,
        };
      }
      if (!currentUser) {
        await axiosInstance.post('/register', inputData);
      } else {
        delete inputData.phoneNumber;
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
    console.log(currentUser);
    if (currentUser) {
      console.log(defaultValues);
      reset(defaultValues);
    }
  }, [currentUser, defaultValues, reset]);

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
              <RHFTextField name="name" label="Full Name" />
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
                        disabled={!!currentUser}
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
                  { value: 'hut_admin', name: 'Hut Admin' },
                  { value: 'cluster_admin', name: 'Cluster Admin' },
                ].map((option) => (
                  <MenuItem key={option.value} value={option.value}>
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
