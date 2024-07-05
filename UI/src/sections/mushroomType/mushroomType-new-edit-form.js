import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Chip from '@mui/material/Chip';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import Grid from '@mui/material/Unstable_Grid2';
import { format, isValid } from 'date-fns';
import axiosInstance from 'src/utils/axios';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFAutocomplete } from 'src/components/hook-form';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import moment from 'moment';

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
    morningStartTime: Yup.string().required('Please enter the time'),
    morningEndTime: Yup.string().required('Please enter the time'),
    eveningStartTime: Yup.string().required('Please enter the time'),
    eveningEndTime: Yup.string().required('Please enter the time'),
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
      morningStartTime: new Date(currentMushroomType?.morningStartTime) || null,
      morningEndTime: new Date(currentMushroomType?.morningEndTime) || null,
      eveningStartTime: new Date(currentMushroomType?.eveningStartTime) || null,
      eveningEndTime: new Date(currentMushroomType?.eveningEndTime) || null,
    }),
    [currentMushroomType]
  );

  const methods = useForm({
    resolver: yupResolver(NewMushroomTypeSchema),
    defaultValues,
  });

  const { reset, watch, control, handleSubmit, formState: { isSubmitting, errors } } = methods;

  useEffect(() => {
    if (currentMushroomType) {
      reset(defaultValues);
    }
  }, [currentMushroomType, defaultValues, reset]);

  function formatTimeToHHMMAMPM(date) {
    console.log('date',date);
    return moment(date).format('h:mm A');
  }

  const onSubmit = handleSubmit(async (formData) => {
    try {
      console.log(formData);
      const inputData = {
        ...formData,
        morningStartTime: formatTimeToHHMMAMPM(formData.morningStartTime),
        morningEndTime: formatTimeToHHMMAMPM(formData.morningEndTime),
        eveningStartTime: formatTimeToHHMMAMPM(formData.eveningStartTime),
        eveningEndTime: formatTimeToHHMMAMPM(formData.eveningEndTime),
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
      enqueueSnackbar(typeof error === 'string' ? error : error.message, {
        variant: 'error',
      });
    }
  });

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
              <Controller
                name="morningStartTime"
                control={control}
                render={({ field, fieldState: { error } }) =>
                  <TimePicker
                    label="Morning Start Time"
                    value={field.value ? new Date(field.value) : null}
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
                }
              />
              <Controller
                name="morningEndTime"
                control={control}
                render={({ field, fieldState: { error } }) =>
                  <TimePicker
                    label="Morning End Time"
                    value={field.value ? new Date(field.value) : null}
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
                }
              />
              <Controller
                name="eveningStartTime"
                control={control}
                render={({ field, fieldState: { error } }) =>
                  <TimePicker
                    label="Evening Start Time"
                    value={field.value ? new Date(field.value) : null}
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
                }
              />
              <Controller
                name="eveningEndTime"
                control={control}
                render={({ field, fieldState: { error } }) =>
                  <TimePicker
                    label="Evening End Time"
                    value={field.value ? new Date(field.value) : null}
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
