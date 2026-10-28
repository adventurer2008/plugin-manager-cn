# Plugin Manager CN

- TypeScript + Obsidian API + esbuild. Single settings page, three sections.
- Preserve target data.json and all non-release files. Never manage this plugin itself.
- Serialize mutations. Download before unloading. Backup and recover release files on failure.
- Internal Obsidian APIs belong in compat.ts. Mobile support requires real device acceptance.
- Never call a loaded version user-verified automatically. Ordinary bulk updates exclude Wujie.
- Do not invent production OSS endpoints or hashes. Document missing publication dependencies.
- Run npm run check and npm test and npm run build before delivery.
