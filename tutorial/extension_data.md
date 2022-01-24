# 03. Extension data

## 03.01 Introduction to extension data

Extensions can have a data property that will be then accessible in a collection on the client. This is useful for creating extensions that are going to be published to npm (third party extensions) or for creating extensions that are going to intermingle with other extensions (for example a database extension).

## 03.02 Creating and using extension data

When creating an extension, you can add a data property to the extension like so:

```ts
import { MonnoExtension } from "monno"

const extension: MonnoExtension = {
    name: "my-extension",
    data: {
        myData: "my-data",
    },
}
```

Then, when the extension is registered, the data property will be available on the client.extensions object in a collection:

```ts
client.extensions.data("my-extension").myData // "my-data"
```

## 03.03. Example extension that uses extension data: mongodb extension

Check out [this file](./mongodb_ext.ts) to see how extension data is used in an example mongodb extension.
