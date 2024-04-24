// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import HutNewEditForm from '../hut-new-edit-form';
//

// ----------------------------------------------------------------------

export default function HutCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new hut"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Manage Huts',
            href: paths.dashboard.hut.list,
          },
          { name: 'New hut' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <HutNewEditForm />
    </Container>
  );
}
