import React from "react";
import { useAccount, useDisconnect } from "wagmi";
import * as Dialog from "@radix-ui/react-dialog";
import styles from "./ModalAccount.module.css";
import { getIcon } from "@/utils/connectors";

interface ModalAccountProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ModalAccount: React.FC<ModalAccountProps> = ({ open, onOpenChange }) => {
  const { address, connector } = useAccount();
  const { disconnect } = useDisconnect();

  const connectorIcon = connector ? getIcon(connector) : undefined;
  const connectorName = connector ? connector.name : undefined;
  const accountAddress = address || "Account";

  const handleDisconnectClick = () => {
    disconnect();
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Title>Account</Dialog.Title>
          <div className={styles.content}>
            <div className={styles.walletMain}>
              <div className={styles.connector}>
                {connectorIcon && (
                  <img
                    src={connectorIcon}
                    alt="icon"
                    className={styles.connectorIcon}
                  />
                )}
                {connectorName && (
                  <div className={styles.connectorName}>{connectorName}</div>
                )}
              </div>
              <div>{accountAddress}</div>
            </div>
            <div>
              <button onClick={handleDisconnectClick}>Disconnect</button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ModalAccount;
