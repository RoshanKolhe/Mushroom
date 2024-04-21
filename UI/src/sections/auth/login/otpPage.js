import { Icon } from '@iconify/react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
// eslint-disable-next-line import/no-extraneous-dependencies
import { yupResolver } from '@hookform/resolvers/yup';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Alert, Link } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useCallback, useState } from 'react';
import { useAuthContext } from 'src/auth/hooks';
import FormProvider, { RHFCode } from 'src/components/hook-form';
import { useCountdownSeconds } from 'src/hooks/use-countdown';
import { useRouter, useSearchParams } from 'src/routes/hook';
import axiosInstance from 'src/utils/axios';

export default function OtpView() {
  const router = useRouter();
  const { verifyOtp } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const searchParams = useSearchParams();

  const [errorMsg, setErrorMsg] = useState('');
  const phoneNumber = searchParams.get('phoneNumber');
  const id = searchParams.get('id');

  const { countdown, counting, startCountdown } = useCountdownSeconds(60);
  const VerifySchemaSchema = Yup.object().shape({
    // code: Yup.string().min(6, 'Code must be at least 6 characters').required('Code is required'),
    // phoneNumber: Yup.string().required('Phone Number is required'),
  });
  const defaultValues = {
    code: '',
    phoneNumber: phoneNumber || '',
    id: id || '',
  };
  const methods = useForm({
    mode: 'onChange',
    resolver: yupResolver(VerifySchemaSchema),
    defaultValues,
  });

  const {
    watch,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    console.log('🚀 ~ data:', data);
    if (!data.code) {
      setErrorMsg('Code is required');
      return;
    }
    if (data.code.length <= 5) {
      setErrorMsg('Code must be at least 6 digits');
      return;
    }
    // if (!data.phoneNumber) {
    //   setErrorMsg('Phone Number is required');
    //   return;
    // }
    // if (!data.id) {
    //   setErrorMsg('Id is required');
    //   return;
    // }
    try {
      const inputData = {
        id: data.id,
        code: data.code,
        phoneNumber: data.phoneNumber,
      };
      console.log('🚀 ~ inputData:', inputData);
      const res = await verifyOtp?.(data.code, data.id, data.phoneNumber);
      // const res = await axiosInstance.post('/verify-otp-customer-login', inputData);
      console.log('🚀 ~ res:', res.data);
      if (res.data.success === true) {
        enqueueSnackbar(res.data.message, { variant: 'success' });
        // const { accessToken } = res.data;
        // setSession(accessToken);
        // router.push(paths.dashboard.root);
      } else {
        setErrorMsg(res.data.message);
      }
    } catch (error) {
      console.error(error);
    }
  });

  const handleResendCode = useCallback(async () => {
    try {
      startCountdown();
      const res = await axiosInstance.post('/send-otp-customer-login', {
        phoneNumber: values.phoneNumber,
      });
      console.log('🚀 ~ res:', res.data);

      if (res.data.success === true) {
        enqueueSnackbar(res.data.message, { variant: 'success' });
        setValue('id', res.data.verificationSid);
        setValue('phoneNumber', values.phoneNumber);
      } else {
        setErrorMsg(res.data.message);
      }
    } catch (error) {
      console.error(error);
    }
  }, [enqueueSnackbar, setValue, startCountdown, values.phoneNumber]);

  // const { handleSubmit, ...methods } = useForm();

  // const handleClick = () => {
  // logic after clicking on send otp button
  // };

  // const otpValidationSchema = Yup.object().shape({
  //   otp: Yup.string().min(6, 'Code must be at least 6 characters').required('Code is required'),
  // });

  // const onSubmit = handleSubmit(async (data) => {
  //   console.log('🚀 ~ data:', data);
  //   try {
  //     // Submit logic
  //   } catch (error) {
  //     console.error(error);
  //   }
  // });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <>
        <Typography variant="h4" sx={{ mb: 2 }}>
          OTP Verification
        </Typography>
        <Typography variant="body1" sx={{ mb: 5 }}>
          Enter the OTP to sign in
        </Typography>

        <Stack spacing={2}>
          <Typography variant="h6">Enter the verification code</Typography>
          {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

          <Stack spacing={2} alignItems="center">
            <RHFCode autoFocus gap={1.5} length={6} name="code" />
            <Typography variant="body2" sx={{ fontSize: '12px', textAlign: 'center' }}>
              {`Don’t have a code? `}
              <Link
                onClick={handleResendCode}
                sx={{
                  cursor: 'pointer',
                  ...(counting && {
                    color: 'text.disabled',
                    pointerEvents: 'none',
                  }),
                }}
              >
                Resend code {counting && `(${countdown}s)`}
              </Link>
            </Typography>
          </Stack>
          <Button
            fullWidth
            color="white"
            size="large"
            variant="soft"
            type="submit"
            onClick={onSubmit}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#00554E',
              color: 'white',
              marginTop: '30px',
            }}
          >
            Verify OTP
            <Icon>
              <ChevronRightIcon />
            </Icon>
          </Button>
        </Stack>
      </>
    </FormProvider>
  );
}
