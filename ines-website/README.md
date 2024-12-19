# INES playground

This app was built using Vite (and NodeJS + NPM).

### Language: `Typescript`
### Framework: `React`
### Graph Library: `nivo` (based on d3)

## Setup

Clone the project from the github repository.

Enter the folder.

Run the following commands:
```
npm install
npm run dev
```
Open `localhost:5137` and enjoy the hmr.

## Building docker image

Go to `ines-website` folder.

Run the following commands to bulid a new image

`npm run build`

`docker build -t ines-website-app .`

And then to run the image:

`docker run -d -p 80:80 ines-website-app:latest`

## Deploy on server

The server is based on a deprecated version of centos (centos7) and it has firewalls which prevent downloading docker normally. 
We are therefore forced to install docker and its dependencies one-by-one, and this means going through "dependency hell" whenever we run into a bad/missing dependency.

Here are the main ones (use latest of centos-7 compatible files unless stated otherwise):
* docker-ce-20.XXX
  * docker-ce-cli
    * docker-buildx-plugin
    * docker-compose-plugin
  * containerd.io
    * libseccomp
    * container-selinux
  * docker-ce-rootless-extras-20.XXX
    * fuse-overlayfs
      * libfuse3.so.3 (=**fuse3-libs**)
    * slirp4netns
Note: `docker-ce-rootless-extras` & `docker-ce` are each other's dependencies and should be installed simultaniously.


They can be installed from: 
`https://download.docker.com/linux/centos/7/x86_64/stable/Packages/`
`https://vault.centos.org/centos/7/extras/x86_64/Packages/`
`https://vault.centos.org/7.9.2009/os/x86_64/Packages/`

`rpm` + `grep` can help discover missing dependencies.

`sudo yum install` can install the local files after they are moved to the server using `scp`

I pray thou shall never have to go through this process

Then:

`systemctl docker enable`

`systemctl docker start`

`docker ps` should hopefully work now

## Scripts

*Our main inputs:*

## INES working file (index file for all survey questions)
Lists all questions from all surveys by category (tab), where "דמוגרפיה" is demography and the rest are "real" questions

For each question (row) and survey (column) the cell indicates what was the id of the question in that survey.

### What we don't yet have
- We don't yet have a mapping of each question and its type + scale.

- The file does not give an indication regarding the weights.

- It does not give an indication of 'special values', which are usually the same withing a survey but are not the same for all surveys.

### How we make up for absent data (TODO)

- The type + scale of the questions from the last 3 surveys are **hardcoded** to the survey meta json - `assets/surveys_meta/[survey_id].json`. The rest of the questions are **heuristically assumed to be categorial.**

- Weigths exist only in the last few surveys, and they start with either `w_` or `weight_` (for example `w_panel1` or `w_jews_panel1`). They're **hardcoded** using this heuristic **to each survey meta json.**

- Special values are treated like any other value