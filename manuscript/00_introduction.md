# Introduction

Back in the day it was enough to understand how Makefiles work. That said even today Make is a viable tool. During the past few years we have seen many new tools come and go especially in the realm of frontend development. First Grunt became popular. Shortly after that Gulp gained momentum. These tools help a lot but they still don't solve some fundamental issues. That is where solutions such as [Browserify](http://browserify.org/) and [Webpack](https://webpack.github.io/) come in.

They don't aim to replace more general utilities such as [Grunt](http://gruntjs.com/) or [Gulp](http://gulpjs.com/). Rather they complement them. In this book we will focus primarily on Webpack, a module bundler. It is simply a tool that takes some input, bundles it and provides you something to serve to your clients. Even though this sounds simple, Webpack solves a fundamental problem for web developers.

Previously you had to use numerous separate tools for compiling your assets. Webpack does this transparently for you. It is not just about Javascript. You can use it to bundle pretty much anything thanks to its loader based architecture. You can consume easily JSON, images and even fonts. Not only that, we can process these assets through transpilers, Base64 conversion etc. without much trouble.

## How Is This Book Organized?

We will start from zero and develop a little Kanban application for tracking projects. During the process you will learn a lot about Webpack and a bit of [React](https://facebook.github.io/react/). Facebook's React has changed the way we think about frontend development. As it happens Webpack is a very good fit with React. We will also discuss Webpack on the backend and access some nifty language features that might not be otherwise available for us.

The book content and source is available at [GitHub](https://github.com/survivejs/webpack_react). Even though it is recommended you will work through the material and experiment as you go, you can also just pick a starting point from there and then work on it instead. This is useful especially if you master basics already. Or in case you want to skip the React part.

## Who Is This Book For?

It is expected that you have basic knowledge of JavaScript and Node.js. You should be able to use NPM. If you know something about Webpack or React, that's great. That said, you should be able to deepen your understanding of the tool by reading this book and going through the project.

Once you understand the power of Tobias Koppers' tool, it will help you to reach the next level of productivity as a web developer. You will be able to implement optimize your web application in ways that were hard previosly. And what's better, you will be able to develop more effectively. Thank you Tobias, and other contributors of Webpack, for easing our lifes as developers!
