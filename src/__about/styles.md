# styles.js

The one stylesheet, injected once per document on the first mount.

## Why the CSS lives in JS

A consumer gets Tumbler by importing one module. Asking them to also remember
a `<link>` is how a component ends up unstyled in somebody's build. Every rule
is namespaced `tmb-` and touches nothing outside the mounted element, so
dropping it into a host page cannot collide with the host's own styles.

## Only compositor properties

Every animation here moves `transform` or `opacity` and nothing else — never a
property that forces layout. That is what lets the ring keep turning while the
main thread is busy doing the very work the user is waiting for.

## Reduced motion slows, it does not stop

A loading indicator that stands still is a broken loading indicator. Under
`prefers-reduced-motion` the ornament slows by roughly 3x and the flicker
stops, but the ring still turns.
