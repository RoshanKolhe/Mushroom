// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// _mock
import { _userList } from 'src/_mock';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { useGetUser } from 'src/api/user';
import UserNewViewForm from '../user-new-view-form';

// ----------------------------------------------------------------------

export default function UserDetailsView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const { user: currentUser } = useGetUser(id);
  console.log(currentUser);
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="View"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'User',
            href: paths.dashboard.user.list,
          },
          {
            name: `${currentUser?.firstName} ${currentUser?.lastName ? currentUser?.lastName : ''}`,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <UserNewViewForm currentUser={currentUser} />
    </Container>
  );
}
