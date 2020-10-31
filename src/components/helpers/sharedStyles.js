/* eslint-disable no-param-reassign */
import styled from 'styled-components/macro';

export const GridItemSmall = styled.div`
  flex-grow: 1;
  width: 20%;
`;

export const borderRadius = 'border-radius: 20px;';
export const border = 'border: 2px solid green;';

export const WithBorder = styled.div`
  ${borderRadius}
  ${border}
`;

export const moveToHost = (id) => {
  const el = document.getElementById(`video-${id}`);
  if (el) {
    el.style.maxWidth = '20%';
    el.style.width = '200px';
    el.style.height = '200px';
    el.style.order = 2;
    el.style.marginBottom = 0;
  }
};

export const moveToMain = (id) => {
  const el = document.getElementById(`video-${id}`);
  if (el) {
    el.style.maxWidth = '100%';
    el.style.width = '100%';
    el.style.height = '500px';
    el.style.order = 1;
    el.style.marginBottom = '20px';
  }
};
