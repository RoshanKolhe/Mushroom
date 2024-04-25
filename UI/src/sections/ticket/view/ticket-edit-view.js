// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { useGetTicket } from 'src/api/ticket';
import TicketNewEditForm from '../ticket-new-edit-form';


// ----------------------------------------------------------------------

export default function TicketEditView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const { ticket: currentTicket } = useGetTicket(id);

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
            name: 'Ticket',
            href: paths.dashboard.ticket.list,
          },
          { name: currentTicket?.name },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <TicketNewEditForm currentTicket={currentTicket} />
    </Container>
  );
}
