import React from 'react';
import PrivacySettings from './privacy-settings';

export default {
  title: 'Onboarding Page/Privacy Settings',
  id: __filename,
};

export const Default = () => {
  return (
    <div style={{ maxHeight: '2000px' }}>
      <PrivacySettings />
    </div>
  );
};
