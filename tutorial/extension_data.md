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

## 03.04. Publishing your extension to npm

We reccomend to read these articles to learn how to publish your extension to npm:

-   [Creating a package.json file](https://docs.npmjs.com/creating-a-package-json-file)
-   [Creating Node.js modules](https://docs.npmjs.com/creating-node-js-modules)
-   [Creating and publishing unscoped public packages](https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages)
-   **For TypeScript** after you've read the rest of the articles: [TypeScript - Publishing](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html)
