// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import TicketNewEditForm from '../ticket-new-edit-form';
//

// ----------------------------------------------------------------------

export default function TicketCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Add a new FAQ"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Manage FAQ’s',
            href: paths.dashboard.ticket.list,
          },
          { name: 'New FAQ' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <TicketNewEditForm />
    </Container>
  );
}
