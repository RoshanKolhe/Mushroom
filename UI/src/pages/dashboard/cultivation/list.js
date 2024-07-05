import { Helmet } from 'react-helmet-async';
// sections
import { CultivationEntriesListView } from 'src/sections/Cultivation-Entries/view';
// ----------------------------------------------------------------------

export default function CultivationListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new Hut</title>
      </Helmet>

      <CultivationEntriesListView />
    </>
  );
}