// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import ClusterNewEditForm from '../cluster-new-edit-form';

// ----------------------------------------------------------------------

export default function ClusterCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new cluster"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Manage Clusters',
            href: paths.dashboard.cluster.list,
          },
          { name: 'New cluster' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ClusterNewEditForm />
    </Container>
  );
}
