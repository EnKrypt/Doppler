import fdtn from 'date-fns/formatDistanceToNow';
import subSeconds from 'date-fns/subSeconds';
import React from 'react';
import Graph from './Graph';

const historyLimit = 100;
const API_URL = `${window.location.protocol}//${window.location.host}/api`;

export default class App extends React.Component {
    constructor() {
        super();
        this.state = {
            loaded: false,
            reloadRequired: false,
            error: false,
            meta: {
                cpu: {
                    manufacturer: '',
                    brand: '',
                    cores: 0
                },
                motherboard: {
                    manufacturer: '',
                    model: ''
                },
                os: {
                    distro: '',
                    hostname: ''
                },
                interval: 2500
            },
            uptime: 'Loading',
            processes: 0,
            iterID: '',
            memTotal: 0,
            swapTotal: 0,
            diskSize: [],
            history: [],
            cpuTempData: [],
            cpuLoadData: [],
            memActiveData: [],
            swapUsedData: [],
            diskUsedData: [],
            diskIOData: [],
            networkData: []
        };
    }

    async componentDidMount() {
        let init = {};
        try {
            init = await (await fetch(`${API_URL}/?t=${Math.random()}`, {
                headers: {
                    init: true
                }
            })).json();
        } catch (err) {
            this.setState({
                error: true
            });
            console.log('Could not talk to API: ', err);
        }
        if (init.iterID) {
            this.setState(
                {
                    uptime: fdtn(subSeconds(new Date(), init.uptime)),
                    processes: init.processes,
                    meta: init.meta,
                    iterID: init.iterID,
                    memTotal: init.mem.total,
                    swapTotal: init.mem.swaptotal,
                    diskSize: init.disk
                        .filter(disk => disk.size)
                        .map(disk => disk.size),
                    history:
                        init.history.length > historyLimit
                            ? init.history.slice(-historyLimit)
                            : init.history
                },
                () => {
                    this.putDataToState(true);
                    setInterval(this.poll, init.meta.interval);
                }
            );
        } else if (!this.state.error) {
            this.setState({
                reloadRequired: true
            });
        }
    }

    poll = async () => {
        let data = {};
        try {
            data = await (await fetch(`${API_URL}/?t=${Math.random()}`)).json();
        } catch (err) {
            console.log('Could not talk to API while polling: ', err);
        }
        if (data.iterID && data.iterID !== this.state.iterID) {
            this.setState({
                iterID: data.iterID,
                uptime: fdtn(subSeconds(new Date(), data.uptime)),
                processes: data.processes
            });
            const history = this.state.history.slice();
            if (this.state.history.length >= historyLimit) {
                history.shift();
            }
            history.push({
                cpuTemp: data.cpuTemp,
                cpuLoad: data.cpuLoad,
                memActive: data.mem.active,
                swapUsed: data.mem.swapused,
                diskUsed: data.disk.map(disk => disk.used),
                disksIOrbps: data.disksIO.rbps,
                disksIOwbps: data.disksIO.wbps,
                disksIOtbps: data.disksIO.tbps,
                networkbps: data.network.map(network => network.bps)
            });
            this.setState(
                {
                    history: history
                },
                () => {
                    this.putDataToState();
                }
            );
        }
    };

    putDataToState = setLoadFlag => {
        const recorded = this.state.history.map(history => history.diskUsed);
        const diskUsedData = [];
        for (let i = 0; i < this.state.diskSize.length; i++) {
            diskUsedData.push([]);
            for (const record of recorded) {
                const data = {};
                if (record[i]) {
                    data.val = record[i];
                }
                diskUsedData[i].push(data);
            }
        }
        const state = {
            cpuTempData: this.state.history.map(history => ({
                val: history.cpuTemp
            })),
            cpuLoadData: this.state.history.map(history => ({
                val: history.cpuLoad
            })),
            memActiveData: this.state.history.map(history => ({
                val: history.memActive
            })),
            swapUsedData: this.state.history.map(history => ({
                val: history.swapUsed
            })),
            diskUsedData: diskUsedData,
            diskIOData: this.state.history.map(history => ({
                read: history.disksIOrbps,
                write: history.disksIOwbps,
                val: history.disksIOtbps
            })),
            networkData: this.state.history.map(history => ({
                val: history.networkbps
            }))
        };
        if (setLoadFlag) {
            state.loaded = true;
        }
        this.setState(state);
    };

    render() {
        if (this.state.error) {
            return (
                <div className="container">
                    <div className="oops">
                        How did you manage to fuck this up?
                        <br />
                        <br />
                    </div>
                    <div className="bigtext">
                        Somehow Doppler got his face smashed in again.
                        <br />
                        Make sure there is an active internet connection between
                        you and where Doppler is running. Try restarting the
                        Doppler service before refreshing. If you're a dev,
                        check the console.
                    </div>
                </div>
            );
        }
        if (this.state.reloadRequired) {
            return (
                <div className="container">
                    <div className="oops">
                        Sucks to be you
                        <br />
                        <br />
                    </div>
                    <div className="bigtext">
                        Looks like you loaded this page so fast that Doppler had
                        no time to collect data. Wait for a second or two, and
                        then refresh this page.
                    </div>
                </div>
            );
        }
        if (this.state.loaded) {
            return (
                <div className="container">
                    <div className="navbar">
                        <div className="title">
                            <a
                                href="https://github.com/EnKrypt/Doppler/"
                                rel="nofollow noopener noreferrer"
                            >
                                <img src="/Doppler.png" alt="Doppler logo" />
                            </a>
                        </div>
                        <div className="hostname">
                            <a href="/" rel="nofollow noopener noreferrer">
                                {this.state.meta.os.hostname}
                            </a>
                        </div>
                        <div className="platform">
                            Running{' '}
                            <span className="os">
                                {this.state.meta.os.distro}
                            </span>
                            <br />
                            On{' '}
                            <span className="cores">
                                {this.state.meta.cpu.cores}
                            </span>{' '}
                            x{' '}
                            <span className="cpu">
                                {this.state.meta.cpu.manufacturer}{' '}
                                {this.state.meta.cpu.brand}
                            </span>
                        </div>
                    </div>
                    <div className="info">
                        <div className="moving-stats">
                            <div className="uptime">
                                Uptime: <span>{this.state.uptime}</span>
                            </div>
                            <div className="processes">
                                Processes: <span>{this.state.processes}</span>
                            </div>
                        </div>
                        <div className="graphs">
                            <div className="card">
                                <div className="graph-row">
                                    <Graph
                                        name="CPU Temperature"
                                        data={this.state.cpuTempData}
                                        lines={[
                                            {
                                                value: 80,
                                                text: 'Warn',
                                                color: '#ffff00'
                                            },
                                            {
                                                value: 100,
                                                text: 'TJ Max',
                                                color: '#ff0000'
                                            }
                                        ]}
                                        unit="°C"
                                        left={true}
                                    />
                                    <Graph
                                        name="CPU Load"
                                        data={this.state.cpuLoadData}
                                        unit="%"
                                    />
                                </div>
                                <div className="graph-row">
                                    <Graph
                                        name="RAM Usage"
                                        data={this.state.memActiveData}
                                        unit=" MB"
                                        available={this.state.memTotal}
                                        left={true}
                                    />
                                    <Graph
                                        name="Swap Usage"
                                        data={this.state.swapUsedData}
                                        unit=" MB"
                                        available={this.state.swapTotal}
                                    />
                                </div>
                                {this.state.diskSize.map(
                                    (diskSize, index, arr) => {
                                        if (index % 2 === 0) {
                                            return (
                                                <div
                                                    className="graph-row"
                                                    key={`Disk ${index + 1}`}
                                                >
                                                    <Graph
                                                        name={`Disk ${index +
                                                            1} Usage`}
                                                        data={
                                                            this.state
                                                                .diskUsedData[
                                                                index
                                                            ]
                                                        }
                                                        unit=" GB"
                                                        available={diskSize}
                                                    />
                                                    {index + 1 <
                                                    this.state.diskSize
                                                        .length ? (
                                                        <Graph
                                                            name={`Disk ${index +
                                                                2} Usage`}
                                                            data={
                                                                this.state
                                                                    .diskUsedData[
                                                                    index + 1
                                                                ]
                                                            }
                                                            unit=" GB"
                                                            available={
                                                                arr[index + 1]
                                                            }
                                                        />
                                                    ) : (
                                                        ''
                                                    )}
                                                </div>
                                            );
                                        } else {
                                            return '';
                                        }
                                    }
                                )}
                                <div className="graph-row">
                                    <Graph
                                        name="Disk I/O"
                                        data={this.state.diskIOData}
                                        multipleLines={true}
                                        unit=" KB/s"
                                        left={true}
                                    />
                                    <Graph
                                        name="Network I/O"
                                        data={this.state.networkData}
                                        unit=" KB/s"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="container">
                    <div className="oops">Loading</div>
                </div>
            );
        }
    }
}
