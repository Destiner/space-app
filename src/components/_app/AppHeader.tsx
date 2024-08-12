"use client";

import style from "./AppHeader.module.css";
import ButtonWallet from "./header/ButtonWallet";

const AppHeader: React.FC = () => {
  return (
    <header className={style.header}>
      <div className={style.side}>
        <a href="/">Home</a>
        <a href="/search">Search</a>
        <a href="/new">Create</a>
      </div>
      <div className={style.side}>
        <ButtonWallet />
      </div>
    </header>
  );
};

export default AppHeader;
