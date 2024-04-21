// import { useForm, Controller } from 'react-hook-form';
// import { yupResolver } from '@hookform/resolvers/yup';
// import * as Yup from 'yup';
// import Stack from '@mui/material/Stack';
// import Button from '@mui/material/Button';
// import Typography from '@mui/material/Typography';
// import ChevronRightIcon from '@mui/icons-material/ChevronRight';
// import { Icon } from '@iconify/react';
// import Iconify from 'src/components/iconify';
// import FormProvider, { RHFAutocomplete } from 'src/components/hook-form';
// import { countries } from 'src/assets/data';

// export default function Auth0LoginView() {
//   const validationSchema = Yup.object().shape({
//     country: Yup.string().required('Country is required'),
//   });

//   const methods = useForm({
//     resolver: yupResolver(validationSchema),
//   });

//   const { handleSubmit } = methods;

//   const onSubmit = (data) => {
//     // Logic to handle form submission
//     console.log(data);
//     // Perform actions like sending OTP
//   };

//   return (
//     <FormProvider {...methods}>
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <Typography variant="h4" sx={{ mb: 2 }}>
//           Sign in to Minimal
//         </Typography>
//         <Typography variant="body2" sx={{ mb: 5 }}>
//           Enter your mobile number to sign in
//         </Typography>

//         <Stack spacing={2}>
//           <Typography variant="h6">Enter your phone number</Typography>
//           <RHFAutocomplete
//             name="country"
//             label="Country"
//             options={countries.map((country) => country.label)}
//             getOptionLabel={(option) => option}
//             renderOption={(props, option) => {
//               const { code, label, phone } = countries.filter(
//                 (country) => country.label === option
//               )[0];

//               if (!label) {
//                 return null;
//               }

//               return (
//                 <li {...props} key={label}>
//                   <Iconify
//                     key={label}
//                     icon={`circle-flags:${code.toLowerCase()}`}
//                     width={28}
//                     sx={{ mr: 1 }}
//                   />
//                   {label} ({code}) +{phone}
//                 </li>
//               );
//             }}
//           >
//             {({ field }) => (
//               <Controller
//                 name={field.name}
//                 control={methods.control}
//                 render={({ field }) => (
//                   <Autocomplete
//                     {...field}
//                     options={countries.map((country) => country.label)}
//                     getOptionLabel={(option) => option}
//                     renderInput={(params) => <TextField {...params} label="Country" />}
//                   />
//                 )}
//               />
//             )}
//           </RHFAutocomplete>
//           <Button
//             type="submit"
//             fullWidth
//             color="white"
//             size="large"
//             variant="soft"
//             sx={{
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               backgroundColor: '#00554E',
//               color: 'white',
//               marginTop: '30px',
//             }}
//           >
//             Send otp
//             <Icon>
//               <ChevronRightIcon />
//             </Icon>
//           </Button>
//         </Stack>
//       </form>
//     </FormProvider>
//   );
// }


// login 

// imports

import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { countries } from 'src/assets/data';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider from 'src/components/hook-form';
import { Stack, Typography, Button, Icon } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MuiPhoneNumber from 'material-ui-phone-number';
import { useNavigate } from 'react-router';
import { paths } from 'src/routes/paths';

export default function Auth0LoginView() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  console.log('countries',countries)

  const  updateSchema = Yup.object().shape({
    phoneNumber: Yup.string().required('Phone number is required'),
    // country: Yup.string().required('Country is required'),
  })
  const methods = useForm({resolver: yupResolver(updateSchema)});

  const {handleSubmit} = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      // enqueueSnackbar('Otp send successfully');
      navigate(paths.auth.amplify.login);
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

  return(
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack spacing={2}>
        <Typography variant='h4'>Sign in to Gravity</Typography>
        <Typography variant='body2'>lorem epsum is simply dummy text for printing</Typography>
        <Typography>Enter your phone number</Typography>
          <MuiPhoneNumber
          name='phoneNumber'
          defaultCountry='us'
          // onChange={handelChange}
          variant='outlined'
          />
        <Button
            type="submit"
            fullWidth
            color="white"
            size="large"
            variant="soft"
            onClick={handleSubmit}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              backgroundColor: '#00554E',
              color: 'white',
              marginTop: '30px',
            }}
          >
            Send otp
            <Icon>
              <ChevronRightIcon />
            </Icon>
          </Button>
      </Stack>
    </FormProvider>
  )
}
