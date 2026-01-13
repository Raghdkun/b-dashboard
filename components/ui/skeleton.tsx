import { cn } from "@/lib/utils";

interface SkeletonProps extends React.ComponentProps<"div"> {
  shimmer?: boolean;
}

function Skeleton({ className, shimmer = true, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "rounded-(--radius-md) bg-muted",
        shimmer && "skeleton-shimmer",
        className
      )}
      {...props}
    />
  );
}

// Text line skeleton
interface SkeletonTextProps extends React.ComponentProps<"div"> {
  lines?: number;
  lastLineWidth?: string;
}

function SkeletonText({
  lines = 1,
  lastLineWidth = "75%",
  className,
  ...props
}: SkeletonTextProps) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{
            width: i === lines - 1 && lines > 1 ? lastLineWidth : "100%",
          }}
        />
      ))}
    </div>
  );
}

// Circle skeleton (avatars, icons)
interface SkeletonCircleProps extends React.ComponentProps<"div"> {
  size?: number;
}

function SkeletonCircle({ size = 40, className, ...props }: SkeletonCircleProps) {
  return (
    <Skeleton
      className={cn("rounded-full shrink-0", className)}
      style={{ width: size, height: size }}
      {...props}
    />
  );
}

// Avatar with text skeleton
function SkeletonAvatar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex items-center gap-3", className)} {...props}>
      <SkeletonCircle size={40} />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

// Button skeleton
interface SkeletonButtonProps extends React.ComponentProps<"div"> {
  size?: "sm" | "default" | "lg";
}

function SkeletonButton({ size = "default", className, ...props }: SkeletonButtonProps) {
  const sizeClasses = {
    sm: "h-8 w-16",
    default: "h-10 w-24",
    lg: "h-12 w-32",
  };
  return <Skeleton className={cn(sizeClasses[size], className)} {...props} />;
}

// Card skeleton
function SkeletonCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-(--radius-lg) border bg-card p-6 space-y-4",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <SkeletonCircle size={20} />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-40" />
    </div>
  );
}

export {
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonCard,
};
