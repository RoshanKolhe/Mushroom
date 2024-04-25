import { Helmet } from 'react-helmet-async';
// sections
import { SalesDataListView } from 'src/sections/salesData/view';

// ----------------------------------------------------------------------

export default function SalesDataListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: SalesData List</title>
      </Helmet>

      <SalesDataListView />
    </>
  );
}
