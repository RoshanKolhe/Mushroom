import { Helmet } from 'react-helmet-async';
// sections
import { TicketListView } from 'src/sections/ticket/view';

// ----------------------------------------------------------------------

export default function TicketListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Ticket List</title>
      </Helmet>

      <TicketListView />
    </>
  );
}
