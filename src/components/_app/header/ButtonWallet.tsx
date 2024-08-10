import { useAccount } from "wagmi";
import ChipAccount from "./ChipAccount";
import ButtonConnect from "./ButtonConnect";

const ButtonWallet: React.FC = () => {
  const { isConnected } = useAccount();

  return isConnected ? <ChipAccount /> : <ButtonConnect />;
};

export default ButtonWallet;
