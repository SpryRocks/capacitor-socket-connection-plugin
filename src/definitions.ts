export interface CapacitorSocketConnectionPluginPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
