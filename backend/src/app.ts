import Koa from 'koa';
import SI from 'systeminformation';

const app = new Koa();

let system: SI.Systeminformation.SystemData;
let cpu: SI.Systeminformation.CpuData;
let os: SI.Systeminformation.OsData;

let cpuTemp: SI.Systeminformation.CpuTemperatureData;
let cpuLoad: SI.Systeminformation.CurrentLoadData;
let mem: SI.Systeminformation.MemData;
let disk: SI.Systeminformation.FsSizeData[];
let processes: SI.Systeminformation.ProcessesData;
let disksIO: SI.Systeminformation.DisksIoData;
let network: SI.Systeminformation.NetworkStatsData[];

app.use(async ctx => {
    ctx.body = {
        meta: {
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
        },
        uptime: SI.time().uptime,
        cpuTemp: Math.max(...cpuTemp.cores),
        cpuLoad: cpuLoad.currentload,
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
        disksIO: disksIO,
        network: network
    };
});

const poll = async () => {
    cpuTemp = await SI.cpuTemperature();
    cpuLoad = await SI.currentLoad();
    mem = await SI.mem();
    disk = await SI.fsSize();
    processes = await SI.processes();
    disksIO = await SI.disksIO();
    network = await SI.networkStats();
};

(async () => {
    system = await SI.system();
    cpu = await SI.cpu();
    os = await SI.osInfo();

    setInterval(poll, 5000);

    app.listen(3000);
})();
