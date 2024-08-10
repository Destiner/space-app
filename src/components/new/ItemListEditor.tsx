import React, { useState } from "react";
import ItemEditor, { Item } from "./ItemEditor";
import styles from "./Editor.module.css";

interface ItemListEditorProps {
  initialModel: Item[];
  onChange: (model: Item[]) => void;
}

const ItemListEditor: React.FC<ItemListEditorProps> = ({
  initialModel,
  onChange,
}) => {
  const [model, setModel] = useState<Item[]>(initialModel);

  const handleModelUpdate = (index: number, newValue: Item): void => {
    const updatedModel = [...model];
    updatedModel[index] = newValue;
    setModel(updatedModel);
    onChange(updatedModel);
  };

  const addItem = (): void => {
    const updatedModel = [...model, { label: "", value: "" }];
    setModel(updatedModel);
    onChange(updatedModel);
  };

  const removeItem = (index: number): void => {
    const updatedModel = model.filter((_, i) => i !== index);
    setModel(updatedModel);
    onChange(updatedModel);
  };

  return (
    <div className={styles.editor}>
      <div className={styles.list}>
        {model.map((item, index) => (
          <div key={index} className={styles.itemWrapper}>
            <ItemEditor
              initialItem={item}
              onChange={(newValue) => handleModelUpdate(index, newValue)}
            />
            <button
              type="button"
              className={styles.remove}
              onClick={() => removeItem(index)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button type="button" className={styles.add} onClick={addItem}>
        Add
      </button>
    </div>
  );
};

export default ItemListEditor;
