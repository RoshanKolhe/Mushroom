// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { useGetMushroomType } from 'src/api/mushroomType';
import MushroomTypeNewEditForm from '../mushroomType-new-edit-form';


// ----------------------------------------------------------------------

export default function MushroomTypeEditView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const { mushroomType: currentMushroomType } = useGetMushroomType(id);

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
            name: 'MushroomType',
            href: paths.dashboard.mushroomType.list,
          },
          { name: currentMushroomType?.name },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <MushroomTypeNewEditForm currentMushroomType={currentMushroomType} />
    </Container>
  );
}
