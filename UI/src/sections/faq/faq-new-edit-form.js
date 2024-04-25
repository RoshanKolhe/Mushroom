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
export default function FaqNewEditForm({ currentFaq }) {
  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();

  const NewFaqSchema = Yup.object().shape({
    question: Yup.string().required('Question is required'),
    answer: Yup.string().required('Answer is required'),
    isActive: Yup.boolean(),
  });

  const defaultValues = useMemo(
    () => ({
      question: currentFaq?.question || '',
      answer: currentFaq?.answer || '',
      isActive: currentFaq?.isActive || true,
    }),
    [currentFaq]
  );

  const methods = useForm({
    resolver: yupResolver(NewFaqSchema),
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
        question: formData.question,
        answer: formData.answer,
        isActive: formData.isActive,
      };

      if (!currentFaq) {
        await axiosInstance.post('/faqs', inputData);
      } else {
        await axiosInstance.patch(`/faqs/${currentFaq.id}`, inputData);
      }
      reset();
      enqueueSnackbar(currentFaq ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.faq.list);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
    }
  });

  useEffect(() => {
    if (currentFaq) {
      reset(defaultValues);
    }
  }, [currentFaq, defaultValues, reset]);

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
              <RHFTextField name="question" label="FAQ Question" />

              <RHFTextField name="answer" label="FAQ Answer" />
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
                {!currentFaq ? 'Create Faq' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

FaqNewEditForm.propTypes = {
  currentFaq: PropTypes.object,
};
