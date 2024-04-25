import { Helmet } from 'react-helmet-async';
// sections
import FaqEditView from 'src/sections/faq/view/faq-edit-view';

// ----------------------------------------------------------------------

export default function FaqEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Faq Edit</title>
      </Helmet>

      <FaqEditView />
    </>
  );
}
