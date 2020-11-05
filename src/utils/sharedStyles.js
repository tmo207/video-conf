import styled from 'styled-components/macro';

export const green = '#8bbb48';
export const red = '#ab0000';
export const black = '#000000';
export const borderRadius = 'border-radius: 20px;';
export const border = `border: 2px solid ${green};`;
export const contentMarginTop = '200px';
export const hostVideoWidth = '18%';

export const GridItemSmall = styled.div`
  flex-grow: 1;
  width: 20%;
`;

export const ControlItem = styled.button`
  width: 60px;
  height: 60px;
  background-color: white;
  border-radius: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  ${(props) => (props.red ? 'border: none;' : border)}
  background-color: ${(props) => {
    let color;
    if (props.red) {
      color = 'red';
    } else {
      color = props.isActive ? 'white' : 'grey';
    }
    return color;
  }};
  &:hover {
    cursor: pointer;
  }
`;

export const WithBorder = styled.div`
  ${borderRadius}
  ${border}
`;

export const moveToHost = (id) => {
  const el = document.getElementById(`video-${id}`);
  if (el) {
    el.style.width = hostVideoWidth;
    el.style.order = 2;
    el.style.marginBottom = 0;
  }
};

export const moveToMain = (id) => {
  const el = document.getElementById(`video-${id}`);
  if (el) {
    el.style.width = '100%';
    el.style.order = 1;
    el.style.marginBottom = '20px';
  }
};
