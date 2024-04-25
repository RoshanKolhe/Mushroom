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
import { DatePicker } from '@mui/x-date-pickers';
import { Icon } from '@iconify/react';
import zipPlaceholder from '../../assets/placeholders/zip.png';

// ----------------------------------------------------------------------

export default function SalesDataQuickEditForm({
  currentSalesData,
  open,
  onClose,
  onRefreshSalesDatas,
}) {
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

  const onSubmit = handleSubmit(async (data) => {
    try {
      console.log(data);
      const inputData = {
        orderId: data.orderId,
        user: data.user,
        date: data.date,
        noOfSales: data.noOfSales,
        totalPrice: data.totalPrice,
        invoice: data.invoice,
        status: data.status,
      };

      await axiosInstance.patch(`/sales-data/${currentSalesData.id}`, inputData);
      // reset();
      onRefreshSalesDatas();
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
    setFilePreview(currentSalesData?.invoice);
  }, [currentSalesData]);

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

            <Box sx={{ display: { xs: 'none', sm: 'block' } }} />
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

SalesDataQuickEditForm.propTypes = {
  currentSalesData: PropTypes.object,
  onClose: PropTypes.func,
  onRefreshSalesDatas: PropTypes.func,
  open: PropTypes.bool,
};
