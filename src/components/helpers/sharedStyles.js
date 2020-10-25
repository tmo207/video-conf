import styled from 'styled-components/macro';

export const GridItemSmall = styled.div`
  flex-grow: 1;
  max-width: 20%;
`;

export const borderRadius = 'border-radius: 20px;';
export const border = 'border: 2px solid green;';

export const WithBorder = styled.div`
  ${borderRadius}
  ${border}
`;
