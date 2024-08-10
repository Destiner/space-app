import React from "react";
import { useAccount, useDisconnect } from "wagmi";
import * as Dialog from "@radix-ui/react-dialog";
import styles from "./ModalAccount.module.css";
import { getIcon } from "@/utils/connectors";
import SpaceDialog from "@/components/__common/SpaceDialog";

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
    <SpaceDialog title="Account" open={open} onOpenChange={onOpenChange}>
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
    </SpaceDialog>
  );
};

export default ModalAccount;
