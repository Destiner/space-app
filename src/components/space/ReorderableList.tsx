import update from "immutability-helper";
import type { FC } from "react";
import { useCallback, useState } from "react";
import type { Identifier, XYCoord } from "dnd-core";
import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import styles from "./ReorderableList.module.css";

import { type Item } from "@/components/__common/ItemEditor";

export interface CardProps {
  id: any;
  index: number;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
  children: React.ReactNode;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

const Card: FC<CardProps> = ({ id, index, moveCard, children }) => {
  const type = "card";

  const ref = useRef<HTMLDivElement>(null);
  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null }
  >({
    accept: type,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type,
    item: () => {
      return { id, index };
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));
  return (
    <div
      ref={ref}
      className={styles.card}
      style={{ opacity }}
      data-handler-id={handlerId}
    >
      {children}
    </div>
  );
};

interface ReorderableItemListProps {
  items: Item[];
  onItemsChange: (items: Item[], dragItem: Item, hoverItem: Item) => void;
  onItemRemove: (item: Item) => void;
  disabled: boolean;
}

const ReorderableItemList: FC<ReorderableItemListProps> = ({
  items,
  onItemsChange,
  onItemRemove,
  disabled,
}: ReorderableItemListProps) => {
  {
    const moveCard = useCallback(
      (dragIndex: number, hoverIndex: number) => {
        onItemsChange(
          update(items, {
            $splice: [
              [dragIndex, 1],
              [hoverIndex, 0, items[dragIndex]],
            ],
          }),
          items[dragIndex],
          items[hoverIndex]
        );
      },
      [items, onItemsChange]
    );

    const handleRemoveClick = (item: Item) => {
      onItemRemove(item);
    };

    const renderItem = useCallback(
      (item: Item, index: number) => {
        return (
          <Card key={item.id} index={index} id={item.id} moveCard={moveCard}>
            <div className={styles.item}>
              <div className={styles.link}>
                <div className={styles.label}>{item.label}</div>
                <div className={styles.value}>{item.value}</div>
              </div>
              <button
                className={`${styles.button} ${styles.small}`}
                onClick={() => handleRemoveClick(item)}
              >
                Remove
              </button>
            </div>
          </Card>
        );
      },
      [moveCard, handleRemoveClick]
    );

    return (
      <>
        <div className={`${styles.list} ${disabled ? styles.disabled : ""} `}>
          {items.map((item, i) => renderItem(item, i))}
        </div>
      </>
    );
  }
};

export default ReorderableItemList;
