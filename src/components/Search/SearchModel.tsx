"use client";

import React, { useState } from "react";
import { Modal, ModalContent, ModalTrigger } from "../ui/modal";
import { FlashSearch } from "./FlashSearch";

export const Search: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Modal open={isOpen} onOpenChange={() => setIsOpen(!isOpen)}>
      <ModalTrigger>
        <Search />
      </ModalTrigger>
      <ModalContent>
        <FlashSearch />
      </ModalContent>
    </Modal>
  );
};
