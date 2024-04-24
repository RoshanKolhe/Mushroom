import { Helmet } from 'react-helmet-async';
// sections
import ClusterEditView from 'src/sections/cluster/view/cluster-edit-view';

// ----------------------------------------------------------------------

export default function ClusterEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Cluster Edit</title>
      </Helmet>

      <ClusterEditView />
    </>
  );
}
