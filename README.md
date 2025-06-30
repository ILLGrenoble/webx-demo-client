# WebX Demo Client

## Description

The WebX Demo Client illustrates how the [WebX Client](https://github.com/ILLGrenoble/webx-client) library can be integrated into a frontend web application. It also provides a simple means of test the WebX host applications (eg WebX Engine and WebX Router).

For development of the WebX Client and WebX Relay, the Demo projects provide the simplest means of building and testing the libraries.

For testing of the Remote Desktop host applications, the [WebX Demo Deploy](https://github.com/ILLGrenoble/webx-demo-deploy) project runs the WebX Server and Client in a docker compose stack which can be running with a single command line. 

The WebX Demo Client uses the standard websocket tunnel of the WebX Client to communicate with the WebX Demo Server.

Tracers are connected to the WebX Client to intercept events. These are used to provide a debugging console to visualise graphical updates to the screen, monitor instructions and messages passing through the websocket and to monitor data rates. 

## WebX Overview

WebX is a Remote Desktop technology allowing an X11 desktop to be rendered in a user's browser. It's aim is to allow a secure connection between a user's browser and a remote linux machine such that the user's desktop can be displayed and interacted with, ideally producing the effect that the remote machine is behaving as a local PC.

WebX's principal differentiation to other Remote Desktop technologies is that it manages individual windows within the display rather than treating the desktop as a single image. A couple of advantages with a window-based protocol is that window movement events are efficiently passed to clients (rather than graphically updating regions of the desktop) and similarly it avoids <em>tearing</em> render effects during the movement. WebX aims to optimise the flow of data from the window region capture, the transfer of data and client rendering.

> The full source code is openly available and the technology stack can be (relatively) easily demoed but it should be currently considered a work in progress.

The WebX remote desktop stack is composed of a number of different projects:
- [WebX Engine](https://github.com/ILLGrenoble/webx-engine) The WebX Engine is the core of WebX providing a server that connects to an X11 display obtaining window parameters and images. It listens to X11 events and forwards event data to connected clients. Remote clients similarly interact with the desktop and the actions they send to the WebX Engine are forwarded to X11.
- [WebX Router](https://github.com/ILLGrenoble/webx-router) The WebX Router manages multiple WebX sessions on single host, routing traffic between running WebX Engines and the WebX Relay. It authenticates session creation requests and spawns Xorg, window manager and WebX Engine processes.
- [WebX Relay](https://github.com/ILLGrenoble/webx-relay) The WebX Relay provides a Java library that can be integrated into the backend of a web application, providing bridge functionality between WebX host machines and client browsers. TCP sockets (using the ZMQ protocol) connect the relay to host machines and websockets connect the client browsers to the relay. The relay transports data between a specific client and corresponding WebX Router/Engine.
- [WebX Client](https://github.com/ILLGrenoble/webx-client) The WebX Client is a javascript package (available via NPM) that provides rendering capabilities for the remote desktop and transfers user input events to the WebX Engine via the relay.

To showcase the WebX technology, a demo is available. The demo also allows for simplified testing of the WebX remote desktop stack. The projects used for the demo are:
- [WebX Demo Server](https://github.com/ILLGrenoble/webx-demo-server) The WebX Demo Server is a simple Java backend integrating the WebX Relay. It can manage a multiuser environment using the full WebX stack, or simply connect to a single user, <em>standalone</em> WebX Engine.
- [WebX Demo Client](https://github.com/ILLGrenoble/webx-demo-client) The WebX Demo Client provides a simple web frontend packaged with the WebX Client library. The demo includes some useful debug features that help with the development and testing of WebX.
- [WebX Demo Deploy](https://github.com/ILLGrenoble/webx-demo-deploy) The WebX Demo Deploy project allows for a one line deployment of the demo application. The server and client are run in a docker compose stack along with an Nginx reverse proxy. This provides a very simple way of connecting to a running WebX Engine for testing purposes.

The following projects assist in the development of WebX:
- [WebX Dev Environment](https://github.com/ILLGrenoble/webx-dev-env) This provides a number of Docker environments that contain the necessary libraries and applications to build and run a WebX Engine in a container. Xorg and Xfce4 are both launched when the container is started. Mounting the WebX Engine source inside the container allows it to be built there too.
- [WebX Dev Workspace](https://github.com/ILLGrenoble/webx-dev-workspace) The WebX Dev Workspace regroups the WebX Engine and WebX Router as git submodules and provides a devcontainer environment with the necessary build and runtime tools to develop and debug all the projects in a single docker environment. Combined with the WebX Demo Deploy project it provides an ideal way of developing and testing the full WebX remote desktop stack.

## Development

### Building and running the WebX Client

Firstly install all the dependencies: 

```
npm install
```
then run the development server:

```
npm start
```

Assuming you have a running WebX Demo Server, you can open your browser at http://localhost:9000 to test WebX.

### Development with the WebX Demo Server and WebX Dev Workspace

To have a fully functional WebX stack, the easiest way is to run the [WebX Dev Workspace](https://github.com/ILLGrenoble/webx-dev-workspace) either with a standalone WebX Engine or a multiuser WebX Router. 

The workspace runs a devcontainer that installs the necessary dependencies to build and run the Remote Desktop stack. The WebX Engine and WebX Router can be compiled and run by hand inside this environment. Please see the README in this project for more details.

To test the WebX Demo Client you'll need a running [WebX Demo Server](https://github.com/ILLGrenoble/webx-demo-server). The README in this project show you how to launch the WebX Demo Server.

### Development of the WebX Client library together with the WebX Demo Client

With the combined local sources of the WebX Client and WebX Demo Client, we can configure NPM to automatically link to the WebX Client library sources. Modifications to the library can be immediately integrated and tested into the demo.

Clone the WebX Client library project run the following commands:

```
git clone https://github.com/ILLGrenoble/webx-client
cd webx-client
npm link
```

The `npm link`command means you can link the sources directly to another project. 

You can then build the library and watch for changes:

```
npm run build:watch
```

In the WebX Demo Client project, link the webx-client library locally:

```
npm link @illgrenoble/webx-client
```

The WebX Demo Client can be run using the command:

```
npm start
```

The demo client is built and run. Changes that occur to the WebX Client library sources are automatically integrated into the demo application.

## Running the full WebX Demo with Docker

The project [WebX Demo Deploy](https://github.com/ILLGrenoble/webx-demo-deploy) provides the simplest way of running the WebX Demo. You need to have a running WebX host with either WebX Engine already running or the full WebX stack (including the router and session manager): as mentioned above the easiest way of doing this is by running the [WebX Dev Workspace](https://github.com/ILLGrenoble/webx-dev-workspace).

In a terminal, clone the deploy project:

```
git clone https://github.com/ILLGrenoble/webx-demo-deploy
cd webx-demo-deploy
```

You can now run it in multiuser mode:

```
./deploy.sh
```

or in standalone mode:

```
./deploy.sh -sh host.docker.internal
```

the host `host.docker.internal` is used to connect the containerised WebX Demo Server to the host network (assuming you are using the WebX Dev Workspace) in parallel. 

