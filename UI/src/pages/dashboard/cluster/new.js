import { Helmet } from 'react-helmet-async';
// sections
import { ClusterCreateView } from 'src/sections/cluster/view';

// ----------------------------------------------------------------------

export default function ClusterCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new Cluster</title>
      </Helmet>

      <ClusterCreateView />
    </>
  );
}
