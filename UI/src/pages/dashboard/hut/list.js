import { Helmet } from 'react-helmet-async';
// sections
import { HutListView } from 'src/sections/hut/view';

// ----------------------------------------------------------------------

export default function HutListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Hut List</title>
      </Helmet>

      <HutListView />
    </>
  );
}
