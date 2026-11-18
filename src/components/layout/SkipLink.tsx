/** Selector of the main landmark that the skip link moves focus to. */
export const MAIN_CONTENT_ID = 'main';

/**
 * First focusable element on every page. It stays off screen until focused,
 * and activation moves keyboard focus to the main landmark.
 * Focus is set in code so the URL hash and router state stay unchanged.
 */
export function SkipLink() {
  return (
    <a
      href={`#${MAIN_CONTENT_ID}`}
      onClick={(event) => {
        const main = document.getElementById(MAIN_CONTENT_ID);
        if (!main) return;
        event.preventDefault();
        main.focus();
      }}
      className="fixed left-4 top-4 z-[100] inline-flex min-h-[44px] -translate-y-[200%] items-center rounded-lg bg-surface-elevated px-4 text-sm font-semibold text-text-primary shadow-lg ring-2 ring-primary focus:translate-y-0"
    >
      Skip to content
    </a>
  );
}
