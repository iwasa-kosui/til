export type Aggregate<Id extends string | number, Props> =
  & Readonly<{
    id: Id;
  }>
  & Readonly<Props>;

export type AnyAggregate = Aggregate<string | number, unknown>;
