import React, { useState, useEffect } from 'react';
import Popup from 'reactjs-popup';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { clearStorage, getStorageData } from '../storage';
import { STORAGE_STR, TEXT_1, TEXT_2, TEXT_3, TEXT_4 } from '../../config';

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

const Input = styled.input`
  width: 70p !important;
`;

const StartTradeDayPopup = () => {
  const [open, setOpen] = useState(false);

  const { currBalance } = useSelector((state) => state.account);

  useEffect(async () => {
    const data = await getStorageData(STORAGE_STR);

    if (!data || (data && !data[new Date().toLocaleDateString()])) {
      setOpen(true);
    }
  }, []);

  const closeModal = async () => {
    setOpen(false);
    //await setStorageData({ [STORAGE_STR]: { [new Date().toLocaleDateString()]: true } });
  };

  return (
    <Popup open={open}>
      <PopupContent>
        <PopupTitle>{TEXT_1}</PopupTitle>
        <p>{TEXT_2}</p>
        <div>
          {TEXT_4}: <b>{currBalance && currBalance.toFixed(2)}$</b>
        </div>
        <div>
          <span>{TEXT_3}</span>
          <Input type="number" className="ui-labeledinput__input" />
        </div>
        <button type="button" className="ui-button" onClick={closeModal}>
          Continue
        </button>
      </PopupContent>
    </Popup>
  );
};

export default StartTradeDayPopup;
