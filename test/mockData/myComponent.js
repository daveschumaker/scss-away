let React = require('react');

let MyComponent = React.createClass({
    render() {
        return(
            <div className="someRandomClassName anotherClass" id="someRandomId">
                <h1 className="title-bar">THIS IS A FAKE TEST COMPONENT</h1>
                <div className="random-content">With a bunch of random HTML.</div>
                <div className="SomeClass"></div>
                <div className="SomeOtherClass"></div>
                <div></div>
                {this.props.something}
            </div>
        )
    }
})

module.exports = MyComponent;
