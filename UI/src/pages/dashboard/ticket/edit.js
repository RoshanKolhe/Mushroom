import { Helmet } from 'react-helmet-async';
// sections
import TicketEditView from 'src/sections/ticket/view/ticket-edit-view';

// ----------------------------------------------------------------------

export default function TicketEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Ticket Edit</title>
      </Helmet>

      <TicketEditView />
    </>
  );
}
