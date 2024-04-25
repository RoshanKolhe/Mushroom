import { Helmet } from 'react-helmet-async';
// sections
import { FaqCreateView } from 'src/sections/faq/view';

// ----------------------------------------------------------------------

export default function FaqCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new Faq</title>
      </Helmet>

      <FaqCreateView />
    </>
  );
}
