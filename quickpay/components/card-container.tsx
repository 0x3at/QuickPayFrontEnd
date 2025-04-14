// components/ui/card-container.tsx
import React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface CardContainerProps {
  title: string
  icon?: React.ReactNode
  actionButton?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
    variant?: "outline" | "default" | "ghost"
    size?: "default" | "sm" | "lg" | "icon"
  }
  className?: string
  headerClassName?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function CardContainer({
  title,
  icon,
  actionButton,
  className = "",
  headerClassName = "",
  children,
  footer
}: CardContainerProps) {
  return (
    <Card className={className}>
      <CardHeader className={`${headerClassName} ${actionButton ? "flex flex-row items-center justify-between pb-2" : ""}`}>
        <CardTitle className="text-lg flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        {actionButton && (
          <Button 
            variant={actionButton.variant || "outline"} 
            size={actionButton.size || "sm"} 
            onClick={actionButton.onClick}
            className="h-8"
          >
            {actionButton.icon && <span className="mr-1">{actionButton.icon}</span>}
            {actionButton.label}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
      {footer && (
        <CardFooter className="pt-0">
          {footer}
        </CardFooter>
      )}
    </Card>
  )
}