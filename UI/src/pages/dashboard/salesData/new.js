import { Helmet } from 'react-helmet-async';
// sections
import { SalesDataCreateView } from 'src/sections/salesData/view';

// ----------------------------------------------------------------------

export default function SalesDataCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new SalesData</title>
      </Helmet>

      <SalesDataCreateView />
    </>
  );
}
