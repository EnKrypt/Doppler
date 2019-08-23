[![Doppler Logo](https://github.com/EnKrypt/Doppler/raw/master/assets/Doppler.png)](https://github.com/EnKrypt/Doppler)

[![License](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://raw.githubusercontent.com/EnKrypt/Doppler/master/LICENSE)

A 'good enough' remote monitoring solution for the lazy.

##### Note: There might be issues running this on Windows. This is due to [known compatibility issues in the `systeminformation` module](https://github.com/sebhildebrandt/systeminformation#function-reference-and-os-support).

---

## Why?

This is Helge Doppler.

![Helge Doppler](https://github.com/EnKrypt/Doppler/raw/master/assets/helge.png)

He got his face beat to a pulp by someone else's high school bully because he didn't quite understand how to monitor his own resources over time.

That won't happen to you or me however, because lucky for us, we know this tool exists!

## Wait, what?

He almost died, dude. It hurts me to even watch. Here, I made a gif and everything :

![Poor Helge](https://github.com/EnKrypt/Doppler/raw/master/assets/smash.gif)

Alright, fine, I'm just kidding.

##### On a side note, [Dark](https://www.imdb.com/title/tt5753856/) is a really good show. You should definitely watch it if you haven't.

I'd set up a home server not long ago and I wanted to remotely monitor the CPU temperatures because I wasn't very confident in my heatsink install. However, every solution I found online was either really heavy to begin with, or involved an hour long configuration process.

I figured it would take me less time to just build a lightweight solution than to try and use one of those.

## Install

##### Right now, the install process involves manual work. If there are community requests and when I have the time, I will work on release management where you can deploy with a single command. Until then, you have my apologies and sympathy.

There are two separate folders. One for the api `backend`, and another for the React `frontend`.

Go to the backend folder.

Install dependencies by running `yarn` or `npm install`.

Either use `ts-node` to run directly :

```bash
$ ts-node src/app.ts
```

Or compile and run :

```bash
$ tsc && node dist/app.js
```

This will start the backend service. (Default port is `3456`)

Go to the frontend folder.

Install dependencies by running `yarn` or `npm install`.

Generate a React build by running `yarn build` or `npm run build`.

Statically serve the generated build. If you've done everything right so far, it should look something like the screenshot below when you open the page.

If you don't plan to run the frontend alongside the backend, make sure you update the endpoint variable `API_URL` in [`App.js`](https://github.com/EnKrypt/Doppler/blob/master/frontend/src/App.js)

If you intend to use https, port `8123` is set to default. Either keep that open, or change the port.

I recommend using [Github Pages](https://pages.github.com/) or [Netlify](https://www.netlify.com/) if you don't want to manage hosting yourself.

[Caddy](https://caddyserver.com/) is neat if you **do** want to host it yourself.

## Usage

This is what it looks like when deployed correctly:

![Screenshot](https://github.com/EnKrypt/Doppler/raw/master/assets/screen.png)
