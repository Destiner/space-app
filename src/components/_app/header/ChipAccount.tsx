import ModalAccount from "./ModalAccount";
import styles from "./ChipAccount.module.css";
import { useUser } from "@alchemy/aa-alchemy/react";
import { useEffect, useMemo, useState } from "react";
import { getEnsAvatar, getEnsName } from "@wagmi/core";
import { getEnsConfig } from "@/wagmi";
import { normalize } from "viem/ens";

const ChipAccount: React.FC = () => {
  const user = useUser();
  const [open, setOpen] = useState(false);

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

  const label = useMemo(() => {
    if (ensName) {
      return ensName;
    }
    if (user) {
      return user.email;
    }
    return "Account";
  }, [ensName, user]);

  const icon = useMemo(() => {
    if (ensAvatar) {
      return ensAvatar;
    }
    return undefined;
  }, [ensAvatar]);

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
        {icon && <img src={icon} alt="avatar" className={styles.avatar} />}
        <div>{label}</div>
      </div>
      <ModalAccount open={open} onOpenChange={handleOpenChange} />
    </>
  );
};

export default ChipAccount;
