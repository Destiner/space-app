import React, { useState, useMemo } from "react";
import { useAccount, useEnsName } from "wagmi";
import * as Dialog from "@radix-ui/react-dialog";
import { getIcon } from "@/utils/connectors";
import { formatAddress } from "@/utils/formatters";
import ModalAccount from "./ModalAccount";
import styles from "./Chip.module.css";

const Chip: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { address, connector } = useAccount();
  const { data: ensName } = useEnsName({ address });

  const label = useMemo(() => {
    if (ensName) {
      return ensName;
    }
    if (address) {
      return formatAddress(address);
    }
    return "Account";
  }, [ensName, address]);

  const icon = useMemo(
    () => (connector ? getIcon(connector) : undefined),
    [connector]
  );

  const openModal = () => setOpen(true);
  const closeModal = () => setOpen(false);
  const handleOpenChange = (value: boolean) => {
    if (!value) {
      closeModal();
    }
  };

  return (
    <>
      <div className={styles.chip} onClick={openModal}>
        <img src={icon} alt="icon" className={styles.icon} />
        {label}
      </div>
      <ModalAccount open={open} onOpenChange={handleOpenChange} />
    </>
  );
};

export default Chip;
