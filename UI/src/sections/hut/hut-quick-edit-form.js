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
import DialogContent from '@mui/material/DialogContent';
// _mock
import { USER_STATUS_OPTIONS } from 'src/_mock';
import PhoneInput from 'react-phone-input-2';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
import axiosInstance from 'src/utils/axios';
import { useGetUsersWithFilter } from 'src/api/user';
import { useGetClusters } from 'src/api/cluster';

// ----------------------------------------------------------------------

export default function HutQuickEditForm({ currentHut, open, onClose, onRefreshHuts }) {
  const { enqueueSnackbar } = useSnackbar();

  const { filteredUsers, filteredUsersLoading, filteredUsersEmpty, refreshFilterUsers } =
    useGetUsersWithFilter('filter={"where":{"permissions":["hut_admin"]}}');

  const { clusters, clustersLoading, clustersEmpty, refreshClusters } = useGetClusters();

  const [userOptions, setUserOption] = useState([]);
  const [clusterOptions, setClusterOption] = useState([]);

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
      isActive: currentHut?.isActive ? '1' : '0' || '',
    }),
    [currentHut]
  );

  const methods = useForm({
    resolver: yupResolver(NewHutSchema),
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
        name: data.name,
        noOfHuts: data.noOfHuts,
        totalCultivation: data.totalCultivation,
        isActive: data.isActive,
        userId: Number(data.user),
      };
      await axiosInstance.patch(`/huts/${currentHut.id}`, inputData);
      // reset();
      onRefreshHuts();
      onClose();
      enqueueSnackbar('Update success!');
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

  useEffect(() => {
    if (clusters.length) {
      setClusterOption(clusters);
    }
  }, [clusters]);

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
          {!currentHut.isActive && (
            <Alert variant="outlined" severity="error" sx={{ mb: 3 }}>
              Hut is In-Active
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
              {[
                { value: '1', label: 'Active' },
                { value: '0', label: 'In-Active' },
              ].map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </RHFSelect>

            <Box sx={{ display: { xs: 'none', sm: 'block' } }} />
            <RHFTextField name="name" label="Hut Name" />
            <RHFSelect fullWidth name="user" label="Hut User">
              {userOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.fullName}
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFSelect fullWidth name="cluster" label="Cluster User">
              {clusterOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFTextField name="totalCultivation" label="Total Cultivation" />
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

HutQuickEditForm.propTypes = {
  currentHut: PropTypes.object,
  onClose: PropTypes.func,
  onRefreshHuts: PropTypes.func,
  open: PropTypes.bool,
};
