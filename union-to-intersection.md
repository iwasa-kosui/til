## はじめに

Union 型から交差型へ変換するユーティリティ型を紹介し、その仕組みを解説します。

私はこのユーティリティ型を時々利用しますが、その原理を度々忘れてしまうのでここにメモしておきます。

## 使い方

以下の例では、`UnionToIntersection` が `Age | Name` を `Age & Name` へ変換しています。

```typescript
type Age = { age: number };
type Name = { name: string };

type User = UnionToIntersection<Age | Name>;
//   ^^^^
//   Age & Name
```

## 実装

ここでは、`UnionToIntersection` をいくつかのユーティリティ型を組み合わせて実装します。

1. `ToFunction<T>` は、`T` を第一引数に取る関数に変換します。
2. `Parameter<T>` は、関数の第一引数の型を取得します。

つまり、最終的には `UnionToIntersection<T>` の結果は `T` と一致するように思えます。なぜこの操作で Union 型が交差型へ変換されるのでしょうか。

```typescript
/**
 * Tを第一引数に取る関数に変換するユーティリティ型
 */
type ToFunction<T> = [T] extends [unknown] ? (x: T) => void : never;

/**
 * 関数の引数の型を取得するユーティリティ型
 */
type Parameter<T> = [T] extends [(x: infer I) => void] ? I : never;

/**
 * UnionをIntersectionに変換するユーティリティ型
 */
type UnionToIntersection<T> = Parameter<ToFunction<T>>;
```

## 解説

### `ToFunction` の役割

#### 条件型の分配法則

- [TypeScript: Documentation - Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types)
- [TypeScript 条件型の分配法則 - PADAone's Notes - Obsidian Publish](https://publish.obsidian.md/pd1-notes/ts-distributive-conditional-type)

条件型において、型パラメータがユニオン型の場合、各メンバーに対して条件式が分配的に適用されます。

以下の例では、`ToFunctionDistributed` は `Age` と `Name` のそれぞれに対して適用され、結果として 2 つの関数型が得られます。

```typescript
type ToFunctionDistributed<T> = T extends unknown ? (x: T) => void : never;

type UserFunction = ToFunctionDistributed<Age | Name>;
//   ^^^^^^^^^^^^
//   ((x: Age) => void) | ((x: Name) => void)
```

しかし、`ToFunction` のように `extends` キーワードの各辺を角括弧 `[]` で囲むと、分配法則が適用されず、ユニオン型全体が一つの型として扱われます。

```typescript
type ToFunction<T> = [T] extends [unknown] ? (x: T) => void : never;
type UserFunction = ToFunction<Age | Name>;
//   ^^^^^^^^^^^^
//   (x: Age | Name) => void
```

### `Parameter` の役割

#### 共変性の利用

`ToFunction<Age | Name>` によって、`(x: Age | Name) => void` という関数の型を得ました。

次に、`Parameter` を使ってこの関数の第一引数の型を取得します。

```typescript
type Parameter<T> = [T] extends [(x: infer I) => void] ? I : never;
type User = Parameter<ToFunction<Age | Name>>;
```

`(x: Age | Name) => void` という関数は、`Age` または `Name` のいずれかを引数に取ることができます。つまり、この関数は `Age` と `Name` の両方を受け取れる必要があります。この関数の引数の性質を反変 (contravariant) と呼びます。

よって、`Parameter` は `Age & Name` という交差型を返します。`(x: Age | Name) => void` の第一引数は `Age` と `Name` の交差型である `Age & Name` となります。

```typescript
type User = Parameter<ToFunction<Age | Name>>;
//   ^^^^
//   Age & Name
```

これにより、各ユニオンの要素が個別に関数型に埋め込まれ、最終的に交差型へと変換される仕組みとなります。

## より短い実装

### `ToFunction` の簡略化

`ToFunction` は、以下のように簡略化できます。

```typescript
type ToFunction<T> = T extends unknown ? (x: T) => void : never;
```

条件型の分配法則は `Parameter` の中で止められるので、`ToFunction` の中で分配を止める必要はありません。

```typescript
type ToFunction<T> = T extends unknown ? (x: T) => void : never;
type Parameter<T> = [T] extends [(x: infer I) => void] ? I : never;
type UnionToIntersection<T> = Parameter<ToFunction<T>>;
```

## さらにより短い実装

`UnionToIntersection` をより短く実装する方法もあります。

```typescript
type UnionToIntersection<T> = (
  T extends unknown ? (x: T) => void : never
) extends (x: infer I) => void
  ? I
  : never;
```

このコードでは、以下の 2 つの性質を利用しています。

1. **条件型の分配**  
   TypeScript の条件型は、「naked な(`[]` などで囲っていない)型パラメーター」を直接チェック対象としている場合、自動的にそれぞれのユニオン型の要素に対して展開（分配）されます。

   ```typescript
   T extends unknown ? (x: T) => void : never
   ```

   この結果、T が "A | B" だとすると、内部で (x: A) => void | (x: B) => void のような形になります。

2. **関数パラメーターの共変性/反変性**  
   関数の引数は反変性を持ちます。つまり、ある関数型の引数型のユニオンが、1 つの関数型の引数型の交差型として推論される、という性質を利用しています。  
   型全体で見ると、
   ```typescript
   (x: A) => void | (x: B) => void
   ```
   のような合併が、
   ```typescript
   (x: A & B) => void
   ```
   と推論される形に変換され、各メンバーの型の「積」を取り出す（交差型にする）ことが可能になります。

ユニオン型の展開を止めるために通常は [T] のようにラップする必要がありますが、ここでは外側の `extends` の左辺が naked ではないため、分配されません。

```typescript
type UnionToIntersection<T> = (
  T extends unknown ? (x: T) => void : never
) extends (x: infer I) => void
  ? // ^ 左辺が naked ではないので分配されない
    I
  : never;
```
