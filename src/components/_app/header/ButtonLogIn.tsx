import { useState } from "react";
import ModalLogIn from "./ModalLogIn";

const ButtonLogIn: React.FC = () => {
  const [open, setOpen] = useState(false);

  const openModal = () => setOpen(true);
  const closeModal = () => setOpen(false);

  return (
    <>
      <button onClick={openModal}>Log In</button>
      <ModalLogIn open={open} onClose={closeModal} />
    </>
  );
};

export default ButtonLogIn;
