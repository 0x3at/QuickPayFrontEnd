import React from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { NoteV2 } from '@/lib/typesV2';
import { Plus, Star } from 'lucide-react';

interface NotesCardProps {
  notes: NoteV2[];
  formatDate: (date: string) => string;
  onAddNote?: () => void;
  onViewAllNotes?: () => void;
  className?: string;
  maxNotes?: number;
}

export function NotesCard({
  notes,
  formatDate,
  onAddNote,
  className = '',
  maxNotes = 4
}: NotesCardProps) {
  // Sort notes by importance and then by date
  const sortedNotes = [...notes].sort((a, b) => {
    // First sort by importance
    if (a.important && !b.important) return -1;
    if (!a.important && b.important) return 1;
    
    // Then by date (newest first)
    // Handle potentially null/undefined createdAt values
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <Card className={className}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-400" />
          Recent Notes
        </CardTitle>
        <Button variant="outline" size="sm" className="h-8" onClick={onAddNote}>
          <Plus className="h-4 w-4 mr-1" />
          Add Note
        </Button>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sortedNotes.slice(0, maxNotes).map((note) => (
            <Card
              key={note.noteID}
              className={`p-2 ${
                note.important
                  ? "border-yellow-300 bg-yellow-50/50 dark:bg-yellow-900/10"
                  : "border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start mb-0.5">
                <div className="font-medium text-xs">{note.author !== "" ? note.author : "System"}</div>
                {note.important && <Star className="h-3.5 w-3.5 text-yellow-400" />}
              </div>
              <div className="text-[10px] text-muted-foreground leading-tight">
                {note.createdAt ? formatDate(note.createdAt) : 'No date'}
              </div>
              <Separator className="my-1" />
              <div className="text-xs whitespace-pre-wrap leading-snug mt-0.5">{note.note}</div>
            </Card>
          ))}
          {sortedNotes.length === 0 && (
            <div className="text-center col-span-2 py-2 text-muted-foreground">No notes found</div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
      </CardFooter>
    </Card>
  );
} 