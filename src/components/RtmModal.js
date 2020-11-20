import { useEffect, useState } from 'react';

import { Modal } from './Modal';

export const RtmModal = ({ rtm, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => rtm.addisOpenHandler(setIsOpen));

  return <Modal {...{ isOpen, setIsOpen, ...props }} />;
};
