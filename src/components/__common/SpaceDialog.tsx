import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import styles from "./SpaceDialog.module.css";

interface Props {
  title: string;
  description?: string;
  open: boolean;
  onOpenChange: (value: boolean) => void;
  children: React.ReactNode;
}

const CustomDialog = ({
  title,
  description,
  open,
  onOpenChange,
  children,
}: Props) => {
  const handleOpenChange = (value: boolean) => {
    if (!value) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content}>
          <VisuallyHidden asChild>
            <Dialog.Title>{title}</Dialog.Title>
          </VisuallyHidden>
          {description && (
            <VisuallyHidden asChild>
              <Dialog.Description>{description}</Dialog.Description>
            </VisuallyHidden>
          )}
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CustomDialog;
