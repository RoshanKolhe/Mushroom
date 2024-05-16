import { Helmet } from 'react-helmet-async';
// sections
import MissedEntryListView from 'src/sections/missedEntry/view/missedEntry-list-view';

// ----------------------------------------------------------------------

export default function MissedEntryListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Missed Entries List</title>
      </Helmet>

      <MissedEntryListView />
    </>
  );
}
