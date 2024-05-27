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
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import { MenuItem } from '@mui/material';
import axiosInstance from 'src/utils/axios';
import { useGetUsers, useGetUsersWithFilter } from 'src/api/user';
import { useGetClusters } from 'src/api/cluster';

// ----------------------------------------------------------------------

const classes = {
  labelStyle: {
    '&.react-tel-input .special-label': {
      color: 'red !important',
    },
  },
};
export default function HutNewEditForm({ currentHut }) {
  console.log(currentHut);
  const router = useRouter();

  const { filteredUsers, filteredUsersLoading, filteredUsersEmpty, refreshFilterUsers } =
    useGetUsersWithFilter('filter={"where":{"permissions":["hut_user"]}}');

  const { clusters, clustersLoading, clustersEmpty, refreshClusters } = useGetClusters();

  const [userOptions, setUserOption] = useState([]);
  const [clusterOptions, setClusterOption] = useState([]);
  const { enqueueSnackbar } = useSnackbar();

  const NewHutSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    user: Yup.string().required('User is required'),
    cluster: Yup.string().required('Cluster is required'),
    totalCultivation: Yup.string().required('Total Cultivation required'),
    isActive: Yup.boolean(),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentHut?.name || '',
      user: currentHut?.userId || '',
      cluster: currentHut?.clusterId || '',
      totalCultivation: currentHut?.totalCultivation || '',
      isActive: currentHut?.isActive || true,
    }),
    [currentHut]
  );

  const methods = useForm({
    resolver: yupResolver(NewHutSchema),
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
        clusterId: Number(formData.cluster),
        totalCultivation: formData.totalCultivation,
        isActive: formData.isActive,
        userId: Number(formData.user),
      };

      if (!currentHut) {
        await axiosInstance.post('/huts', inputData);
      } else {
        await axiosInstance.patch(`/huts/${currentHut.id}`, inputData);
      }
      reset();
      enqueueSnackbar(currentHut ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.hut.list);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
    }
  });

  useEffect(() => {
    if (currentHut) {
      reset(defaultValues);
    }
  }, [currentHut, defaultValues, reset]);

  useEffect(() => {
    if (filteredUsers.length) {
      setUserOption(filteredUsers);
    }
  }, [filteredUsers]);

  useEffect(() => {
    if (clusters.length) {
      setClusterOption(clusters);
    }
  }, [clusters]);

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
              <RHFTextField name="name" label="Hut Name" />
              <RHFSelect fullWidth name="user" label="Hut User">
                {userOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {`${option?.firstName} ${option?.lastName ? option?.lastName : ''}`}
                  </MenuItem>
                ))}
              </RHFSelect>
              <RHFSelect fullWidth name="cluster" label="Cluster Name">
                {clusterOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.name}
                  </MenuItem>
                ))}
              </RHFSelect>
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
                {!currentHut ? 'Create Hut' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

HutNewEditForm.propTypes = {
  currentHut: PropTypes.object,
};
