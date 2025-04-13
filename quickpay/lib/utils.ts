import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
import { toast } from "sonner"

// Success toast with completed border color
export const successToast = (message: string, description?: string) => {
  toast.success(message, {
    description,
    position: "top-center",
    duration: 3000,
    style: {
      backgroundColor: "var(--card)",
      color: "var(--card-foreground)",
      border: "3px solid var(--success)"
    },
  })
}

// Error toast with error border color
export const errorToast = (message: string, description?: string) => {
  toast.error(message, {
    description,
    position: "top-center", 
    duration: 5000,
    style: {
      backgroundColor: "var(--card)",
      color: "var(--card-foreground)",
      border: "3px solid var(--error)"
    },
  })
}

// Info toast with success border color
export const infoToast = (message: string, description?: string) => {
  toast.info(message, {
    description,
    position: "top-center",
    duration: 3000,
    style: {
      backgroundColor: "var(--card)",
      color: "var(--card-foreground)", 
      border: "3px solid var(--completed)"
    },
  })
}
