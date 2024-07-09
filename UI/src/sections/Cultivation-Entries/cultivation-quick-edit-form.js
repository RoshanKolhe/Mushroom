import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Chip from '@mui/material/Chip';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
// _mock
import { USER_STATUS_OPTIONS } from 'src/_mock';
import PhoneInput from 'react-phone-input-2';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFAutocomplete, RHFSelect, RHFTextField, RHFUpload } from 'src/components/hook-form';
import axiosInstance from 'src/utils/axios';
import { useGetUsersWithFilter } from 'src/api/user';
import { useGetClusters } from 'src/api/cluster';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { Icon } from '@iconify/react';
import { format, isValid, parse, parseISO } from 'date-fns';
import moment from 'moment';
import { useGetMushroomTypes } from 'src/api/mushroomType';
import { FormControl } from '@mui/base';
import { MenuItem, Select,  InputLabel } from '@mui/material';
import { useGeolocated } from 'react-geolocated';


// ----------------------------------------------------------------------

export default function CultivationQuickEditForm({
  currentCultivationEntry,
  open,
  onClose,
  onRefreshCultivationEntry,
}) {
    const [huts, setHuts] = useState([]);
    const [clusters, setClusters] = useState([]);
    const [mushroomTypes, setMushroomTypes] = useState([]);
    const [selectedMushroomType , setSelectedMushroomType] = useState();
    const [rowData, setRowData] = useState([]);
    const [columnData, setColumnData] = useState([]);
    const [colorOptions, SetColorOptions] = useState([]);
    const [colorChange, setColorChange] = useState(currentCultivationEntry?.isColorChanged);
    const [clusterId, setClusterId] = useState(currentCultivationEntry?.hut?.cluster.id);
  const { enqueueSnackbar } = useSnackbar();
  const [filePreview, setFilePreview] = useState(null);

  const { clusters: clustersData, clustersLoading } = useGetClusters();
  const { mushroomTypes: mushroomTypesData, mushroomTypesLoading } = useGetMushroomTypes();

  const { coords, isGeolocationAvailable, isGeolocationEnabled } =
        useGeolocated({
            positionOptions: {
                enableHighAccuracy: false,
            },
            userDecisionTimeout: 5000,
        });

  useEffect(() => {
    if (!clustersLoading && clustersData.length > 0) {
      setClusters(clustersData);
    }
  }, [clustersData, clustersLoading]);

  useEffect(() => {
    if (!clustersLoading && clustersData.length > 0) {
      setClusters(clustersData);
    }
  }, [clustersData, clustersLoading]);

  useEffect(() => {
    if (!mushroomTypesLoading && mushroomTypesData.length > 0) {
      setMushroomTypes(mushroomTypesData);
    }
  }, [mushroomTypesData, mushroomTypesLoading]);

  useEffect(()=>{
    if(currentCultivationEntry?.isColorChanged === true && !mushroomTypesLoading && mushroomTypesData.length > 0){
        setSelectedMushroomType(Number(currentCultivationEntry?.mushroomTypeId));
    }
  },[currentCultivationEntry, mushroomTypesData.length, mushroomTypesLoading])

  const getHuts = async (clusterID) => {
    const { data } = await axiosInstance.get(`/huts?filter={"where":{"clusterId":${clusterID}}}`);
    if (data) {
      setHuts(data);
    }
  };

  useEffect(() => {
    if (clusterId) {
      getHuts(clusterId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clusterId]);

  useEffect(() => {
    if(selectedMushroomType){
        console.log('id',selectedMushroomType)
      const mushroomType = mushroomTypes.filter((type) => type.id === selectedMushroomType);
      console.log('mushroomtype',mushroomType);
      console.log('mushroomTypes',mushroomTypes);
      const rowNumber = mushroomType[0].maxRow;
      const row = [];
      // eslint-disable-next-line no-plusplus
      for (let i = 1; i <= rowNumber; i++) {
        // eslint-disable-next-line no-undef
        row.push({label:i, value:String(i)});
      }
      setRowData(row);
      const colNumber = mushroomType[0].maxRow;
      const col = [];
      // eslint-disable-next-line no-plusplus
      for (let i = 1; i <= colNumber; i++) {
        // eslint-disable-next-line no-undef
        col.push({label:i, value:String(i)});
      }
      setColumnData(col);
      const colors = mushroomType[0].colors.map(color => ({ label: color, value: color }));
      SetColorOptions(colors);

    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[mushroomTypes, selectedMushroomType])


  const colorChangedOptions = [
    {label:"Yes", value:true},
    {label:"No", value:false},
  ]

  const NewCultivationTypeSchema = Yup.object().shape({
    mushroomTypeId: Yup.string().required('Mushroom type is required'),
    hutId: Yup.string().required('Hut type is required'),
    quantity: Yup.string().required('Quantity is required'),
    moisture: Yup.string().required('Moisture is required'),
    temprature: Yup.string().required('Temperature is required'),
    isColorChanged : Yup.boolean().required('Select the option'),
    changedColor : Yup.string().when('isColorChanged',{
      is : true,
      then : (schema) => schema.required('Select Changed Color'),
      otherwise : (schema) => schema
    }),
    changedColorRow : Yup.string().when('isColorChanged',{
      is : true,
      then : (schema) => schema.required('Select the Row'),
      otherwise: (schema) => schema,
    }),
    changedColorColumn : Yup.string().when('isColorChanged',{
      is : true,
      then : (schema) => schema.required('Select the Column'),
      otherwise : (schema) => schema
    }),
    longitude: Yup.string().required('Longitude is required'),
    latitude: Yup.string().required('Latitude is required'),
    humidity: Yup.string().required('Humidity is required'),
    date: Yup.string().required('Date is required'),
    time: Yup.string().required('Time is required'),
    files: Yup.array().min(1, 'Please Upload at least one file').test('is-images', 'Only image files are allowed', (value) => {
      if (!value) return true;
      return value.every((file) => file.type.startsWith('image/'));
    }),
  });

  const defaultValues = useMemo(
    () => ({
      mushroomTypeId: currentCultivationEntry?.mushroomTypeId ? Number(currentCultivationEntry?.mushroomTypeId) : '',
      hutId: currentCultivationEntry?.hutId ? Number(currentCultivationEntry?.hutId) : '',
      quantity: currentCultivationEntry?.quantity || '',
      moisture: currentCultivationEntry?.moisture || '',
      temprature: currentCultivationEntry?.temprature || '',
      isColorChanged: currentCultivationEntry?.isColorChanged || false,
      changedColorRow: currentCultivationEntry?.changedColorRow || '',
      changedColorColumn: currentCultivationEntry?.changedColorColumn || '',
      changedColor: currentCultivationEntry?.changedColor || '',
      longitude: currentCultivationEntry?.longitude || (coords? coords.longitude : ''),
      latitude: currentCultivationEntry?.latitude || (coords? coords.latitude : ''),
      humidity: currentCultivationEntry?.humidity || '',
      date: currentCultivationEntry?.date
      ? parse(currentCultivationEntry?.date, 'MM/dd/yy', new Date())
      : new Date(),
    time: currentCultivationEntry?.time
      ? parse(currentCultivationEntry?.time, 'h:mm a', new Date())
      : new Date(),
      files: currentCultivationEntry?.files ? currentCultivationEntry?.files : [],
  }),
    [currentCultivationEntry, coords]
  );

  console.log('defaultValues',defaultValues);

  const methods = useForm({
    resolver: yupResolver(NewCultivationTypeSchema),
    defaultValues,
  });

  const { setValue, reset, watch, control, handleSubmit, formState: { isSubmitting, errors } } = methods;

  const values = watch();

  useEffect(() => {
    setValue('files', defaultValues.files);
  }, [defaultValues.files, setValue]);

  const handleDropCoverImage = useCallback(
    async (acceptedFiles) => {
      const files = values.files || [];
  
      // Iterate through accepted files
      const newFiles = acceptedFiles.map((file) => 
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );
  
      // Update the state or values with the array of file URLs
      if (newFiles.length > 0) {
        setValue('files', [...files, ...newFiles], { shouldValidate: true });
      }
    },
    [setValue, values.files]
  );

  useEffect(() => {
    if (currentCultivationEntry) {
      reset(defaultValues);
    }
  }, [currentCultivationEntry, defaultValues, reset]);

  function formatTimeToHHMMAMPM(date) {
    console.log('date', date);
    return moment(date).format('h:mm A');
  }

  function formatDateToDDMMYYYY(date) {
    return moment(date).format('DD/MM/YY');
  }


  const onSubmit = handleSubmit(async (data) => {
    try {
        const inputData = {
            ...data,
            mushroomTypeId: Number(data.mushroomTypeId),
            hutId: Number(data.hutId),
            time: formatTimeToHHMMAMPM(data.time),
            date: formatDateToDDMMYYYY(data.date),
          };

        await axiosInstance.patch(`/environment-data/${currentCultivationEntry.id}`, inputData);
          // reset();
        // onRefreshCultivationEntry();
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
    setFilePreview(currentCultivationEntry?.invoice);
  }, [currentCultivationEntry]);

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
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
            <Controller
                name="date"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    label="Date"
                    value={field.value ? (field.value) : null}
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
                    disabled
                  />
                )}
              />

              <Controller
                name="time"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TimePicker
                    label="Current Time"
                    value={field.value ? (field.value) : null}
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
                    disabled
                  />
                )}
              />
              <RHFTextField name="longitude" label="Longitude" type="number" />
              <RHFTextField name="latitude" label="Latitude" type="number" />
              <FormControl fullWidth>
                <Select
                  fullWidth
                  labelid="cluster-label"
                  value={clusterId}
                  onChange={(e) => setClusterId(e.target.value)}
                  name="Cluster Type"
                >
                  {clusters.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {`${option?.name}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl >
                <RHFSelect
                  fullWidth
                  name="hutId"
                  labelid="hut-label"
                  label="Hut Type"
                >
                  {!clusterId ? (
                    <MenuItem disabled>Please select a cluster first</MenuItem>
                  ) : (
                    huts.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {`${option?.name}`}
                      </MenuItem>
                    ))
                  )}
                </RHFSelect>
              </FormControl>
              <RHFTextField name="temprature" label="Temperature in Celsius" type="number" />
              <RHFTextField name="moisture" label="Moisture Level" type="number" />
              <RHFTextField name="humidity" label="Humidity Level" type="number" />
              <Controller
                name="mushroomTypeId"
                control={control}
                defaultValue=""
                render={({ field }) => (
                <RHFSelect
                {...field}
                fullWidth
                label="Mushroom Type"
                onChange={(e) => {
                    field.onChange(e); // Update form data
                    setSelectedMushroomType(e.target.value); // Update selected mushroom ID
                }}
                  >
                    {mushroomTypes.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                )}
              />
              <RHFTextField name="quantity" label="Quantity of Cultivated Mushrooms" type="number" />
              <Controller
                name="isColorChanged"
                control={control}
                defaultValue={false}
                render={({ field }) => (
                  <RHFSelect
                    {...field}
                    fullWidth
                    label="Any Visible Color Change In Mushroom"
                    onChange={(e) => {
                      field.onChange(e); // Update form data
                      setColorChange(e.target.value); // Update selected mushroom ID
                    }}
                  >
                    {colorChangedOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                )}
              />
              {colorChange ?
              <>
                <RHFSelect fullWidth name="changedColor" label="Changed Color">
                {!selectedMushroomType ? (
                    <MenuItem disabled>Please select a Mushroom Type First</MenuItem>
                  ) : (
                    colorOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {`${option?.label}`}
                      </MenuItem>
                    ))
                  )}
              </RHFSelect>
              <RHFSelect fullWidth name="changedColorRow" label="Select Row">
                {!selectedMushroomType ? (
                    <MenuItem disabled>Please select a Mushroom Type First</MenuItem>
                  ) : (
                    rowData.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {`${option?.label}`}
                      </MenuItem>
                    ))
                  )}
              </RHFSelect>
              <RHFSelect fullWidth name="changedColorColumn" label="Select Column">
                {!selectedMushroomType ? (
                    <MenuItem disabled>Please select a Mushroom Type First</MenuItem>
                  ) : (
                    columnData.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {`${option?.label}`}
                      </MenuItem>
                    ))
                  )}
              </RHFSelect>
              </>
              : null}
              <RHFUpload
                name="files"
                thumbnail
                multiple
                maxSize={3145728}
                onDrop={handleDropCoverImage}
                onRemove={(inputFile) =>
                  setValue(
                    'files',
                    values.files &&
                      values.files?.filter((file) => file !== inputFile),
                    { shouldValidate: true }
                  )
                }
                onRemoveAll={() => setValue('files', [], { shouldValidate: true })}
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

CultivationQuickEditForm.propTypes = {
  currentCultivationEntry: PropTypes.object,
  onClose: PropTypes.func,
  onRefreshCultivationEntry: PropTypes.func,
  open: PropTypes.bool,
};
