import { Helmet } from 'react-helmet-async';
// sections
import { OtpView } from 'src/sections/auth/login/index';

// ----------------------------------------------------------------------

export default function OtpPage() {
  return (
    <>
      <Helmet>
        <title>OTP</title>
      </Helmet>

      <OtpView />
    </>
  );
}
