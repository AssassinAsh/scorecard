"use client";

// Simple shared dialog-open flag for client components.
// Any component with dialogs can call setDialogOpen to
// indicate whether a dialog is currently visible.

let dialogOpen = false;

export function setDialogOpen(isOpen: boolean) {
  dialogOpen = isOpen;
}

export function isDialogOpen(): boolean {
  return dialogOpen;
}
