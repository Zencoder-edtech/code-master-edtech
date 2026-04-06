// =============================================================================
// PostCSS Configuration for the Web App
// =============================================================================
// PostCSS is the tool that PROCESSES your CSS files.
// It takes your .css files → runs Tailwind CSS plugin → outputs final CSS.
//
// This imports the shared PostCSS config from packages/tailwind-config
// so all apps use the same Tailwind setup.
// =============================================================================

import { postcssConfig } from "@repo/tailwind-config/postcss";

export default postcssConfig;
