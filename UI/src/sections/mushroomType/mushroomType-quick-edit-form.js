/* eslint-disable react/no-this-in-sfc */
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
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { Icon } from '@iconify/react';
import { format, isValid, parse, parseISO } from 'date-fns';
import moment from 'moment';
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
  // const [morningStartTime, setMorningStartTime] = useState(currentMushroomType?.morningStartTime ? parseISO(currentMushroomType?.morningStartTime) : undefined);
  // const [morningEndTime, setMorningEndTime] = useState(currentMushroomType?.morningEndTime ? parseISO(currentMushroomType?.morningEndTime) : undefined);
  // const [eveningStartTime, setEveningStartTime] = useState(currentMushroomType?.eveningStartTime ? parseISO(currentMushroomType?.eveningStartTime) : undefined);
  // const [eveningEndTime, setEveningEndTime] = useState(currentMushroomType?.eveningEndTime ? parseISO(currentMushroomType?.eveningEndTime) : undefined);

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
    morningStartTime: Yup.string()
    .required('Please enter the time')
    .test('is-morning-start-time-valid', 'Start time must be before end time for mornings', function(value) {
      const { morningEndTime } = this.parent;
      if (value && morningEndTime) {
        return value < morningEndTime;
      }
      return true; // Return true if the field is empty
    }),
  morningEndTime: Yup.string()
    .required('Please enter the time')
    .test('is-morning-end-time-valid', 'End time must be after start time for mornings', function(value) {
      const { morningStartTime } = this.parent;
      if (value && morningStartTime) {
        return value > morningStartTime;
      }
      return true; // Return true if the field is empty
    }),
  eveningStartTime: Yup.string()
    .required('Please enter the time')
    .test('is-evening-start-time-valid', 'Start time must be before end time for evenings', function(value) {
      const { eveningEndTime } = this.parent;
      if (value && eveningEndTime) {
        return value < eveningEndTime;
      }
      return true; // Return true if the field is empty
    }),
  eveningEndTime: Yup.string()
    .required('Please enter the time')
    .test('is-evening-end-time-valid', 'End time must be after start time for evenings', function(value) {
      const { eveningStartTime } = this.parent;
      if (value && eveningStartTime) {
        return value > eveningStartTime;
      }
      return true; // Return true if the field is empty
    }),
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
      morningStartTime: currentMushroomType?.morningStartTime ? parse(currentMushroomType.morningStartTime, 'hh:mm a', new Date()) : null,
      morningEndTime: currentMushroomType?.morningEndTime ? parse(currentMushroomType.morningEndTime,'hh:mm a', new Date() ) : null,
      eveningStartTime: currentMushroomType?.eveningStartTime ? parse(currentMushroomType.eveningStartTime,'hh:mm a', new Date()) : null,
      eveningEndTime: currentMushroomType?.eveningEndTime ? parse(currentMushroomType.eveningEndTime,'hh:mm a', new Date()) : null,
    }),
    [currentMushroomType]
  );

  console.log('defaultValues',defaultValues);

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

  function formatTimeToHHMMAMPM(date) {
    return moment(date).format('h:mm A');
  }

  const onSubmit = handleSubmit(async (data) => {
    try {
      console.log(data);
      const inputData = {
        ...data,
        morningStartTime: formatTimeToHHMMAMPM(data.morningStartTime),
        morningEndTime: formatTimeToHHMMAMPM(data.morningEndTime),
        eveningStartTime: formatTimeToHHMMAMPM(data.eveningStartTime),
        eveningEndTime: formatTimeToHHMMAMPM(data.eveningEndTime),
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
              <Controller
                name="morningStartTime"
                control={control}
                render={({ field, fieldState: { error } }) =>
                  <TimePicker
                    label="Morning Start Time"
                    value={field.value ? field.value : null}
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
                    value={field.value ? field.value : null}
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
                    value={field.value ? field.value : null}
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
                    value={field.value ? field.value : null}
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
