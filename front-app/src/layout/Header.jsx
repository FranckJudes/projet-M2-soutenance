import { Component } from "react";
import LanguageSelector from "../components/LanguageSelector";
import { Link } from 'react-router-dom';
import NotificationCenter from "../components/NotificationCenter/NotificationCenter";

class Header extends Component{
    render(){
        return  <nav className="navbar navbar-expand-lg main-navbar sticky">
                    <div className="form-inline mr-auto">
                        <ul className="navbar-nav mr-3">
                        <li><a href="#" data-toggle="sidebar" className="nav-link nav-link-lg
                                                    collapse-btn"> <i data-feather="align-justify" /></a></li>
                        <li><a href="#" className="nav-link nav-link-lg fullscreen-btn">
                            <i data-feather="maximize" />
                            </a></li>
                        <li>
                            <form className="form-inline mr-auto">
                            <div className="search-element">
                                <input className="form-control" type="search" placeholder="Search" aria-label="Search" data-width={200} />
                                <button className="btn" type="submit">
                                <i className="fas fa-search" />
                                </button>
                            </div>
                            </form>
                        </li>
                        </ul>
                    </div>
                    <ul className="navbar-nav navbar-right">
                       
                        <LanguageSelector/>
                        <li className="dropdown dropdown-list-toggle">
                            <NotificationCenter />
                        </li>

                        <li className="dropdown"><a href="#" data-toggle="dropdown" className="nav-link dropdown-toggle nav-link-lg nav-link-user"> <img alt="image" src="assets/img/user.png" className="user-img-radious-style" /> <span className="d-sm-none d-lg-inline-block" /></a>
                        <div className="dropdown-menu dropdown-menu-right pullDown">
                            <div className="dropdown-title">Hello Sarah Smith</div>
                            <a href="profile.html" className="dropdown-item has-icon"> <i className="far
                                                        fa-user" /> Profile
                            </a>
                            <Link to="/kanban" className="dropdown-item has-icon">
                                <i className="fas fa-tasks" /> Mes tâches
                            </Link>
                            <Link to="/notifications" className="dropdown-item has-icon">
                                <i className="fas fa-bell" /> Notifications
                            </Link>
                           
                            <Link to="/settings" className="dropdown-item has-icon">
                                <i className="fas fa-cog" /> Settings
                            </Link>
                            <div className="dropdown-divider" />
                            <Link className="dropdown-item has-icon text-danger" to="/login">
                                <i className="fas fa-sign-out-alt" />
                                <span>Logout</span>
                            </Link>
                        </div>
                        </li>
                    </ul>
                </nav>
        

    }
}

export default Header;