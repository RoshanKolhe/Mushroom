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
import CultivationNewEditForm from '../cultivation-new-edit-form';


// ----------------------------------------------------------------------

export default function CultivationEditView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const { Cultivation: currentCultivation } = useGetHut(id);

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
            name: 'Cultivation',
            href: paths.dashboard.Cultivation.list,
          },
          { name: currentCultivation?.name },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {/* <CultivationNewEditForm currentCultivation={currentCultivation} /> */}
    </Container>
  );
}
