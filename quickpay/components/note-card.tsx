// components/client/note-card.tsx
import React from 'react'
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Star } from "lucide-react"
import { Note } from '@/lib/types'

interface NoteCardProps {
  note: Note
  formatDate: (date: string) => string
}

export function NoteCard({ note, formatDate }: NoteCardProps) {
  return (
    <Card
      className={`p-2 ${
        note.important === "True"
          ? "border-yellow-300 bg-yellow-50/50 dark:bg-yellow-900/10"
          : "border-gray-200"
      }`}
    >
      <div className="flex justify-between items-start mb-0.5">
        <div className="font-medium text-xs">{note.author !== "" ? note.author : "System"}</div>
        {note.important === "True" && <Star className="h-3.5 w-3.5 text-yellow-400" />}
			</div>
			<div className="text-[10px] text-muted-foreground leading-tight">
				{formatDate(note.createdAt || '')}
			</div>
			<Separator className="my-1" />
			<div className="text-xs whitespace-pre-wrap leading-snug mt-0.5">
				{note.note}
			</div>
		</Card>
	);
}
