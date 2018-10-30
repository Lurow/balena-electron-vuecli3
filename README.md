# BalenaCloud-Electron-VueCli3 Starter

Hi there, since the other balena(fmr resin) + electron + webframework repositories are a little out of date,
I decided to combine the general approach with the simple devprocess vuecli3 is providing.

## Getting Started

For local testing & deployment, see `/app/README.md`

For deployment with [balena.io](https://balena.io), read the following

### Prerequisites

In order to deploy this app on your balena.io account:

1. create a new account on balena.io
2. load the balena image for the device of your choice and flash it on your device via etcher.io

### Deployment

1. clone this image onto your computer

```
git clone git@github.com:Lurow/resin-electron-vuecli3.git
```

2. add a new repository with the name of your balena application (example)

```
git remote add balena gh_xxx@git.balena-cloud.com:gh_xxx/test.git
```

(you can also find the command on your balena.io dashboard)

3. push the application to the new repository

```
git push balena
```

(you should see a unicorn as soon as the dockerimage is built)

4. look at your dashboard and see the magic happening!

## Dockerconfig

All relevent configs for balena.io deployment are inside `Dockerfile.template`.

This is your imagebuilder, which will start building your container on `git push balena` on their webrunners.

## Environment Variables

You are able to change all necessary configurations from your balena.io dashboard.

Click on the tab Service Variables and add following variables:

```
  FOO: bar
```

correspondingly, check for the env. in `background.js`.
Something like:

```
const smt = process.env.FOO
```

(for balena configurations check docs at https://github.com/balena-io/resin-electronjs)

## Config

In order to ensure high configurability, your config files (i18n etc.) can be set as jsons:

1. Log into your balena.io dashboard and connect to your image (main) in the ssh client
2. find the `/data` folder (at the root of image)

```
cd ../../../data
```

3. create a config.json

```
touch config.json
```

4. configurate config.json with nano

```
nano config.json
```

json structure should be:

```
{
  "foo":"bar"
}
```

5. restart your application

## Built With

- [balena.io](http://www.balena.io) - IoT software deployment service
- [vue.js](https://vuejs.org) - Webframework for I/O + Display
- [electron](https://electronjs.org) - Converts Webapplications into Desktop applications

## Authors

- **Louis Rose** [bear in a suit Interactive](https://bearinasuit.de)
