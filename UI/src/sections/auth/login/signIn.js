import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Button, Icon, Stack, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import FormProvider from 'src/components/hook-form';
import * as Yup from 'yup';
// eslint-disable-next-line import/no-extraneous-dependencies
// eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
// eslint-disable-next-line import/no-extraneous-dependencies
// eslint-disable-next-line import/no-extraneous-dependencies
import MuiPhoneNumber from 'material-ui-phone-number';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { useRouter } from 'src/routes/hook';
import axiosInstance from 'src/utils/axios';

export default function SignInView() {
  const { enqueueSnackbar } = useSnackbar();

  // const { login } = useAuthContext();

  const router = useRouter();

  const [errorMsg, setErrorMsg] = useState('');

  // const searchParams = useSearchParams();

  // const returnTo = searchParams.get('returnTo');

  const password = useBoolean();

  const LoginSchema = Yup.object().shape({
    phoneNumber: Yup.string().required('Phone Number is required'),
    // password: Yup.string().required('Password is required'),
  });

  const defaultValues = {
    phoneNumber: '',
    // password: 'demo1234',
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
    setValue,
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    console.log('🚀 ~ data:', data.phoneNumber.length);
    if (!data.phoneNumber) {
      setErrorMsg('Phone Number is required');
      return;
    }
    if (data.phoneNumber.length <= 12) {
      setErrorMsg('Phone Number is too short');
      return;
    }
    try {
      const res = await axiosInstance.post('/send-otp-customer-login', {
        phoneNumber: data.phoneNumber,
      });
      console.log('🚀 ~ res:', res);
      if (res.data.success === true) {
        enqueueSnackbar(res.data.message, { variant: 'success' });
        const searchParams = new URLSearchParams({
          id: res.data.verificationSid,
          phoneNumber: data.phoneNumber,
        }).toString();

        const href = `/auth/jwt/otp?${searchParams}`;
        router.push(href);
      } else {
        setErrorMsg(res.data.message);
      }
    } catch (error) {
      console.error(error);
      reset();
      setErrorMsg(typeof error === 'string' ? error : error.message);
    }
  });

  const handelChange = (phoneNumber) => {
    setValue('phoneNumber', removeSpacesAndHyphens(phoneNumber));
  };
  const removeSpacesAndHyphens = (inputString) => inputString.replace(/[\s-]/g, '');

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5 }}>
      <Typography variant="h4">Sign in to Gravity</Typography>

      <Typography variant="body2">lorem epsum is simply dummy text for printing</Typography>

      <Typography sx={{ fontWeight: 600, marginTop: 2 }}>Enter your phone number</Typography>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={2.5}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

      <MuiPhoneNumber
        name="phoneNumber"
        defaultCountry="in"
        autoFormat
        onChange={handelChange}
        variant="outlined"
      />
      <Button
        fullWidth
        color="white"
        size="large"
        type="submit"
        variant="soft"
        onClick={onSubmit}
        // loading={isSubmitting}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#00554E',
          color: 'white',
          marginTop: '30px',
          lineHeight: 'revert-layer',
        }}
      >
        Send otp
        <Icon>
          <ChevronRightIcon />
        </Icon>
      </Button>
    </Stack>
  );
  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {renderHead}

      {renderForm}
    </FormProvider>
  );
}
