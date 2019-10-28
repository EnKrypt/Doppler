<p align="center">
    <img width="500" src="https://github.com/EnKrypt/Doppler/raw/master/assets/Doppler.png">
</p>

<p align="center">
    <b>A zero configuration remote monitoring tool designed to be better than nothing</b>
</p>

<br>

[![License](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://raw.githubusercontent.com/EnKrypt/Doppler/master/LICENSE)

##### Note: If running on Windows, you may have trouble monitoring network or disk I/O. This is due to [known compatibility issues in the `systeminformation` module](https://github.com/sebhildebrandt/systeminformation#function-reference-and-os-support).

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

## What does Doppler monitor?

#### Displayed Dynamically via Graphs

-   CPU Temperature (Unit: °C)
    -   If your CPU gives out multiple temperature readings, Doppler will report the highest value among those readings.
    -   Warn value is set to 80°C and TJ Max is set to 100°C (This is a general value and may not reflect your CPU's actual specifications)
    -   Temperatures may be stuck at 0 on Windows + Ryzen. This is a known bug.
-   CPU Load (Unit: %)
-   RAM Usage (Unit: MB)
-   Swap Usage (Unit: MB)
    -   If your system does not have swap configured, this readout will remain at 0.
-   Disk Usage (Unit: MB)
    -   How many of these graphs show up are dynamic and depend on how many disk drives are currently connected.
    -   Hotswappable support. Connecting or disconnecting a drive will reflect on the graphs.
-   Disk I/O (Unit KB/s)
    -   Readouts for read, write and total I/O.
    -   May not be compatible with Windows.
-   Network I/O (Unit KB/s)
    -   May not be compatible with Windows.

#### Displayed Statically

-   Hostname
-   Operating System
-   CPU Core Count
-   CPU Make and Model
-   Uptime
-   Process Count

## Usage

Download the [latest release](https://github.com/EnKrypt/Doppler/releases/latest) and execute it on the command line.

On linux, you might have to run `chmod +x` and optionally put the binary in your favorite bin folder.

For full help :

```bash
doppler --help
```

By default Doppler will run on port `3456` with a polling interval of 2.5 seconds.

These values can be changed using command line arguments. You may specify the port to use with `--port` or `-p`, and you may specify the polling interval with `--interval` or `-i`.

For example :

```bash
doppler -p 1234 -i 5000
```

will run Doppler on port `1234` with a polling interval of 5 seconds.

Finally, point your browser to Doppler with the appropriate URL. If running locally with default or no specified options, open [`http://localhost:3456`](http://localhost:3456)

## Preview

This is what it looks like when deployed correctly:

![Screenshot](https://github.com/EnKrypt/Doppler/raw/master/assets/screen.png)

## Todo

-   Feat: Show GPU Temperatures and Usage if applicable.
-   Feat: Show all temp readouts in graph, including VRM or SoC temps.
-   Feat: Show separate ingress and egress readouts for Network I/O.
-   Feat: Option to log monitored data (enable using command line args).
-   Break: Re-write in a more performance oriented language such as Rust or Golang.
