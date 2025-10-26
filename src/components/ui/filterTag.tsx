import { cn } from "@/lib/styleUtils";

// biome-ignore lint/correctness/noUnusedVariables: Is used
namespace FilterTag {
  export interface Props {
    name: string;
    onClick?: () => void;
  }
}

function FilterTag(props: FilterTag.Props) {
  return (
    <button
      type="button"
      className="mb-2 flex flex-wrap gap-2"
      disabled={props.onClick === undefined}
      onClick={props.onClick ? props.onClick : undefined}
    >
      <div
        className={cn(
          "whitespace-nowrap rounded border border-border/40 bg-muted/50 px-2 py-0.5 text-xs sm:text-sm",
          props.onClick
            ? "cursor-pointer transition-colors duration-300 hover:bg-muted/75"
            : "cursor-not-allowed",
        )}
      >
        {props.name}
      </div>
    </button>
  );
}

export default FilterTag;
