import React, { Component } from "react";

class Breadcrumb extends Component {
  render() {
    const { items } = this.props;

    return (
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb bg-primary text-white-all">
              {items.map((item, index) => (
                <li
                    key={index}
                    className={`breadcrumb-item ${item.active ? 'active' : ''}`}
                    aria-current={item.active ? "page" : undefined}
                  >
                    <a href={item.link}>
                      <i className={item.icon} /> {item.label}
                    </a>
                </li>
              ))}
            </ol>
          </nav>
    );
  }
}


export default Breadcrumb;

{/* 
    // Manuel d'utilisation lorsque breadcrumb est appelle dans d'autres pages
    
    <Breadcrumb
        items={[
            { label: "Home", link: "#", icon: "fas fa-tachometer-alt", active: false },
            { label: "Library", link: "#", icon: "far fa-file", active: false },
            { label: "Data", icon: "fas fa-list", active: true }
        ]}
    />
 */}

