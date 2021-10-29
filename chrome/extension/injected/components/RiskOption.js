import React from 'react';
import styled from 'styled-components';
import { RadioButton } from './UI';
import { useSelector } from 'react-redux';

const RiskOptionWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Value = styled.span`
  display: inline-block;
  margin-left: 10px;
  text-align: right;
  min-width: 55px;
`;

const RiskOption = ({ option, onChange, currBalance }) => {
  const { label, name, perc } = option;

  const { leverage } = useSelector((state) => state.pageInfo);
  const { minBalance } = useSelector((state) => state.account);

  const potentialLossProfit = currBalance ? currBalance + currBalance * (perc / 100) : 0;
  const colorClass = perc >= 0 ? 'bfx-green-text' : 'bfx-red-text';

  return (
    <RiskOptionWrapper>
      <RadioButton
        name="risk"
        value={name}
        label={label}
        onChange={onChange}
        disabled={minBalance > potentialLossProfit}
      />
      <div>
        <span className={colorClass}>{(perc / leverage).toFixed(2)}%</span>
        <Value className={colorClass}>{(perc - 0.4 * leverage).toFixed(2)}%</Value>
        <Value className={colorClass}>{potentialLossProfit.toFixed(2)}$</Value>
      </div>
    </RiskOptionWrapper>
  );
};

export default RiskOption;
