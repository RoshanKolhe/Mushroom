import { Helmet } from 'react-helmet-async';
// sections
import SalesDataEditView from 'src/sections/salesData/view/salesData-edit-view';

// ----------------------------------------------------------------------

export default function SalesDataEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: SalesData Edit</title>
      </Helmet>

      <SalesDataEditView />
    </>
  );
}
