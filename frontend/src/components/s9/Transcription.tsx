import { Quote } from "lucide-react";

export function Transcription({ text }: { text: string }) {
  return (
    <section className="panel p-5" aria-label="Transcription">
      <h2 className="label-xs">Transcription</h2>
      <blockquote className="mt-3 flex gap-3 rounded-sm border border-border bg-secondary/30 p-4">
        <Quote className="h-4 w-4 shrink-0 text-accent" aria-hidden />
        <p className="font-mono text-sm leading-relaxed text-foreground">“{text}”</p>
      </blockquote>
    </section>
  );
}
