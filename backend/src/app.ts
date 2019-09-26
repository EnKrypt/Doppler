import cors from '@koa/cors';
import cuid from 'cuid';
import Koa from 'koa';
import Router from 'koa-router';
import serve from 'koa-static';
import path from 'path';
import 'source-map-support/register';
import SI from 'systeminformation';
import yargs from 'yargs';

const argv = yargs.options({
    p: {
        type: 'number',
        alias: 'port',
        describe: 'Port to run Doppler on',
        default: 3456
    },
    i: {
        type: 'number',
        alias: 'interval',
        describe: 'How often to poll (in ms)',
        default: 2500
    }
}).argv;

const app = new Koa();
const router = new Router();

let iterID = '';
let system: SI.Systeminformation.SystemData;
let cpu: SI.Systeminformation.CpuData;
let os: SI.Systeminformation.OsData;

let cpuTemp: SI.Systeminformation.CpuTemperatureData;
let cpuLoad: SI.Systeminformation.CurrentLoadData;
let mem: SI.Systeminformation.MemData;
let disk: SI.Systeminformation.FsSizeData[];
let processes: SI.Systeminformation.ProcessesData;
let fsStats: SI.Systeminformation.FsStatsData;
let network: SI.Systeminformation.NetworkStatsData[];

let tempFlag = false;
let windowsFlag = false;

const history: {
    cpuTemp: SI.Systeminformation.CpuTemperatureData['cores'][0];
    cpuLoad: SI.Systeminformation.CurrentLoadData['currentload'];
    memActive: SI.Systeminformation.MemData['active'];
    swapUsed: SI.Systeminformation.MemData['swapused'];
    diskUsed: SI.Systeminformation.FsSizeData['used'][];
    disksIOrbps: SI.Systeminformation.FsStatsData['rx_sec'];
    disksIOwbps: SI.Systeminformation.FsStatsData['wx_sec'];
    disksIOtbps: SI.Systeminformation.FsStatsData['tx_sec'];
    networkbps: SI.Systeminformation.NetworkStatsData['tx_sec'][];
}[] = [];

router.get('/api', async ctx => {
    if (iterID) {
        const meta = {
            motherboard: {
                manufacturer: system.manufacturer,
                model: system.model
            },
            cpu: {
                manufacturer: cpu.manufacturer,
                brand: cpu.brand,
                cores: cpu.cores
            },
            os: {
                distro: os.distro,
                hostname: os.hostname
            },
            interval: argv.i
        };
        ctx.body = {
            iterID: iterID,
            uptime: SI.time().uptime,
            cpuTemp: Math.max(...cpuTemp.cores),
            cpuLoad: Math.round(cpuLoad.currentload),
            mem: {
                total: Math.round(mem.total / 1024 / 1024),
                active: Math.round(mem.active / 1024 / 1024),
                swaptotal: Math.round(mem.swaptotal / 1024 / 1024),
                swapused: Math.round(mem.swapused / 1024 / 1024)
            },
            processes: processes.all,
            disk: disk.map(disk => ({
                size: Math.round(+disk.size / 1024 / 1024 / 1024),
                used: Math.round(+disk.used / 1024 / 1024 / 1024)
            })),
            disksIO: {
                rbps: Math.round(fsStats.rx_sec / 1024),
                wbps: Math.round(fsStats.wx_sec / 1024),
                tbps: Math.round(fsStats.tx_sec / 1024)
            },
            network: network.map(iface => ({
                iface: iface.iface,
                bps: Math.round(iface.tx_sec / 1024)
            })),
            ...(ctx.request.headers['init'] && { meta: meta }),
            ...(ctx.request.headers['init'] && { history: history })
        };
    } else {
        ctx.body = {
            iterID: ''
        };
    }
});

const poll = async () => {
    cpuLoad = await SI.currentLoad();
    mem = await SI.mem();
    disk = await SI.fsSize();
    processes = await SI.processes();
    network = await SI.networkStats();
    try {
        cpuTemp = await SI.cpuTemperature();
        if (!cpuTemp.cores.length) {
            throw new Error('Cannot monitor CPU temperature');
        }
    } catch (e) {
        cpuTemp = {
            main: 0,
            cores: Array(cpu.cores).fill(0),
            max: 0
        };
        if (!tempFlag) {
            console.warn(
                'Cannot pull temperature data. On Linux, make sure `sensors` is available (package: lm-sensors). For OS X, install osx-temperature-sensor. Some CPUs are not supported on Windows.'
            );
            tempFlag = true;
        }
    }
    try {
        fsStats = await SI.fsStats();
    } catch (e) {
        fsStats = {
            rx_bytes: 0,
            wx_bytes: 0,
            tx_bytes: 0,
            rx_sec: 0,
            wx_sec: 0,
            tx_sec: 0,
            ms: 0
        };
        if (!windowsFlag) {
            console.warn(
                'Your environment is not fully supported. Keep in mind that disk and network I/O will not be monitored.'
            );
            windowsFlag = true;
        }
    }

    if (history.length >= 100) {
        history.shift();
    }
    history.push({
        cpuTemp: Math.max(...cpuTemp.cores),
        cpuLoad: Math.round(cpuLoad.currentload),
        memActive: Math.round(mem.active / 1024 / 1024),
        swapUsed: Math.round(mem.swapused / 1024 / 1024),
        diskUsed: disk.map(disk => Math.round(+disk.used / 1024 / 1024 / 1024)),
        disksIOrbps: Math.round(fsStats.rx_sec / 1024),
        disksIOwbps: Math.round(fsStats.wx_sec / 1024),
        disksIOtbps: Math.round(fsStats.tx_sec / 1024),
        networkbps: network.map(iface => Math.round(iface.tx_sec / 1024))
    });

    iterID = cuid();
};

app.use(cors());
app.use(serve(path.join(__dirname, 'serve')));
app.use(router.routes()).use(router.allowedMethods());

(async () => {
    system = await SI.system();
    cpu = await SI.cpu();
    os = await SI.osInfo();

    setInterval(poll, argv.i);

    app.listen(argv.p);

    console.log(`Doppler running on port ${argv.p}`);
})();
