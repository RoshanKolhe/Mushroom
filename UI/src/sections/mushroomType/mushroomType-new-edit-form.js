/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-unused-vars */
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Chip from '@mui/material/Chip';

// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
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
import { Icon } from '@iconify/react';
import zipPlaceholder from '../../assets/placeholders/zip.png';

// ----------------------------------------------------------------------

const classes = {
  labelStyle: {
    '&.react-tel-input .special-label': {
      color: 'red !important',
    },
  },
};
export default function MushroomTypeNewEditForm({ currentMushroomType }) {
  const router = useRouter();

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

  const values = watch();
  const onSubmit = handleSubmit(async (formData) => {
    try {
      console.log(formData);
      const inputData = {
        ...formData,
      };
      if (!currentMushroomType) {
        await axiosInstance.post('/mushroom-types', inputData);
      } else {
        await axiosInstance.patch(`/mushroom-types/${currentMushroomType.id}`, inputData);
      }
      reset();
      enqueueSnackbar(currentMushroomType ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.mushroomType.list);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
    }
  });

  const getFileExtension = (fileName) => {
    console.log(fileName);
    fileName.split('.').pop().toLowerCase();
  };

  useEffect(() => {
    if (currentMushroomType) {
      reset(defaultValues);
    }
  }, [currentMushroomType, defaultValues, reset]);

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
                {!currentMushroomType ? 'Create Mushroom Type' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

MushroomTypeNewEditForm.propTypes = {
  currentMushroomType: PropTypes.object,
};
