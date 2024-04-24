// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { useGetCluster } from 'src/api/cluster';
import ClusterNewEditForm from '../cluster-new-edit-form';

// ----------------------------------------------------------------------

export default function ClusterEditView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const { cluster: currentCluster } = useGetCluster(id);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Cluster',
            href: paths.dashboard.cluster.list,
          },
          { name: currentCluster?.name },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ClusterNewEditForm currentCluster={currentCluster} />
    </Container>
  );
}
