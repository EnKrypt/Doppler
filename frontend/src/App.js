import fdtn from 'date-fns/formatDistanceToNow';
import subSeconds from 'date-fns/subSeconds';
import React from 'react';
import Graph from './Graph';

const historyLimit = 100;

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
                }
            },
            uptime: 0,
            iterID: '',
            memTotal: 0,
            swapTotal: 0,
            diskSize: [],
            history: []
        };
    }

    async componentDidMount() {
        let init = {};
        try {
            init = await (await fetch('http://10.0.0.11:3456/', {
                headers: {
                    init: true
                }
            })).json();
        } catch (err) {
            // this.setState({
            //     error: true
            // });
            console.log('Could not talk to API: ', err);
        }
        if (init.iterID) {
            this.setState(
                {
                    loaded: true,
                    uptime: init.uptime,
                    meta: init.meta,
                    iterID: init.iterID,
                    memTotal: init.mem.total,
                    swapTotal: init.mem.swaptotal,
                    diskSize: init.disk.map(disk => disk.size),
                    history:
                        init.history.length > historyLimit
                            ? init.history.slice(-historyLimit)
                            : init.history
                },
                () => {
                    setInterval(this.poll, 2500);
                }
            );
        } else if (!this.state.error) {
            // this.setState({
            //     reloadRequired: true
            // });
        }
    }

    poll = async () => {
        let data = {};
        try {
            data = await (await fetch('http://10.0.0.11:3456/')).json();
        } catch (err) {
            console.log('Could not talk to API momentarily: ', err);
        }
        if (data.iterID && data.iterID !== this.state.iterID) {
            this.setState({
                iterID: data.iterID
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
                processes: data.processes,
                diskUsed: data.disk.map(disk => disk.used),
                disksIOrbps: data.diskIO.rbps,
                disksIOwbps: data.diskIO.wbps,
                disksIOtbps: data.diskIO.tbps,
                networkbps: data.network.map(network => network.bps)
            });
            this.setState({
                history: history
            });
        }
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
                            <img src="/Doppler.png" alt="Doppler logo" />
                        </div>
                        <div className="hostname">
                            {this.state.meta.os.hostname}
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
                        <div className="uptime">
                            Uptime:{' '}
                            <span>
                                {fdtn(
                                    subSeconds(new Date(), this.state.uptime)
                                )}
                            </span>
                        </div>
                        <div className="graphs">
                            <div className="card">
                                <div className="graph-row">
                                    <Graph
                                        name="CPU Temperature"
                                        data={this.state.history.map(
                                            history => ({
                                                val: history.cpuTemp
                                            })
                                        )}
                                        lines={[
                                            {
                                                value: 90,
                                                text: 'Warn',
                                                color: '#ffff00'
                                            },
                                            {
                                                value: 105,
                                                text: 'TJ Max',
                                                color: '#ff0000'
                                            }
                                        ]}
                                        unit="°C"
                                    />
                                    <Graph
                                        name="CPU Load"
                                        data={this.state.history.map(
                                            history => ({
                                                val: history.cpuLoad
                                            })
                                        )}
                                        unit="%"
                                    />
                                </div>
                                <div className="graph-row">
                                    <Graph
                                        name="RAM Usage"
                                        data={this.state.history.map(
                                            history => ({
                                                val: history.memActive
                                            })
                                        )}
                                        unit=" MB"
                                        available={this.state.memTotal}
                                    />
                                    <Graph
                                        name="Swap Usage"
                                        data={this.state.history.map(
                                            history => ({
                                                val: history.swapUsed
                                            })
                                        )}
                                        unit=" MB"
                                        available={this.state.swapTotal}
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
