// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { useGetHut } from 'src/api/hut';
import HutNewEditForm from '../hut-new-edit-form';


// ----------------------------------------------------------------------

export default function HutEditView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const { hut: currentHut } = useGetHut(id);

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
            name: 'Hut',
            href: paths.dashboard.hut.list,
          },
          { name: currentHut?.name },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <HutNewEditForm currentHut={currentHut} />
    </Container>
  );
}
