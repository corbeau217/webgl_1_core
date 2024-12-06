# WebGL 1 - core renderer
## About
this repo is primarily used to seperate out the core of our **WebGL 1** renderer from the main site file structure

the aim is that including this as a sub-repository within a project, provides the core systems needed to manage the canvas

## Dependencies
### `gl-matrix-min` - `2.8.1`
* assumes the existance of **`gl-matrix-min`** version **`2.8.1`** within the environment this is used in
* adding the following code to the `<head>` element of an html page will ensure that it is available in the expected way when using this code within modules attached to that page
```html
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gl-matrix/2.8.1/gl-matrix-min.js"
        integrity="sha512-zhHQR0/H5SEBL3Wn6yYSaTTZej12z0hVZKOv3TwCUXT1z5qeqGcXJLLrbERYRScEDDpYIJhPC1fk31gqR783iQ=="
        crossorigin="anonymous"
        defer></script>
```

## Usage
### preparing the environment
after providing the required `gl-matrix-min` library import within the `<head>` element of an html page, you can then also include something like:
```html
    <script src="some_module_using_this_repo.js" type="module"></script>
```
giving you a coding environment which allows the use of [imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import)

### using the content
during the above mentioned `some_module_using_this_repo.js`, you may then include an import statement such as
```js
import { WebGL_App } from "/path_to_webgl_1_core_subrepo/src/webgl_app.js";
```

## References
### Explanations
* reasonable attempts will be made to explain the code, however it should be noted that the creators are still learning

### Learning and understanding the code base
> earliest iterations of the code within this repository were created following the `MDN docs` canvas / WebGL tutorials.

#### beginners to **WebGL 1** *(like the creators)*, and those wishing to understand for personal use:
*  it is recommended to first try the `MDN docs` tutorials mentioned above
    * they are likely to provide you with better explanations than the creators learning to use the systems used within this repository

#### advanced users of **WebGL 1** and later
* please refer to the `WebGL Fundamentals` walkthroughs and explanations to learn more about how the code works
    * they will provide you with enough information to see the mistakes in this repository, that are currently un-seen to the creators
    * they will also provide you with resources for replicating what is within this repository, but utilising **WebGL 2**

#### those with experience in **WebGPU** / **WASM** / **Three.js**
* we have nothing to offer you, you already have a better alternative

---

## Disclaimer
the functionality and usage is very hacky right now, to rush the *seperation of concerns*

***use with caution***