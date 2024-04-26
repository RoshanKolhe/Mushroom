/* eslint-disable no-nested-ternary */
/* eslint-disable no-useless-escape */
/* eslint-disable import/no-extraneous-dependencies */
import * as Yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import LoadingButton from '@mui/lab/LoadingButton';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { Box } from '@mui/system';
import Alert from '@mui/material/Alert';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/bootstrap.css';
import Iconify from 'src/components/iconify';
import FormProvider, { RHFCode } from 'src/components/hook-form';
import { useState } from 'react';
import { useAuthContext } from 'src/auth/hooks';
import { PATH_AFTER_LOGIN } from 'src/config-global';
import { useSearchParams, useRouter } from 'src/routes/hook';
import { useSnackbar } from 'notistack';
import axiosInstance from 'src/utils/axios';

export default function ModernLoginView() {
  const [isOtpSend, setIsOtpSend] = useState(false);
  const { login } = useAuthContext();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const [errorMsg, setErrorMsg] = useState('');
  const [verificationSid, setVerificationSid] = useState('');
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const LoginSchema = Yup.object().shape({
    phoneNumber: Yup.string()
      .required('Phone number is required')
      .test('phone-length', 'Invalid phone number, must be 10 digits', (value) => {
        if (!value) return true;
        return value.replace(/\ /g, '').length === 12;
      }),
    otp: isOtpSend
      ? Yup.string()
          .required('OTP is required')
          .matches(/^[0-9]{6}$/, 'OTP must be 6 digits')
      : Yup.string(),
  });

  const defaultValues = {
    phoneNumber: '',
    otp: '',
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    setValue,
    reset,
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!isOtpSend) {
        const inputData = {
          phoneNumber: `+${data.phoneNumber}`,
        };
        const res = await axiosInstance.post(`/send-otp-login`, inputData);
        console.log(res);
        setVerificationSid(res?.data?.verificationSid);
        enqueueSnackbar(res?.data?.message, { variant: 'success' });
        setIsOtpSend(true);
      } else {
        await login?.(`+${data.phoneNumber}`, data.otp, verificationSid);
        router.push(returnTo || PATH_AFTER_LOGIN);
        setIsOtpSend(false);
      }
    } catch (error) {
      console.log(typeof error);
      console.log(error);
      console.log(error.message);
      if (typeof error !== 'string' && error?.error?.statusCode === 500) {
        enqueueSnackbar('Invalid Credentials', {
          variant: 'error',
        });
      } else {
        enqueueSnackbar(
          typeof error === 'string'
            ? error
            : error?.error?.message
            ? error?.error?.message
            : error?.message,
          {
            variant: 'error',
          }
        );
        setValue('otp', '');
        setIsOtpSend(false);
      }
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack spacing={2} sx={{ mb: 5 }}>
        <Typography variant="h4">
          {isOtpSend ? 'OTP Verification' : 'Sign in to Gravity'}
        </Typography>
        <Typography variant="body2">Lorem Ipsum is simply dummy text of the printing</Typography>
      </Stack>
      <Stack spacing={2.5}>
        {isOtpSend ? (
          <>
            <Typography style={{ fontWeight: '700' }}>Enter the verification code</Typography>
            <RHFCode pt={2} name="otp" type="number" />
          </>
        ) : (
          <>
            <Typography style={{ fontWeight: '700' }}>Enter your phone number</Typography>
            <Controller
              name="phoneNumber"
              control={methods.control}
              render={({ field }) => (
                <>
                  <PhoneInput
                    country="in"
                    value={field.value}
                    onChange={(phoneNumber) => field.onChange(phoneNumber)}
                    inputProps={{
                      autoComplete: 'on',
                      autoFocus: true,
                    }}
                    inputStyle={{
                      width: '100%',
                      height: '40px',
                    }}
                  />
                  {errors.phoneNumber && (
                    <Box sx={{ color: '#FF5630', fontSize: '0.75rem' }}>
                      {errors.phoneNumber.message}
                    </Box>
                  )}
                </>
              )}
            />
          </>
        )}
        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
          endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
          sx={{
            justifyContent: 'space-between',
            pl: 2,
            pr: 1.5,
            mt: 5,
            backgroundColor: '#00554E',
          }}
        >
          {isOtpSend ? 'Verify OTP' : 'Send OTP'}
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
