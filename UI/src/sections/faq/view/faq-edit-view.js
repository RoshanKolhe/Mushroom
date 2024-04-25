// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { useGetFaq } from 'src/api/faq';
import FaqNewEditForm from '../faq-new-edit-form';


// ----------------------------------------------------------------------

export default function FaqEditView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const { faq: currentFaq } = useGetFaq(id);

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
            name: 'Faq',
            href: paths.dashboard.faq.list,
          },
          { name: currentFaq?.name },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <FaqNewEditForm currentFaq={currentFaq} />
    </Container>
  );
}
