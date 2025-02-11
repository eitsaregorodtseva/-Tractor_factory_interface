import React from "react";
import "bootstrap/dist/css/bootstrap.css";
import Dropdown from "react-bootstrap/Dropdown";
import Spinner from "react-bootstrap/Spinner";
import "./Users.css";
import Menu from "./Menu.js";
import Navbar from "./Navbar.js";
import axios from "axios";
import { Component } from "react";

const getUsersURL =
  "https://tractor-factory-interface.herokuapp.com/api/users/all/";
const postChangeGroupUser =
  "https://tractor-factory-interface.herokuapp.com/api/user/group/";

class Users extends Component {
  constructor() {
    super();
    this.getUsers = this.getUsers.bind(this);
    this.state = {
      users: [],
      displaySpinner: false,
      index_list_users: 0,
    };
  }

  componentDidMount() {
    fetch(getUsersURL, {
      headers: {
        Authorization: `Token ${localStorage.token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((users) => {
        this.setState({
          users: users.results,
        });
      });

    this.intervalGetUsers = setInterval(this.getUsers, 2500);
  }

  async getUsers() {
    const res = await fetch(getUsersURL, {
      headers: {
        Authorization: `Token ${localStorage.token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    this.setState({
      users: data.results,
    });
  }

  componentWillUnmount() {
    clearInterval(this.intervalGetUsers);
  }

  handleChangeGroupUser = (event, token_user, group_user, index_list_users) => {
    event.preventDefault();

    this.setState({
      displaySpinner: true,
      index_list_users: index_list_users,
    });

    const user = {
      token: token_user,
      group: group_user,
    };

    axios.defaults.xsrfCookieName = "csrftoken";
    axios.defaults.xsrfHeaderName = "X-CSRFToken";
    axios.defaults.withCredentials = true;

    let token = localStorage.getItem("token");
    axios
      .post(
        postChangeGroupUser,
        { user },
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        this.state.displaySpinner = false;
        console.log(res);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  changeNameGroupFromEnglish(nameGroup) {
    switch (nameGroup) {
      case "Admin":
        return "Администратор";
      case "Guest":
        return "Гость";
      default:
        return "Мастер";
    }
  }

  render() {
    const users_list =
      typeof this.state.users == "undefined" ? null : this.state.users;
    const display_spiner = this.state.displaySpinner;
    return (
      <div>
        <body>
          <Navbar />
          <div>
            <div>
              <Menu />
            </div>
            <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
              <div class="chartjs-size-monitor">
                <div class="chartjs-size-monitor-expand">
                  <div class=""></div>
                </div>
                <div class="chartjs-size-monitor-shrink">
                  <div class=""></div>
                </div>
              </div>
              <h1>Пользователи</h1>
              <table
                className="Table-Users"
                style={{ borderColor: "black" }}
                class="table table-striped table-sm table-bordered"
              >
                <thead>
                  <tr>
                    <th class="text-center">Имя пользователя</th>
                    <th class="text-center">Почта</th>
                    <th class="text-center">Группа пользователя</th>
                  </tr>
                </thead>
                <tbody className="Table-body">
                  {users_list == null ? (
                    <p>Page is Loading ...</p>
                  ) : (
                    users_list.map((obj, i) => (
                      <tr>
                        <td>{obj.username}</td>
                        <td>{obj.email}</td>
                        <td>
                          <Dropdown>
                            <Dropdown.Toggle variant="secondary">
                              {display_spiner &&
                                this.state.index_list_users == i && (
                                  <>
                                    <Spinner
                                      as="span"
                                      animation="grow"
                                      size="sm"
                                      role="status"
                                      aria-hidden="true"
                                    />
                                  </>
                                )}
                              {this.changeNameGroupFromEnglish(obj.groups[0])}
                            </Dropdown.Toggle>
                            <Dropdown.Menu variant="dark">
                              <Dropdown.Item
                                onClick={(e) => {
                                  this.handleChangeGroupUser(
                                    e,
                                    obj.token,
                                    "Admin",
                                    i
                                  );
                                }}
                              >
                                Администратор
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={(e) => {
                                  this.handleChangeGroupUser(
                                    e,
                                    obj.token,
                                    "Master",
                                    i
                                  );
                                }}
                              >
                                Мастер
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={(e) => {
                                  this.handleChangeGroupUser(
                                    e,
                                    obj.token,
                                    "Guest",
                                    i
                                  );
                                }}
                              >
                                Гость
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </main>
          </div>
        </body>
        <footer></footer>
      </div>
    );
  }
}
export default Users;
