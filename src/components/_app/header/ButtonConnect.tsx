import { useState } from "react";
import ModalConnectors from "./ModalConnectors";

const Chip: React.FC = () => {
  const [open, setOpen] = useState(false);

  const openModal = () => setOpen(true);
  const closeModal = () => setOpen(false);

  return (
    <>
      <button onClick={openModal}>Connect</button>
      <ModalConnectors open={open} onClose={closeModal} />
    </>
  );
};
