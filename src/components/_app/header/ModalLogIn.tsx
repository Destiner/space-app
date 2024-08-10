import React, { useState } from "react";
import styles from "./ModalLogIn.module.css";
import SpaceDialog from "@/components/__common/SpaceDialog";
import { useAuthenticate, useSignerStatus } from "@alchemy/aa-alchemy/react";

interface ModalLogInProps {
  open: boolean;
  onClose: () => void;
}

const ModalLogIn: React.FC<ModalLogInProps> = ({ open, onClose }) => {
  const { authenticate } = useAuthenticate();
  const { status } = useSignerStatus();
  const [email, setEmail] = useState("");

  const isAwaitingEmail = status === "AWAITING_EMAIL_AUTH";

  function login(evt: React.FormEvent) {
    evt.preventDefault();
    authenticate({ type: "email", email });
  }

  return (
    <SpaceDialog
      title="Connectors"
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
    >
      <h3>Log In</h3>
      {isAwaitingEmail ? (
        <div>Logging in…</div>
      ) : (
        <form onSubmit={login}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(evt) => setEmail(evt.target.value)}
          />
          <button type="submit">Log in</button>
        </form>
      )}
    </SpaceDialog>
  );
};

export default ModalLogIn;
