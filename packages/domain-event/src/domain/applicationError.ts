export type ApplicationError<TType extends string, TDetail> = Readonly<{
    type: TType;
    message: string;
    detail: TDetail;
}>;
