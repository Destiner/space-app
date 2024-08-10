import ChipAccount from "./ChipAccount";
import ButtonLogIn from "./ButtonLogIn";
import { useSignerStatus } from "@alchemy/aa-alchemy/react";

const ButtonWallet: React.FC = () => {
  const { isConnected } = useSignerStatus();

  return isConnected ? <ChipAccount /> : <ButtonLogIn />;
};

export default ButtonWallet;
