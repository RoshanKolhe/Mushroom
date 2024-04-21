// import * as Yup from 'yup';
// import { useForm } from 'react-hook-form';
// import { useState } from 'react';
// import { yupResolver } from '@hookform/resolvers/yup';
// // @mui
// import LoadingButton from '@mui/lab/LoadingButton';
// import Link from '@mui/material/Link';
// import Alert from '@mui/material/Alert';
// import Stack from '@mui/material/Stack';
// import IconButton from '@mui/material/IconButton';
// import Typography from '@mui/material/Typography';
// import InputAdornment from '@mui/material/InputAdornment';
// // routes
// import { paths } from 'src/routes/paths';
// import { RouterLink } from 'src/routes/components';
// import { useSearchParams, useRouter } from 'src/routes/hook';
// // config
// import { PATH_AFTER_LOGIN } from 'src/config-global';
// // hooks
// import { useBoolean } from 'src/hooks/use-boolean';
// // auth
// import { useAuthContext } from 'src/auth/hooks';
// // components
// import Iconify from 'src/components/iconify';
// import FormProvider, { RHFTextField } from 'src/components/hook-form';

// // ----------------------------------------------------------------------

// export default function AmplifyLoginView() {
//   const { login } = useAuthContext();

//   const router = useRouter();

//   const [errorMsg, setErrorMsg] = useState('');

//   const searchParams = useSearchParams();

//   const returnTo = searchParams.get('returnTo');

//   const password = useBoolean();

//   const LoginSchema = Yup.object().shape({
//     email: Yup.string().required('Email is required').email('Email must be a valid email address'),
//     password: Yup.string().required('Password is required'),
//   });

//   const defaultValues = {
//     email: '',
//     password: '',
//   };

//   const methods = useForm({
//     resolver: yupResolver(LoginSchema),
//     defaultValues,
//   });

//   const {
//     reset,
//     handleSubmit,
//     formState: { isSubmitting },
//   } = methods;

//   const onSubmit = handleSubmit(async (data) => {
//     try {
//       await login?.(data.email, data.password);

//       router.push(returnTo || PATH_AFTER_LOGIN);
//     } catch (error) {
//       console.error(error);
//       reset();
//       setErrorMsg(typeof error === 'string' ? error : error.message);
//     }
//   });

//   const renderHead = (
//     <Stack spacing={2} sx={{ mb: 5 }}>
//       <Typography variant="h4">Sign in to Minimal</Typography>

//       <Stack direction="row" spacing={0.5}>
//         <Typography variant="body2">New user?</Typography>

//         <Link component={RouterLink} href={paths.auth.amplify.register} variant="subtitle2">
//           Create an account
//         </Link>
//       </Stack>
//     </Stack>
//   );

//   const renderForm = (
//     <Stack spacing={3}>
//       {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

//       <RHFTextField name="email" label="Email address" />

//       <RHFTextField
//         name="password"
//         label="Password"
//         type={password.value ? 'text' : 'password'}
//         InputProps={{
//           endAdornment: (
//             <InputAdornment position="end">
//               <IconButton onClick={password.onToggle} edge="end">
//                 <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
//               </IconButton>
//             </InputAdornment>
//           ),
//         }}
//       />

//       <Link
//         component={RouterLink}
//         href={paths.auth.amplify.forgotPassword}
//         variant="body2"
//         color="inherit"
//         underline="always"
//         sx={{ alignSelf: 'flex-end' }}
//       >
//         Forgot password?
//       </Link>

//       <LoadingButton
//         fullWidth
//         color="inherit"
//         size="large"
//         type="submit"
//         variant="contained"
//         loading={isSubmitting}
//       >
//         Login
//       </LoadingButton>
//     </Stack>
//   );

//   return (
//     <FormProvider methods={methods} onSubmit={onSubmit}>
//       {renderHead}

//       {renderForm}
//     </FormProvider>
//   );
// }

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
// import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { MuiOtpInput } from 'mui-one-time-password-input';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Icon } from '@iconify/react';
import { Link } from '@mui/material';
import FormProvider from 'src/components/hook-form';

export default function AmplifyLoginView() {
  const [otp, setOtp] = useState('');
  const { handleSubmit, ...methods } = useForm();

  const handleClick = () => {
    // logic after clicking on send otp button
  };

  const otpValidationSchema = Yup.object().shape({
    otp: Yup.string().required('OTP is required'),
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Submit logic
    } catch (error) {
      console.error(error);
    }
  });

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
          <Stack spacing={2} alignItems="center">
            <MuiOtpInput autoFocus gap={1.5} length={4} name="otp" />
            <Typography variant="body2" sx={{ fontSize: '12px', textAlign: 'center' }}>
              Didn&apos;t receive code? <Link underline="hover">Resend</Link>
            </Typography>
          </Stack>
          <Button
            fullWidth
            color="white"
            size="large"
            variant="soft"
            onClick={handleClick}
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#00554E', color: 'white', marginTop: '30px' }}
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

