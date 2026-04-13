/**
 * NoteBlock renders a low-severity informational annotation.
 * Uses a blue accent to indicate general information.
 *
 * @param props.text - The note message text.
 */

import { InformationCircleIcon } from "@heroicons/react/24/outline";

interface NoteBlockProps {
  text: string;
}

export default function NoteBlock({ text }: NoteBlockProps) {
  return (
    <div className="flex items-start gap-3 rounded-r-lg bg-blue-50 border-l-4 border-blue-500 p-4">
      <InformationCircleIcon className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
      <p className="text-sm text-blue-800">
        <span className="font-bold">NOTE</span> &mdash; {text}
      </p>
    </div>
  );
}
