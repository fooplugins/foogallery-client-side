# Mosaic

Mosaic is a Pro-only template. Its layout is implemented in native JavaScript
under `js/` and is included only in the Pro client bundle. The implementation
is deterministic, keeps markup and navigation order intact, and may make only
bounded nearby visual swaps to avoid poor crops.

The template accepts `density`, `gap`, `prominence`, and `prominentIds` options.
Generated thumbnail widths are treated as hard layout ceilings.
