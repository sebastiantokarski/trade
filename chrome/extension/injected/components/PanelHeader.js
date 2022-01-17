import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import BalanceSlider from './BalanceSlider';
import { fetchLedgers } from '../redux/slices/accountSlice';

const Header = styled.div`
  borderbottom: 1px solid rgba(100, 100, 100, 0.3);
  cursor: pointer;
`;

const HeaderWrapper = styled.div`
  width: 100%;
  display: flex;
  alignitems: center;
`;

const RefreshIcon = styled.i`
  margin-right: 0.4rem;
`;

const PanelHeader = ({ numberOfAttempts }) => {
  const dispatch = useDispatch();

  const [refreshCount, setRefreshCount] = useState(0);

  const { performDataSuccess } = useSelector((state) => state.account);

  useEffect(() => {
    if (refreshCount) {
      dispatch(fetchLedgers());
    }
  }, [dispatch, refreshCount]);

  return (
    <Header className="ui-collapsible__header">
      <HeaderWrapper>
        <div style={{ width: '20%' }}>
          <RefreshIcon
            className="fa fa-refresh fa-fw bfx-blue"
            onClick={() => setRefreshCount((count) => count + 1)}
          />
          <span className="ui-collapsible__title">Refresh</span>
        </div>
        <div style={{ width: '60%' }}>{performDataSuccess && <BalanceSlider />}</div>
        <div style={{ width: '20%', textAlign: 'right' }}>
          <span>Number of attempts: {numberOfAttempts}</span>
        </div>
      </HeaderWrapper>
    </Header>
  );
};

export default React.memo(PanelHeader);
