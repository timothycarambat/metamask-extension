import React from 'react';
import { action } from '@storybook/addon-actions';
import UnlockPage from './unlock-page.component';

export default {
  title: 'Page/Unlock Page',
  id: __filename,
};

export const UnlockPageComponent = () => {
  return (
    <UnlockPage
      onSubmit={action('Login')}
      forceUpdateMetamaskState={() => ({
        participateInMetaMetrics: true,
      })}
      showOptInModal={() => null}
      history={{}}
    />
  );
};
