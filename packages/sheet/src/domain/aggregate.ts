export type Aggregate<Id extends string | number, Props> =
  & Readonly<{
    id: Id;
    state: Props;
  }>

export type AnyAggregate = Aggregate<string | number, unknown>;
