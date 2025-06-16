import React, { Component } from "react";
import apiClient from "../helper/apiclient";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

class Cars extends Component {
  state = {
    cars: [],
    error: null,
    loading: false,
    deletingId: null,
  };

  handleDelete = async (id) => {
    try {
      this.setState({ deletingId: id, error: null });

      if (!window.confirm("Are you sure you want to delete this car?")) {
        this.setState({ deletingId: null });
        return;
      }

      await apiClient.delete(`/cars/${id}`);
      await this.fetchCars();
    } catch (error) {
      console.error("Delete error:", error);
      this.setState({
        error:
          error.response?.data?.message ||
          "Failed to delete car. Please try again.",
      });
    } finally {
      this.setState({ deletingId: null });
    }
  };

  fetchCars = async () => {
    try {
      this.setState({ loading: true });
      const { data: cars } = await apiClient.get("/cars");
      this.setState({ cars });
    } catch (error) {
      console.error("Failed to fetch cars:", error);
      this.setState({
        error: "Failed to load cars. Please refresh the page.",
      });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { cars, error, loading, deletingId, role } = this.state;

    return (
      <div className="container py-4">
        {/* Header with Add Car button */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="m-0 text-primary">Cars</h1>
          {role == "Admin" && (
            <Link to="/cars/add" className="btn btn-primary px-4 py-2">
              <i className="bi bi-plus-circle me-2"></i>
              Add New Car
            </Link>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show">
            {error}
            <button
              type="button"
              className="btn-close"
              onClick={() => this.setState({ error: null })}></button>
          </div>
        )}

        {/* Loading spinner */}
        {loading && !cars.length && (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading car fleet...</p>
          </div>
        )}

        {/* Cars table */}
        {cars.length > 0 ?
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover m-0">
                  <thead className="table-light">
                    <tr>
                      <th className="py-3">Model</th>
                      <th className="py-3">Seats</th>
                      <th className="py-3">Color</th>
                      <th className="py-3">Mileage</th>
                      <th className="py-3">Price/Hour</th>
                      <th className="py-3">Price/Day</th>
                      <th className="py-3 text-end"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cars.map((car) => (
                      <tr key={car.id}>
                        <td className="align-middle">
                          <strong>{car.model}</strong>
                        </td>
                        <td className="align-middle">{car.seats}</td>
                        <td className="align-middle">
                          <span
                            className="badge rounded-pill"
                            style={{
                              backgroundColor: car.color.toLowerCase(),
                              color: getContrastColor(car.color),
                            }}>
                            {car.color}
                          </span>
                        </td>
                        <td className="align-middle">{car.mbw} km</td>
                        <td className="align-middle">€{car.pph.toFixed(2)}</td>
                        <td className="align-middle">€{car.ppd.toFixed(2)}</td>
                        <td className="align-middle text-end">
                          {role == "Admin" && (
                            <React.Fragment>
                              <Link
                                to={`/cars/update/${car.id}`}
                                className="btn btn-sm btn-outline-primary me-2">
                                <i className="bi bi-pencil-square me-1"></i>
                                Edit
                              </Link>
                              <button
                                onClick={() => this.handleDelete(car.id)}
                                className="btn btn-sm btn-outline-danger"
                                disabled={deletingId === car.id}>
                                {deletingId === car.id ?
                                  <>
                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                    Deleting...
                                  </>
                                : <>
                                    <i className="bi bi-trash me-1"></i>
                                    Delete
                                  </>
                                }
                              </button>
                            </React.Fragment>
                          )}
                          {role == "Customer" && (
                            <React.Fragment>
                              <Link
                                to={`/cars/rent/${car.id}`}
                                className="btn btn-sm btn-outline-success me-2">
                                <i className="bi bi-pencil-square me-1"></i>
                                Rent
                              </Link>
                            </React.Fragment>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        : !loading && (
            <div className="text-center py-5">
              <div className="card shadow-sm">
                <div className="card-body py-5">
                  <i
                    className="bi bi-car-front text-muted"
                    style={{ fontSize: "3rem" }}></i>
                  <h4 className="mt-3">No cars available</h4>
                  <p className="text-muted">
                    Add your first car to get started
                  </p>
                  {role == "Admin" && (
                    <Link to="/cars/addCar" className="btn btn-primary mt-2">
                      Add Car
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )
        }
      </div>
    );
  }

  async componentDidMount() {
    this.fetchCars();
    try {
      console.log("cdm");
      const jwt = localStorage.getItem("token");
      const user = jwtDecode(jwt);
      const userId =
        user[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ];
      const role =
        user["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      this.setState({ role });
      console.log(role);
    } catch (ex) {
      console.log("ex");
    }
  }
}

// Helper function to determine text color based on background color
function getContrastColor(hexColor) {
  // Simple contrast check - for production use a proper color contrast algorithm
  if (!hexColor) return "#000";
  const color = hexColor.toLowerCase();
  return color === "white" || color === "#ffffff" || color === "yellow" ?
      "#000"
    : "#fff";
}

export default Cars;
