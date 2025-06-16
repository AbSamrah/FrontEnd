import React, { Component } from "react";
import apiClient from "../helper/apiclient";
import { Link } from "react-router-dom";

class Users extends Component {
  state = {
    users: [],
    error: null,
    loading: false,
  };

  handleDelete = async (id) => {
    try {
      this.setState({ loading: true, error: null });

      if (!window.confirm("Are you sure you want to delete this user?")) {
        return;
      }

      await apiClient.delete(`/Users/${id}`);

      // Refresh the user list by re-fetching
      await this.fetchUsers();
    } catch (error) {
      console.error("Delete error:", error);
      this.setState({
        error:
          error.response?.data?.message ||
          "Failed to delete user. Please try again.",
      });
    } finally {
      this.setState({ loading: false });
    }
  };

  fetchUsers = async () => {
    try {
      const { data: users } = await apiClient.get("/users");
      this.setState({ users });
    } catch (error) {
      console.error("Failed to fetch users:", error);
      this.setState({
        error: "Failed to load users. Please refresh the page.",
      });
    }
  };

  render() {
    const { users, error, loading } = this.state;
    return (
      <div>
        <div className="d-flex justify-content-between align-items-center m-1">
          <h1 className="m-0">Users</h1>
          <Link to="/users/adduser" className="btn btn-primary">
            Add user
          </Link>
        </div>

        <div className="table-responsive small">
          <table className="table table-striped table-sm">
            <thead>
              <tr>
                <th scope="col">Username</th>
                <th scope="col">Email</th>
                <th scope="col">Role</th>
                <th scope="col"></th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {this.state.users.map((user) => (
                <tr key={user.id}>
                  <td>
                    {user.firstName} {user.lastName}
                  </td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <Link to="/user" className="btn btn-secondary">
                      Edit
                    </Link>
                  </td>
                  <td>
                    <button
                      onClick={() => this.handleDelete(user.id)}
                      className="btn btn-sm btn-danger"
                      disabled={loading}>
                      {loading ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  async componentDidMount() {
    this.fetchUsers();
  }
}

export default Users;
