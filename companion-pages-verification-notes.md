# Companion pages verification

- The authenticated browser session rendered `/archive` after the async auth request completed.
- The page showed the DashboardLayout sidebar with Workspace, Archive, Library, Project settings, staff routes, and Public site.
- The Archive page rendered its heading, explanatory copy, and the clear-archive empty state with a working Open Workspace link.
- The first capture was blank while the auth query was still pending; a subsequent page view confirmed this was an async loading timing issue rather than a render failure.
- Preview mode chrome was visible at the bottom of the browser capture; it is not part of the page implementation.

The authenticated browser rendered `/library` after the async auth request completed. It showed three initialized personal resources (template, guide, prompt), the Add item control, pin controls and delete controls, with the same sidebar navigation. The first capture was blank during auth loading; the subsequent view confirmed the page rendered correctly.

The authenticated browser rendered `/settings` after the async auth request completed. The page showed the private-to-studio notice, Studio name input prefilled with “My studio”, a default focus-session select, and the Save settings action. The sidebar remained consistent with the companion pages.
