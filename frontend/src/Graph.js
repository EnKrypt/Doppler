import React from 'react';
import {
    CartesianGrid,
    Line,
    Area,
    AreaChart,
    LineChart,
    XAxis,
    YAxis,
    Tooltip,
    ReferenceLine
} from 'recharts';

export default class Graph extends React.Component {
    render() {
        const Chart = this.props.available ? AreaChart : LineChart;
        const Shape = this.props.available ? Area : Line;
        return (
            <div
                className={['graph', this.props.left ? 'graph-left' : '']
                    .join(' ')
                    .trim()}
            >
                <div className="graph-name">{this.props.name}</div>
                <div className="graph-data">
                    <div className="graph-current">
                        Current:{' '}
                        <span>
                            {this.props.data[this.props.data.length - 1].val}
                            {this.props.unit}
                        </span>
                    </div>
                    {this.props.available ? (
                        <div className="graph-available">
                            Capacity:{' '}
                            <span>
                                {this.props.available}
                                {this.props.unit}
                            </span>
                        </div>
                    ) : (
                        ''
                    )}
                    <div className="graph-max">
                        Max:{' '}
                        <span>
                            {Math.max.apply(
                                null,
                                this.props.data
                                    .map(data => data.val)
                                    .filter(data => !(data == null))
                            )}
                            {this.props.unit}
                        </span>
                    </div>
                </div>
                <Chart
                    width={450}
                    height={200}
                    data={this.props.data}
                    margin={{ right: 25, left: 25 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis tickFormatter={val => ''} minTickGap={40} />
                    <YAxis
                        unit={this.props.unit}
                        domain={
                            this.props.available
                                ? [0, this.props.available]
                                : [0, 'auto']
                        }
                        ticks={
                            this.props.available
                                ? [
                                      0,
                                      Math.round(this.props.available * 0.25),
                                      Math.round(this.props.available * 0.5),
                                      Math.round(this.props.available * 0.75),
                                      this.props.available
                                  ]
                                : undefined
                        }
                    />
                    <Tooltip
                        content={<TooltipContent unit={this.props.unit} />}
                    />
                    {this.props.lines &&
                        this.props.lines.map(line => (
                            <ReferenceLine
                                y={line.value}
                                label={line.text}
                                stroke={line.color}
                                key={line.text}
                            />
                        ))}
                    {this.props.multipleLines ? (
                        Object.keys(this.props.data[0]).map(key => (
                            <Shape
                                key={key}
                                type="monotone"
                                dataKey={key}
                                dot={false}
                                stroke={multiLineColor(key)}
                                fill={multiLineColor(key)}
                                strokeDasharray={key === 'val' ? '1 0' : '5 5'}
                                activeDot={{ r: 7 }}
                            />
                        ))
                    ) : (
                        <Shape
                            type="monotone"
                            dataKey="val"
                            dot={false}
                            stroke="#8884d8"
                            fill="#8884d8"
                            activeDot={{ r: 7 }}
                        />
                    )}
                </Chart>
            </div>
        );
    }
}

const TooltipContent = ({ unit, active, payload }) => {
    if (active && payload.length) {
        if (payload.length > 1) {
            return (
                <div className="tooltip multi">
                    {payload.map(line => (
                        <div className="tooltip-line" key={line.dataKey}>
                            {line.dataKey === 'val' ? 'total' : line.dataKey}:{' '}
                            <span style={{ color: line.color }}>
                                {line.payload[line.dataKey]}
                                {unit}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return (
            <div className="tooltip" style={{ color: payload[0].color }}>
                {payload[0].payload.val}
                {unit}
            </div>
        );
    }
    return <div />;
};

const multiLineColor = key => {
    switch (key) {
        case 'read':
            return '#4090f0';
        case 'write':
            return '#f04090';
        case 'val':
            return '#8884d8';
        default:
            return '#8884d8';
    }
};
