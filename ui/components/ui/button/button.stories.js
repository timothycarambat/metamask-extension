import React from 'react';
import { action } from '@storybook/addon-actions';

import BuyIcon from '../icon/overview-buy-icon.component';

import README from './README.mdx';
import Button from '.';

export default {
  title: 'Button',
  component: Button,
  parameters: {
    docs: {
      page: README,
    },
  },
  argTypes: {
    children: { control: 'text' },
    disabled: { control: 'boolean' },
    onClick: { control: 'function' },
    type: {
      control: {
        type: 'select',
        options: [
          'default',
          'primary',
          'secondary',
          'warning',
          'danger',
          'danger-primary',
          'link',
        ],
      },
    },
    submit: { control: 'boolean' },
    large: { control: 'boolean' },
    className: { control: 'text' },
  },
};

export const DefaultStory = (args) => (
  <Button {...args}>{args.children}</Button>
);

DefaultStory.story = {
  name: 'Default',
};

DefaultStory.args = {
  children: 'Default',
};

export const types = (args) => (
  <>
    <Button {...args} onClick={action('clicked')} type="default">
      {args.children || 'Default'}
    </Button>
    <Button {...args} onClick={action('clicked')} type="primary">
      {args.children || 'Primary'}
    </Button>
    <Button {...args} onClick={action('clicked')} type="secondary">
      {args.children || 'Secondary'}
    </Button>
    <Button {...args} onClick={action('clicked')} type="warning">
      {args.children || 'Warning'}
    </Button>
    <Button {...args} onClick={action('clicked')} type="danger">
      {args.children || 'Danger'}
    </Button>
    <Button {...args} onClick={action('clicked')} type="danger-primary">
      {args.children || 'Danger primary'}
    </Button>
    <Button {...args} onClick={action('clicked')} type="link">
      {args.children || 'Link'}
    </Button>
  </>
);

export const linkType = (args) => (
  <Button {...args} onClick={action('clicked')} type="link" />
);

linkType.args = {
  children: 'Click me',
};

export const withIcon = (args) => (
  <Button
    {...args}
    onClick={action('clicked')}
    type="primary"
    icon={<BuyIcon />}
  >
    {args.children || 'Buy'}
  </Button>
);
