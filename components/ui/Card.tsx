import { cn } from "@/lib/utils";
import "@/styles/components/Card.css";

interface CardProps {
  readonly children: React.ReactNode;
  readonly className?: string;
}

export default function Card({ children, className }: CardProps) {
  return <div className={cn("card", className)}>{children}</div>;
}
