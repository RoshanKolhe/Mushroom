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
import 'react-phone-input-2/lib/material.css';
import { MenuItem } from '@mui/material';
import axiosInstance from 'src/utils/axios';
import { useGetUsers, useGetUsersWithFilter } from 'src/api/user';

// ----------------------------------------------------------------------

const classes = {
  labelStyle: {
    '&.react-tel-input .special-label': {
      color: 'red !important',
    },
  },
};
export default function ClusterNewEditForm({ currentCluster }) {
  const router = useRouter();
  const { filteredUsers, filteredUsersLoading, filteredUsersEmpty, refreshFilterUsers } =
    useGetUsersWithFilter('filter={"where":{"permissions":["cluster_admin"]}}');
  const [userOptions, setUserOption] = useState([]);
  const {
    filteredUsers: groupFilteredUsers,
    filteredUsersLoading: groupFilteredUsersLoading,
    filteredUsersEmpty: groupFilteredUsersEmpty,
    refreshFilterUsers: groupRefreshFilterUsers,
  } = useGetUsersWithFilter('filter={"where":{"permissions":["group_admin"]}}');
  const [groupUserOptions, setGroupUserOption] = useState([]);
  const { enqueueSnackbar } = useSnackbar();

  const NewClusterSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    groupUser: Yup.string().required('Group User is required'),
    user: Yup.string().required('User is required'),
    noOfHuts: Yup.string().required('No of huts is required'),
    totalCultivation: Yup.string().required('Total Cultivation required'),
    isActive: Yup.boolean(),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentCluster?.name || '',
      user: currentCluster?.userId || '',
      groupUser: currentCluster?.groupUserId || '',
      noOfHuts: currentCluster?.noOfHuts || '',
      totalCultivation: currentCluster?.totalCultivation || '',
      isActive: currentCluster?.isActive || true,
    }),
    [currentCluster]
  );

  const methods = useForm({
    resolver: yupResolver(NewClusterSchema),
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
        name: formData.name,
        noOfHuts: formData.noOfHuts,
        totalCultivation: formData.totalCultivation,
        isActive: formData.isActive,
        userId: Number(formData.user),
        groupUserId: Number(formData.groupUser),
      };
      if (!currentCluster) {
        await axiosInstance.post('/clusters', inputData);
      } else {
        await axiosInstance.patch(`/clusters/${currentCluster.id}`, inputData);
      }
      reset();
      enqueueSnackbar(currentCluster ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.cluster.list);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
    }
  });

  useEffect(() => {
    if (currentCluster) {
      reset(defaultValues);
    }
  }, [currentCluster, defaultValues, reset]);

  useEffect(() => {
    if (filteredUsers.length) {
      setUserOption(filteredUsers);
    }
  }, [filteredUsers]);

  useEffect(() => {
    if (groupFilteredUsers.length) {
      setGroupUserOption(groupFilteredUsers);
    }
  }, [groupFilteredUsers]);

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
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="name" label="Cluster Name" />
              <RHFSelect fullWidth name="user" label="Cluster Admin">
                {userOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {`${option?.firstName} ${option?.lastName ? option?.lastName : ''}`}
                  </MenuItem>
                ))}
              </RHFSelect>
              <RHFSelect fullWidth name="groupUser" label="Group Admin">
                {groupUserOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {`${option?.firstName} ${option?.lastName ? option?.lastName : ''}`}
                  </MenuItem>
                ))}
              </RHFSelect>
              <RHFTextField name="noOfHuts" label="No of huts" />
              <RHFTextField name="totalCultivation" label="Total Cultivation" />
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
                {!currentCluster ? 'Create Cluster' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

ClusterNewEditForm.propTypes = {
  currentCluster: PropTypes.object,
};
