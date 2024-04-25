import { Helmet } from 'react-helmet-async';
// sections
import { TicketCreateView } from 'src/sections/ticket/view';

// ----------------------------------------------------------------------

export default function TicketCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new Ticket</title>
      </Helmet>

      <TicketCreateView />
    </>
  );
}
