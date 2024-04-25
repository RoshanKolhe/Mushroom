// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { useGetSalesData } from 'src/api/salesData';
import SalesDataNewEditForm from '../salesData-new-edit-form';


// ----------------------------------------------------------------------

export default function SalesDataEditView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const { salesData: currentSalesData } = useGetSalesData(id);

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
            name: 'SalesData',
            href: paths.dashboard.salesData.list,
          },
          { name: currentSalesData?.name },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <SalesDataNewEditForm currentSalesData={currentSalesData} />
    </Container>
  );
}
