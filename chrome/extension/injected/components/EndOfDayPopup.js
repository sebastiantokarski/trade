import React from 'react';
import Popup from 'reactjs-popup';
import styled from 'styled-components';

const PopupContent = styled.div`
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: 15px;
  padding: 15px;
  text-align: center;
  margin: 0 auto;
  transition: all 0.3s;
`;

const PopupTitle = styled.h5`
  text-transform: uppercase;
`;

const StartTradeDayPopup = ({ isOpen }) => {
  return (
    <Popup open={isOpen} closeOnDocumentClick={false}>
      <PopupContent>
        <PopupTitle>Come back tomorrow</PopupTitle>
      </PopupContent>
    </Popup>
  );
};

export default StartTradeDayPopup;
