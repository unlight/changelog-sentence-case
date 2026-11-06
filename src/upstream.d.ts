declare module '@semantic-release/release-notes-generator' {
  import type { GenerateNotesContext } from 'semantic-release';

  type UpstreamConfig = Record<string, unknown>;

  export function generateNotes(
    pluginConfig: UpstreamConfig,
    context: GenerateNotesContext,
  ): Promise<string>;
}
