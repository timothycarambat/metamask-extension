import React from 'react';

import ConfirmTransactionBase from '.';

export default {
  title: 'Confirmation Screens/Confirm Transaction Base',
  id: __filename,
};

const PageSet = ({ children }) => {
  return children;
};

export const ConfirmTransactionBaseComponent = () => {
  return (
    <PageSet>
      <ConfirmTransactionBase />
    </PageSet>
  );
};
