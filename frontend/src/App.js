import React from 'react';

export default class App extends React.Component {
    constructor() {
        super();
        this.state = {
            loaded: false
        };
    }
    async componentDidMount() {
        const init = await (await fetch('http://10.0.0.11:3456/')).json();
        console.log(init);
    }
    render() {
        return <div className="App">Test</div>;
    }
}
