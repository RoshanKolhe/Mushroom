// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import MushroomTypeNewEditForm from '../mushroomType-new-edit-form';
//

// ----------------------------------------------------------------------

export default function MushroomTypeCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Add a New Mushroom Type"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Manage Mushroom Types',
            href: paths.dashboard.mushroomType.list,
          },
          { name: 'New entry' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <MushroomTypeNewEditForm />
    </Container>
  );
}
