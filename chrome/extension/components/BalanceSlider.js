import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Nouislider from 'nouislider-react';

const BalanceSlider = ({ data }) => {
  const { currBalance = 0, currDayBalance, currBalanceModifier = 0 } = data;

  if (!currDayBalance) {
    return null;
  }

  const minimalBalance = currDayBalance - currDayBalance * 0.12;
  const targetBalance = currDayBalance + currDayBalance * 0.2;
  const modCurrBalance = currBalance + currBalanceModifier - currBalance * 0.018;

  const sliderPoints = [
    { name: 'minimalBalance', value: minimalBalance, label: 'Min' },
    { name: 'currDayBalance', value: currDayBalance, label: 'Initial' },
    { name: 'targetBalance', value: targetBalance, label: 'Target' },
    { name: 'currBalance', value: modCurrBalance, label: 'Curr' },
  ].sort((a, b) => a.value - b.value);

  const sliderRange = {
    min: minimalBalance - minimalBalance * 0.2,
    max: targetBalance + targetBalance * 0.2,
  };

  const sliderTooltips = sliderPoints.map(() => true);

  const sliderStart = sliderPoints.map((point) => point.value);

  useEffect(() => {
    const currTooltip = document.querySelector('.custom-tooltip-curr');

    if (currTooltip) {
      currTooltip.parentNode.style.cssText = 'bottom: 120% !important';
    }
  }, [currBalanceModifier]);

  const sliderFormat = {
    from: Number,
    to: (value) => {
      const currPoint = sliderPoints.find((point) => point.value === value);

      if (currPoint && currPoint.label !== 'Curr') {
        const { label } = currPoint;

        return `
          <div class="custom-tooltip">
            <span class="custom-tooltip-title">${label}</span>
            <div class="custom-tooltip-value">
              $${value.toFixed(2)}
            </div>
          </div>
        `;
      }

      return `
        <div class="custom-tooltip custom-tooltip-curr">
          <div>$${value.toFixed(2)}</div>
        </div>
      `;
    },
  };

  return (
    <Nouislider
      range={sliderRange}
      tooltips={sliderTooltips}
      start={sliderStart}
      format={sliderFormat}
      connect
    />
  );
};

BalanceSlider.propTypes = {
  data: PropTypes.shape({
    currBalance: PropTypes.number,
    currDayBalance: PropTypes.number,
    currBalanceModifier: PropTypes.number,
  }),
};

export default BalanceSlider;
