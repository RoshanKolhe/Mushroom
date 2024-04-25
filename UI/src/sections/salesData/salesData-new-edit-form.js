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
export default function SalesDataNewEditForm({ currentSalesData }) {
  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();
  const [filePreview, setFilePreview] = useState(null);
  const NewSalesDataSchema = Yup.object().shape({
    orderId: Yup.string().required('Order Id is required'),
    date: Yup.string().required('Date is required'),
    user: Yup.string().required('User is required'),
    noOfSales: Yup.string().required('No of sales is required'),
    totalPrice: Yup.string().required('Total Price of sale is required'),
    invoice: Yup.object().required('Invoice is required'),
    status: Yup.string().required('Status is required'),
  });

  const defaultValues = useMemo(
    () => ({
      orderId: currentSalesData?.orderId || '',
      date: currentSalesData?.date || '',
      user: currentSalesData?.user || '',
      noOfSales: currentSalesData?.noOfSales || '',
      totalPrice: currentSalesData?.totalPrice || '',
      invoice: currentSalesData?.invoice || null,
      status: currentSalesData?.status || '',
    }),
    [currentSalesData]
  );

  const methods = useForm({
    resolver: yupResolver(NewSalesDataSchema),
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
        orderId: formData.orderId,
        user: formData.user,
        date: formData.date,
        noOfSales: formData.noOfSales,
        totalPrice: formData.totalPrice,
        invoice: formData.invoice,
        status: formData.status,
      };

      if (!currentSalesData) {
        await axiosInstance.post('/sales-data', inputData);
      } else {
        await axiosInstance.patch(`/sales-data/${currentSalesData.id}`, inputData);
      }
      reset();
      enqueueSnackbar(currentSalesData ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.salesData.list);
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
    if (currentSalesData) {
      reset(defaultValues);
    }
  }, [currentSalesData, defaultValues, reset]);

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
              <RHFTextField name="orderId" label="Order Id" />
              <Controller
                name="date"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    label="Date"
                    value={new Date(field.value)}
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
                )}
              />

              <RHFTextField name="user" label="User" />
              <RHFTextField name="noOfSales" label="No of sales" />
              <div>
                <Controller
                  name="invoice"
                  control={control}
                  render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <>
                      <input
                        type="file"
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const formData = new FormData();
                            formData.append('file', file);
                            const response = await axiosInstance.post('/files', formData);
                            const { data } = response;
                            console.log(data);
                            setValue('invoice', data?.files[0], {
                              shouldValidate: true,
                            });
                            setFilePreview(data?.files[0]);
                          }
                        }}
                        id="file-upload-invoice"
                      />
                      <label htmlFor="file-upload-invoice">
                        <Button
                          variant="outlined"
                          component="span"
                          endIcon={<Icon icon="eva:cloud-upload-fill" style={{ color: 'white' }} />}
                          sx={{
                            '& .MuiButton-endIcon': {
                              height: '53px',
                              alignItems: 'center',
                              background: '#00554E',
                              width: '54px',
                              justifyContent: 'center',
                              borderTopRightRadius: 'inherit',
                              borderBottomRightRadius: 'inherit',
                            },
                          }}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            height: '53px',
                            color: '#637381',
                            fontWeight: '400',
                            paddingRight: '0px',
                            borderColor: error ? 'red' : 'inherit',
                          }}
                          helper
                        >
                          Upload File
                        </Button>
                        {error && (
                          <Box
                            sx={{
                              color: '#FF5630',
                              fontSize: '0.75rem',
                              marginTop: '8px',
                              marginRight: '14px',
                              marginLeft: '14px',
                            }}
                          >
                            {error.message}
                          </Box>
                        )}
                      </label>
                    </>
                  )}
                />
                {filePreview && (
                  <Box
                    component="img"
                    onClick={() => window.open(filePreview.fileUrl, '_blank')}
                    sx={{
                      marginTop: 2,
                      height: 200,
                      width: 350,
                      maxHeight: { xs: 233, md: 167 },
                      maxWidth: { xs: 350, md: 250 },
                      cursor: 'pointer',
                      objectFit: 'contain',
                    }}
                    alt="placeholder"
                    src={
                      filePreview?.mimetype === 'application/pdf'
                        ? zipPlaceholder
                        : filePreview?.fileUrl
                    }
                  />
                )}
              </div>

              <RHFTextField name="totalPrice" label="Total Price of sale" />
              <RHFSelect fullWidth name="status" label="Status">
                {[
                  { value: 'pending', name: 'Pending' },
                  { value: 'completed', name: 'Completed' },
                  { value: 'rejected', name: 'Rejected' },
                ].map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.name}
                  </MenuItem>
                ))}
              </RHFSelect>
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
                {!currentSalesData ? 'Create SalesData' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

SalesDataNewEditForm.propTypes = {
  currentSalesData: PropTypes.object,
};
