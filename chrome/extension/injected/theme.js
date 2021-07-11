import styled from 'styled-components';

export const MainWrapper = styled.div`
  position: relative;
  max-width: 400px;
  height: 100%;
  padding: 20px;
  border: 1px solid rgba(100, 100, 100, 0.3);
`;

export const Title = styled.span`
  position: absolute;
  display: inline-block;
  padding: 0 12px;
  background-color: #1b262d;
  left: 50%;
  top: 0;
  transform: translate(-50%, -50%);
  white-space: nowrap;
`;

export const TitleBtn = styled.button`
  background: none;
  border: none;

  &:hover {
    color: #969b9e;
  }

  &:focus {
    background-color: unset !important;
  }
`;
