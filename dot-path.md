## 使い方

`DotPath` は、オブジェクトのネストされたプロパティを、ドットで区切った文字列としてキーに持つオブジェクト型を生成します。

以下はその使用例です。

```typescript
// 使用例:
type T1 = { a: { b: { c: number; d: { e: string } } } };
type R1 = DotPath<T1>;
//   ^^
//   {
//     "a.b.c": number;
//     "a.b.d.e": string;
//   }
```

## 実装

### 1. `DotPathUnion`

```typescript
type DotPathNested<
  T,
  Prefix extends string,
  Key extends keyof T
> = T[Key] extends object
  ? DotPathUnion<T[Key], `${Prefix}${Extract<Key, string>}.`>
  : { [P in `${Prefix}${Extract<Key, string>}`]: T[Key] };

/**
 * オブジェクト T の各プロパティに対して DotPathNested を適用し、すべての結果をユニオン型にします。
 */
type DotPathUnion<T, Prefix extends string = ""> = T extends object
  ? { [K in keyof T]-?: DotPathNested<T, Prefix, K> }[keyof T]
  : never;

type Nested = { a: { b: { c: number; d: { e: string } } } };
type Result = DotPathNested<Nested, "", "a">;
//   ^^^^^^
//   { "a.b.c": number; } | { "a.b.d.e": string; }
```

### 2. `UnionToIntersection`

```typescript
/**
 * ユニオン型 T を交差型に変換するためのユーティリティ型です。
 */
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;
```

### 3. `Simplify`

```typescript
/**
 * 交差型になった複数のオブジェクト型を単一のオブジェクト型に変換するためのユーティリティです。
 */
type Simplify<T> = { [K in keyof T]: T[K] };
```

#### 4. `DotPath`

```typescript
// DotPath: 最終的に、DotPathUnion によって得られたユニオン型を交差型に変換後、平坦化してひとつのオブジェクト型とする
type DotPath<T> = Simplify<UnionToIntersection<DotPathUnion<T>>>;
```
