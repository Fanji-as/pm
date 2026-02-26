import { cn } from "@/lib/utils";

interface CardProps {
  readonly children: React.ReactNode;
  readonly className?: string;
}

export default function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-md border border-gray-200",
        className,
      )}
    >
      {children}
    </div>
  );
}
