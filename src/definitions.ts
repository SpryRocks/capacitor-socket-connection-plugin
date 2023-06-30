export interface ICapacitorSocketConnectionDefinitions {
  echo(options: {value: string}): Promise<{value: string}>;
}
