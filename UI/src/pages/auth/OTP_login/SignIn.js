import { Helmet } from 'react-helmet-async';
// sections
import { SignInView } from 'src/sections/auth/login/index';

// ----------------------------------------------------------------------

export default function LoginPage() {
  return (
    <>
      <Helmet>
        <title>Sign In</title>
      </Helmet>

      <SignInView />
    </>
  );
}
