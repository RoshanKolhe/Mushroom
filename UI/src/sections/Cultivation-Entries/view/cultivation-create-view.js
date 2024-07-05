// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import CultivationNewEditForm from '../cultivation-new-edit-form';
//

// ----------------------------------------------------------------------

export default function CultivationCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new cultivation"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Manage Cultivation',
            href: paths.dashboard.hut.list,
          },
          { name: 'New Cultivation Entry' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <CultivationNewEditForm />
    </Container>
  );
}
