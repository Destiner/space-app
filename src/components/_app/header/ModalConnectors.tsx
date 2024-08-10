import React from "react";
import { useConnect, useChainId, Connector } from "wagmi";
import * as Dialog from "@radix-ui/react-dialog";
import { getIcon } from "@/utils/connectors";
import styles from "./ModalConnectors.module.css";
import SpaceDialog from "@/components/__common/SpaceDialog";

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
    <SpaceDialog
      title="Connectors"
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
    >
      <h3>Connectors</h3>
      <div className={styles.list}>
        {connectors.map((connector) => (
          <div
            key={connector.id}
            className={styles.item}
            onClick={() => handleConnectorClick(connector)}
          >
            <img src={getIcon(connector)} alt="icon" className={styles.icon} />
            {connector.name}
          </div>
        ))}
      </div>
    </SpaceDialog>
  );
};

export default ModalConnectors;
