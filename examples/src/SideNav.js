import React from 'react'
import ReactDOM from 'react-dom'

class SideNav extends React.Component {

    renderNavItems = () => {
        return this.props.list.map((item, index) => {
            return (
                <li>
                    <a href={`#${item.id}`}>{item.title}</a>
                </li>
            )
        })
    }

    render() {
        return (
            <div className="side-nav">
                <ul>
                  {this.renderNavItems()}
                </ul>
            </div>
        )
    }
}

export default SideNav;
