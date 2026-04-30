# Agent 06: Insight — Fix Child Story Display + Empty State Handling Improvements

1. Abstract child stories rendering to a separate `ChildStory` component for better testability and reuse.
2. Memoize the `ICard` component using `React.memo` to prevent unnecessary re-renders when parent properties haven't changed.
3. Add skeleton loading states in place of "Running AI pipeline…" text for a better visual user experience.
