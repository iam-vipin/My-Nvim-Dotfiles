import { NewTabIcon } from "@plane/propel/icons";
import type { IURLComponents } from "@plane/utils";
import { cn } from "@plane/utils";

interface TruncatedUrlProps {
  url: IURLComponents;
  maxPathLength?: number;
  className?: string;
  showLinkIcon?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

const MAX_PATH_LENGTH = 15;

export function TruncatedUrl({
  url,
  maxPathLength = MAX_PATH_LENGTH,
  className = "",
  showLinkIcon = false,
  onClick,
}: TruncatedUrlProps) {
  const { pathname, full: fullURL } = url;
  const displayDomain = fullURL.hostname;
  const fullDisplayUrl = (pathname ?? "") + (fullURL.search ?? "") + (fullURL.hash ?? "");
  const shouldTruncate = fullDisplayUrl.length > maxPathLength;
  const truncatedDisplayUrl = shouldTruncate ? fullDisplayUrl.slice(0, maxPathLength) : fullDisplayUrl;

  return (
    <a
      href={url.full.href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center decoration-[0.5px] underline underline-offset-2 text-tertiary",
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
    >
      <span className="text-body-xs-regular">{displayDomain}</span>
      {fullURL.pathname && fullURL.pathname.length > 0 && (
        <span className="text-body-xs-regular">
          {truncatedDisplayUrl}
          {shouldTruncate && "..."}
        </span>
      )}
      {showLinkIcon && (
        <span className="ml-1 inline-block">
          <NewTabIcon className="h-3 w-3 flex-shrink-0" />
        </span>
      )}
    </a>
  );
}
