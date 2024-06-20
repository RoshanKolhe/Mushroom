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
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
// _mock
import { USER_STATUS_OPTIONS } from 'src/_mock';
import PhoneInput from 'react-phone-input-2';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFAutocomplete, RHFSelect, RHFTextField } from 'src/components/hook-form';
import axiosInstance from 'src/utils/axios';
import { useGetUsersWithFilter } from 'src/api/user';
import { useGetClusters } from 'src/api/cluster';
import { DatePicker } from '@mui/x-date-pickers';
import { Icon } from '@iconify/react';
import zipPlaceholder from '../../assets/placeholders/zip.png';

// ----------------------------------------------------------------------

export default function MushroomTypeQuickEditForm({
  currentMushroomType,
  open,
  onClose,
  onRefreshMushroomTypes,
}) {
  const { enqueueSnackbar } = useSnackbar();
  const [filePreview, setFilePreview] = useState(null);

  const NewMushroomTypeSchema = Yup.object().shape({
    name: Yup.string().required('Mushroom Name is required'),
    minimumHumidity: Yup.string().required('Minimum Humidity is required'),
    maximumHumidity: Yup.string().required('Maximum Humidity is required'),
    minimumMoisture: Yup.string().required('Minimum Moisture is required'),
    maximumMoisture: Yup.string().required('Maximum Moisture is required'),
    minimumTemprature: Yup.string().required('Minimum Temperature is required'),
    maximumTemprature: Yup.string().required('Maximum Temperature is required'),
    maxRow: Yup.string().required('Max Row is required'),
    maxColumn: Yup.string().required('Max Column is required'),
    colors: Yup.array().min(1, 'At least one color is required').required('Colors are required'),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentMushroomType?.name || '',
      minimumHumidity: currentMushroomType?.minimumHumidity || '',
      maximumHumidity: currentMushroomType?.maximumHumidity || '',
      minimumMoisture: currentMushroomType?.minimumMoisture || '',
      maximumMoisture: currentMushroomType?.maximumMoisture || '',
      minimumTemprature: currentMushroomType?.minimumTemprature || '',
      maximumTemprature: currentMushroomType?.maximumTemprature || '',
      maxRow: currentMushroomType?.maxRow || '',
      maxColumn: currentMushroomType?.maxColumn || null,
      colors: currentMushroomType?.colors || [],
    }),
    [currentMushroomType]
  );

  const methods = useForm({
    resolver: yupResolver(NewMushroomTypeSchema),
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

  const onSubmit = handleSubmit(async (data) => {
    try {
      console.log(data);
      const inputData = {
        ...data,
      };

      await axiosInstance.patch(`/mushroom-types/${currentMushroomType.id}`, inputData);
      // reset();
      onRefreshMushroomTypes();
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
    setFilePreview(currentMushroomType?.invoice);
  }, [currentMushroomType]);

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
            <RHFTextField name="name" label="Mushroom Name" />
            <RHFTextField name="minimumHumidity" label="Minimum Humidity" type="number" />
            <RHFTextField name="maximumHumidity" label="Maximum Humidity" type="number" />
            <RHFTextField name="minimumMoisture" label="Minimum Moisture" type="number" />
            <RHFTextField name="maximumMoisture" label="Maximum Moisture" type="number" />
            <RHFTextField name="minimumTemprature" label="Minimum Temprature" type="number" />
            <RHFTextField name="maximumTemprature" label="Maximum Temprature" type="number" />
            <RHFTextField name="maxRow" label="Max Row" type="number" />
            <RHFTextField name="maxColumn" label="Max Column" type="number" />
            <RHFAutocomplete
              name="colors"
              label="Colors"
              placeholder="+ Colors"
              multiple
              freeSolo
              options={[]}
              getOptionLabel={(option) => option}
              renderOption={(props, option) => (
                <li {...props} key={option}>
                  {option}
                </li>
              )}
              renderTags={(selected, getTagProps) =>
                selected.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option}
                    label={option}
                    size="small"
                    color="info"
                    variant="soft"
                  />
                ))
              }
            />
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

MushroomTypeQuickEditForm.propTypes = {
  currentMushroomType: PropTypes.object,
  onClose: PropTypes.func,
  onRefreshMushroomTypes: PropTypes.func,
  open: PropTypes.bool,
};
