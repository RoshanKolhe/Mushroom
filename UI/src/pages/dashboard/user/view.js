import { Helmet } from 'react-helmet-async';
// sections
import UserDetailsView from 'src/sections/user/view/user-details-view';

// ----------------------------------------------------------------------

export default function UserViewPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: User View</title>
      </Helmet>

      <UserDetailsView />
    </>
  );
}
