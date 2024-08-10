import React from "react";
import { useConnect, useChainId, Connector } from "wagmi";
import * as Dialog from "@radix-ui/react-dialog";
import { getIcon } from "@/utils/connectors";
import styles from "./ModalConnectors.module.css";

interface ModalConnectorsProps {
  open: boolean;
  onClose: () => void;
}

const ModalConnectors: React.FC<ModalConnectorsProps> = ({ open, onClose }) => {
  const chainId = useChainId();
  const { connectors, connect } = useConnect();

  const handleConnectorClick = (connector: Connector) => {
    connect({ connector, chainId });
    onClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Title>Connectors</Dialog.Title>
          <h3>Connectors</h3>
          <div className={styles.list}>
            {connectors.map((connector) => (
              <div
                key={connector.id}
                className={styles.item}
                onClick={() => handleConnectorClick(connector)}
              >
                <img
                  src={getIcon(connector)}
                  alt="icon"
                  className={styles.icon}
                />
                {connector.name}
              </div>
            ))}
          </div>
          <Dialog.Close />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ModalConnectors;
