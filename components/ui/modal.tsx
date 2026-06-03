"use client";

import React, { useCallback } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  size?: ModalSize;
  hideCloseButton?: boolean;
}

const sizeMap: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
  full: "max-w-full",
};

const Modal = React.memo<ModalProps>(function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  size = "md",
  hideCloseButton = false,
}) {
  const handleClose = useCallback(() => onClose(), [onClose]);

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 sm:items-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className={cn(
                  "relative w-full transform overflow-hidden rounded-lg border border-red-900/50 bg-neutral-950 text-left align-middle shadow-xl shadow-red-950/20 transition-all",
                  sizeMap[size],
                  className
                )}
              >
                {(title || description || !hideCloseButton) && (
                  <div className="flex items-start justify-between gap-4 border-b border-red-900/30 px-5 py-4">
                    <div className="min-w-0">
                      {title && (
                        <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-red-500">
                          {title}
                        </Dialog.Title>
                      )}
                      {description && (
                        <Dialog.Description as="p" className="mt-1 text-sm text-neutral-400">
                          {description}
                        </Dialog.Description>
                      )}
                    </div>
                    {!hideCloseButton && (
                      <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-red-950/60 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 focus:ring-offset-neutral-950"
                        aria-label="Cerrar"
                      >
                        <X className="h-5 w-5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                )}

                <div className="px-5 py-5 text-neutral-200">{children}</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
});

export default Modal;