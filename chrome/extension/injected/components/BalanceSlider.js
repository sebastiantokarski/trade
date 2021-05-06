import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Nouislider from 'nouislider-react';

const BalanceSlider = ({ minBalance, currDayBalance, currActiveBalance, targetBalance }) => {
  if (!currDayBalance) {
    return null;
  }

  const sliderPoints = [
    { name: 'minimalBalance', value: minBalance, label: 'Min' },
    { name: 'currDayBalance', value: currDayBalance, label: 'Initial' },
    { name: 'targetBalance', value: targetBalance, label: 'Target' },
    { name: 'currBalance', value: currActiveBalance, label: 'Curr' },
  ].sort((a, b) => a.value - b.value);

  const sliderRange = {
    min: minBalance * 0.9,
    max: targetBalance * 1.3,
  };

  const sliderTooltips = sliderPoints.map(() => true);

  const sliderStart = sliderPoints.map((point) => point.value);

  useEffect(() => {
    const currTooltip = document.querySelector('.custom-tooltip-curr');

    if (currTooltip) {
      currTooltip.parentNode.style.cssText = 'bottom: 120% !important';
    }
  }, [currActiveBalance]);

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
  minBalance: PropTypes.number,
  currDayBalance: PropTypes.number,
  currActiveBalance: PropTypes.number,
  targetBalance: PropTypes.number,
};

export default BalanceSlider;
