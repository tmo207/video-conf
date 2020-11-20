import styled, { css } from 'styled-components/macro';

export const GREEN = '#8bbb48';
export const RED = '#ab0000';
export const BLACK = '#000000';
export const BORDER_RADIUS = 'border-radius: 20px;';
export const BORDER = `border: 2px solid ${GREEN};`;
export const CONTENT_MARGIN = '160px';
export const HOST_VIDEO_WIDTH = '18%';

export const GridItemSmall = styled.div`
  flex-grow: 1;
  width: 20%;
`;

export const ControlItem = styled.button.attrs((props) => ({
  className: props.isActive ? 'active' : '',
}))`
  width: 60px;
  height: 60px;
  background-color: white;
  border-radius: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  ${(props) => (props.red ? 'border: none;' : BORDER)}
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

export const withBorder = css`
  ${BORDER_RADIUS}
  ${BORDER}
`;

export const modalStyle = {
  overlay: {
    zIndex: 20,
  },
  content: {
    color: 'BLACK',
    textAlign: 'center',
    maxWidth: '90vw',
    width: '300px',
    height: 'fit-content',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '20px',
  },
};
