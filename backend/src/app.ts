import Koa from 'koa';
import SI from 'systeminformation';
import cuid from 'cuid';

const pollInterval = 2500;
const port = 3456;

const app = new Koa();

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

app.use(async ctx => {
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
            }
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
                rbps: fsStats.rx_sec,
                wbps: fsStats.wx_sec,
                tbps: fsStats.tx_sec
            },
            network: network.map(iface => ({
                iface: iface.iface,
                bps: iface.tx_sec
            })),
            ...(ctx.request.headers['init'] && { meta: meta })
        };
    } else {
        ctx.body = {
            iterID: ''
        };
    }
});

const poll = async () => {
    iterID = cuid();
    cpuTemp = await SI.cpuTemperature();
    cpuLoad = await SI.currentLoad();
    mem = await SI.mem();
    disk = await SI.fsSize();
    processes = await SI.processes();
    fsStats = await SI.fsStats();
    network = await SI.networkStats();
};

(async () => {
    system = await SI.system();
    cpu = await SI.cpu();
    os = await SI.osInfo();

    setInterval(poll, pollInterval);

    app.listen(port);
})();
