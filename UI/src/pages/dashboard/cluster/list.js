import { Helmet } from 'react-helmet-async';
// sections
import { ClusterListView } from 'src/sections/cluster/view';

// ----------------------------------------------------------------------

export default function ClusterListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Cluster List</title>
      </Helmet>

      <ClusterListView />
    </>
  );
}
