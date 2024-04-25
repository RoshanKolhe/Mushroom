import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
// utils
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// assets
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import 'react-phone-input-2/lib/material.css';
import axiosInstance from 'src/utils/axios';

// ----------------------------------------------------------------------

const classes = {
  labelStyle: {
    '&.react-tel-input .special-label': {
      color: 'red !important',
    },
  },
};
export default function TicketNewEditForm({ currentTicket }) {
  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();

  const NewTicketSchema = Yup.object().shape({
    question: Yup.string().required('Question is required'),
    answer: Yup.string().required('Answer is required'),
    isActive: Yup.boolean(),
  });

  const defaultValues = useMemo(
    () => ({
      question: currentTicket?.question || '',
      answer: currentTicket?.answer || '',
      isActive: currentTicket?.isActive || true,
    }),
    [currentTicket]
  );

  const methods = useForm({
    resolver: yupResolver(NewTicketSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting },
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

      if (!currentTicket) {
        await axiosInstance.post('/tickets', inputData);
      } else {
        await axiosInstance.patch(`/tickets/${currentTicket.id}`, inputData);
      }
      reset();
      enqueueSnackbar(currentTicket ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.ticket.list);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
    }
  });

  useEffect(() => {
    if (currentTicket) {
      reset(defaultValues);
    }
  }, [currentTicket, defaultValues, reset]);

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
                {!currentTicket ? 'Create Ticket' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

TicketNewEditForm.propTypes = {
  currentTicket: PropTypes.object,
};
