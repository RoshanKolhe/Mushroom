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

// ----------------------------------------------------------------------

export default function ClusterQuickEditForm({ currentCluster, open, onClose, onRefreshClusters }) {
  const { enqueueSnackbar } = useSnackbar();

  const { filteredUsers, filteredUsersLoading, filteredUsersEmpty, refreshFilterUsers } =
    useGetUsersWithFilter('filter={"where":{"permissions":["cluster_admin"]}}');

  const [userOptions, setUserOption] = useState([]);

  const NewClusterSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    user: Yup.string().required('User is required'),
    noOfHuts: Yup.string().required('No of huts is required'),
    totalCultivation: Yup.string().required('Total Cultivation required'),
    isActive: Yup.boolean(),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentCluster?.name || '',
      user: currentCluster?.userId || '',
      noOfHuts: currentCluster?.noOfHuts || '',
      totalCultivation: currentCluster?.totalCultivation || '',
      isActive: currentCluster?.isActive ? '1' : '0' || '',
    }),
    [currentCluster]
  );

  const methods = useForm({
    resolver: yupResolver(NewClusterSchema),
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
      await axiosInstance.patch(`/clusters/${currentCluster.id}`, inputData);
      // reset();
      onRefreshClusters();
      onClose();
      enqueueSnackbar('Update success!');
    } catch (error) {
      console.error(error);
    }
  });

  useEffect(() => {
    if (filteredUsers.length) {
      setUserOption(filteredUsers);
    }
  }, [filteredUsers]);

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
          {!currentCluster.isActive && (
            <Alert variant="outlined" severity="error" sx={{ mb: 3 }}>
              Cluster is In-Active
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
            <RHFTextField name="name" label="Cluster Name" />
            <RHFSelect fullWidth name="user" label="Cluster User">
              {userOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.fullName}
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFTextField name="noOfHuts" label="No of huts" />
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

ClusterQuickEditForm.propTypes = {
  currentCluster: PropTypes.object,
  onClose: PropTypes.func,
  onRefreshClusters: PropTypes.func,
  open: PropTypes.bool,
};
