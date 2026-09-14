import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

/** Bottom sheet on mobile, centered dialog on larger screens. */
export function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const isMobile = useIsMobile();
  const { dir } = useI18n();
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
        <DrawerContent dir={dir} className="max-h-[92dvh] rounded-t-3xl border-border bg-popover">
          <DrawerHeader className="text-start">
            <DrawerTitle className="text-lg">{title}</DrawerTitle>
            {description ? <DrawerDescription>{description}</DrawerDescription> : <DrawerDescription className="sr-only">{title}</DrawerDescription>}
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom,0px)+1.25rem)]">{children}</div>
        </DrawerContent>
      </Drawer>
    );
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir={dir} className="max-h-[90dvh] overflow-y-auto rounded-3xl border-border bg-popover sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle className="text-lg">{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : <DialogDescription className="sr-only">{title}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  body,
  confirmLabel,
  destructive = true,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title?: string;
  body?: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
}) {
  const { t, dir } = useI18n();
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent dir={dir} className="rounded-3xl border-border bg-popover">
        <AlertDialogHeader className="text-start">
          <AlertDialogTitle>{title ?? t("common.confirmDeleteTitle")}</AlertDialogTitle>
          <AlertDialogDescription>{body ?? t("common.confirmDeleteBody")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:justify-start">
          <AlertDialogCancel className="rounded-xl">{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant={destructive ? "destructive" : "default"} onClick={onConfirm}>
              {confirmLabel ?? t("common.delete")}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function FormActions({
  onCancel,
  submitting,
  submitLabel,
}: {
  onCancel: () => void;
  submitting?: boolean;
  submitLabel?: string;
}) {
  const { t } = useI18n();
  return (
    <div className="mt-2 flex gap-2 pt-2">
      <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
        {t("common.cancel")}
      </Button>
      <Button type="submit" variant="hero" className="flex-1" disabled={submitting}>
        {submitting ? t("common.saving") : (submitLabel ?? t("common.save"))}
      </Button>
    </div>
  );
}
