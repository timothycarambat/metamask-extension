import React from 'react';
import Slider from '.';

export default {
  title: 'Slider/Slider List',
  id: __filename,
};

export const Default = () => <Slider />;

export const SliderWithSteps = () => <Slider step={10} />;

export const SliderWithHeader = () => (
  <Slider
    titleText="Slider Title Text"
    tooltipText="Slider Tooltip Text"
    valueText="$ 00.00"
    titleDetail="100 GWEI"
  />
);

export const SliderWithFooter = () => (
  <Slider
    titleText="Slider Title Text"
    tooltipText="Slider Tooltip Text"
    valueText="$ 00.00"
    titleDetail="100 GWEI"
    infoText="Footer Info Text"
    onEdit={() => {
      console.log('on edit click');
    }}
  />
);
