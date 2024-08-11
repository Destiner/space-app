import React, { useEffect, useState } from "react";
import { useAccount, useLogout, useUser } from "@alchemy/aa-alchemy/react";
import styles from "./ModalAccount.module.css";
import SpaceDialog from "@/components/__common/SpaceDialog";
import { getEnsAvatar, getEnsName } from "@wagmi/core";
import { getEnsConfig } from "@/wagmi";
import { normalize } from "viem/ens";
import { accountType } from "@/alchemy";

interface ModalAccountProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ModalAccount: React.FC<ModalAccountProps> = ({ open, onOpenChange }) => {
  const user = useUser();
  const { address } = useAccount({
    type: accountType,
  });
  const { logout } = useLogout();

  const [ensName, setEnsName] = useState<string | null>(null);
  const [ensAvatar, setEnsAvatar] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const config = getEnsConfig();
      if (user) {
        const name = await getEnsName(config, {
          address: user.address,
        });
        setEnsName(name);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      const config = getEnsConfig();
      if (ensName) {
        const avatar = await getEnsAvatar(config, {
          name: normalize(ensName),
        });
        setEnsAvatar(avatar);
      }
    };
    fetchData();
  }, [ensName]);

  const handleDisconnectClick = () => {
    logout();
    onOpenChange(false);
  };

  return (
    <SpaceDialog title="Account" open={open} onOpenChange={onOpenChange}>
      <div className={styles.content}>
        <div className={styles.walletMain}>
          <div className={styles.ens}>
            {ensAvatar && (
              <img src={ensAvatar} alt="icon" className={styles.ensIcon} />
            )}
            {ensName && <div>{ensName}</div>}
          </div>
          {user?.email && <div>Email: {user.email}</div>}
          {address && <div>Address: {address}</div>}
        </div>
        <div>
          <button onClick={handleDisconnectClick}>Disconnect</button>
        </div>
      </div>
    </SpaceDialog>
  );
};

export default ModalAccount;
