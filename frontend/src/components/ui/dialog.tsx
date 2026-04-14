"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
DialogPortal.displayName = DialogPrimitive.Portal.displayName
const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[100] bg-stone-900/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    {/* CAPA 2: CONTENEDOR DE SCROLL HERMANO (Z-210) */}
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-0 z-[210] overflow-y-auto pointer-events-auto custom-scrollbar flex flex-col outline-none p-4 sm:p-6",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        }
      }}
      {...props}
    >
      {/* EL FOLIO BLANCO (Escala dinámica de anchos y border-radius unificado a 0.75rem / rounded-xl) */}
      <div 
        className={cn(
          "relative mx-auto my-auto sm:my-8 w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl bg-background rounded-xl shadow-2xl p-0 ring-1 ring-black/5 pointer-events-auto",
          className
        )}
      >
        {/* BOTÓN DE CIERRE STICKY DENTRO DEL FOLIO */}
        <DialogPrimitive.Close className="absolute right-4 top-5 sm:sticky sm:top-6 sm:float-right sm:mr-6 sm:right-auto sm:mt-0 rounded-full ring-offset-background transition-colors hover:bg-stone-200 focus:outline-none focus:ring-2 focus:ring-ring disabled:pointer-events-none w-10 h-10 flex items-center justify-center bg-white shadow-lg border border-stone-100 z-[150]">
          <X size={20} strokeWidth={2.5} className="text-stone-800" />
          <span className="sr-only">Cerrar</span>
        </DialogPrimitive.Close>

        {children}
      </div>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-serif font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
