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
            <div className="graph">
                <div className="graph-name">{this.props.name}</div>
                <div className="graph-data">
                    <div className="graph-current">
                        Current:{' '}
                        <span>
                            {this.props.data[this.props.data.length - 1].val}
                            {this.props.unit}
                        </span>
                    </div>
                    {this.props.available && (
                        <div className="graph-available">
                            Available:{' '}
                            <span>
                                {this.props.available}
                                {this.props.unit}
                            </span>
                        </div>
                    )}
                    <div className="graph-max">
                        Max:{' '}
                        <span>
                            {Math.max.apply(
                                null,
                                this.props.data.map(data => data.val)
                            )}
                            {this.props.unit}
                        </span>
                    </div>
                </div>
                <Chart width={450} height={200} data={this.props.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis tickFormatter={val => ''} minTickGap={40} />
                    <YAxis unit={this.props.unit} />
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
                    <Shape
                        type="monotone"
                        dataKey="val"
                        dot={false}
                        stroke={this.props.alt ? '#ff9400' : '#8884d8'}
                        fill={this.props.alt ? '#ff9400' : '#8884d8'}
                        activeDot={{ r: 7 }}
                    />
                </Chart>
            </div>
        );
    }
}

const TooltipContent = ({ unit, active, payload }) => {
    if (active && payload.length) {
        return (
            <div className="tooltip" style={{ color: payload[0].color }}>
                {payload[0].payload.val}
                {unit}
            </div>
        );
    }
    return <div />;
};
