// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import SalesDataNewEditForm from '../salesData-new-edit-form';
//

// ----------------------------------------------------------------------

export default function SalesDataCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Add a sale data entry"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Manage Sales data',
            href: paths.dashboard.salesData.list,
          },
          { name: 'New entry' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <SalesDataNewEditForm />
    </Container>
  );
}
