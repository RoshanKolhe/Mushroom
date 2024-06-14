/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-unused-vars */
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';

// routes
import { useRouter } from 'src/routes/hook';
// assets
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFAutocomplete } from 'src/components/hook-form';
import { useGetUsersWithFilter } from 'src/api/user';
import { Chip, MenuItem } from '@mui/material';
import axiosInstance from 'src/utils/axios';

// ----------------------------------------------------------------------
export default function NewNotificationEditForm() {
  const router = useRouter();
  const { filteredUsers, filteredUsersLoading, filteredUsersEmpty, refreshFilterUsers } =
    useGetUsersWithFilter('filter={"where":{"permissions":["hut_user"]}}');
  const [userOptions, setUserOption] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const NewNotificationSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    message: Yup.string().required('Message is required'),
    userIds: Yup.array(),
  });

  const defaultValues = useMemo(
    () => ({
      title: '',
      message: '',
      userIds: [],
    }),
    []
  );

  const methods = useForm({
    resolver: yupResolver(NewNotificationSchema),
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
        userIds: formData.userIds.map((res) => res.id),
        title: formData.title,
        message: formData.message,
      };
      const response = await axiosInstance.post('/send-notification', inputData);
      enqueueSnackbar('Notification send successfully', {
        variant: 'success',
      });
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
    }
  });

  useEffect(() => {
    if (filteredUsers.length) {
      setUserOption(filteredUsers);
    }
  }, [filteredUsers]);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(1, 1fr)',
              }}
            >
              <RHFAutocomplete
                name="userIds"
                label="Select Users"
                fullWidth
                multiple
                options={userOptions}
                getOptionLabel={(option) =>
                  `${option.firstName || ''} ${option.lastName || ''} - ${option.phoneNumber || ''}`
                }
                isOptionEqualToValue={(option, selected) => option.id === selected.id}
                renderOption={(props, option) => {
                  const { firstName, lastName, id, phoneNumber } = userOptions.filter(
                    (user) => user.id === option.id
                  )[0];

                  if (!firstName && !lastName) {
                    return null;
                  }

                  return (
                    <li {...props} key={id}>
                      {firstName} {lastName || ''} - {phoneNumber}
                    </li>
                  );
                }}
                renderTags={(selected, getTagProps) =>
                  selected.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.id}
                      label={option.firstName}
                      size="small"
                      variant="soft"
                      color="primary"
                    />
                  ))
                }
              />
              <RHFTextField name="title" label="Title" />

              <RHFTextField name="message" label="Message" />
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
                Send Notification
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
