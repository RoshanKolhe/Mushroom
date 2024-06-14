// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import NewNotificationEditForm from '../newNotification-new-edit-form';
//

// ----------------------------------------------------------------------

export default function NewNotificationCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Send Notification"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },

          { name: 'New Notification' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <NewNotificationEditForm />
    </Container>
  );
}
