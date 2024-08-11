import React, { useState } from "react";
import styles from "./ItemEditor.module.css";

interface Item {
  label: string;
  value: string;
  id: number;
}

interface ItemEditor {
  initialItem?: Item;
  onChange?: (item: Item) => void;
}

const ItemEditor: React.FC<ItemEditor> = ({ initialItem, onChange }) => {
  const [item, setItem] = useState<Item>(
    initialItem || { label: "", value: "", id: 0 }
  );

  const handleChange =
    (field: keyof Item) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const newItem = { ...item, [field]: e.target.value };
      setItem(newItem);
      onChange?.(newItem);
    };

  return (
    <div className={styles.editor}>
      <input
        value={item.label}
        onChange={handleChange("label")}
        placeholder="label"
        className={`${styles.input} ${styles.label}`}
      />
      <input
        value={item.value}
        onChange={handleChange("value")}
        placeholder="insert link"
        className={`${styles.input} ${styles.value}`}
      />
    </div>
  );
};

export default ItemEditor;
export type { Item };
