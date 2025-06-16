import React, { Component } from "react";
import Joi from "joi-browser";
import Input from "./input";
import { type } from "@testing-library/user-event/dist/type";
import Select from "./select";

class Form extends Component {
  state = {
    data: {},
    errors: {},
  };

  handleSubmit = async (e) => {
    e.preventDefault();

    const errors = this.validate();

    this.setState({ errors: errors || {} });
    if (errors) return;

    await this.doSubmit();
  };

  doSubmit = () => {};

  handleChange = ({ currentTarget: input }) => {
    const errors = { ...this.state.errors };
    const errorMessage = this.validateProperty(input);
    if (errorMessage) errors[input.name] = errorMessage;
    else delete errors[input.name];

    const data = { ...this.state.data };
    data[input.name] = input.value;
    this.setState({ data, errors });
  };

  validate = () => {
    const options = { abortEarly: false };
    const { error } = Joi.validate(this.state.data, this.schema, options);
    if (!error) return null;

    const errors = {};
    console.log(errors);
    for (let item of error.details) errors[item.path[0]] = item.message;

    return errors;
  };

  validateProperty = ({ name, value }) => {
    const obj = { [name]: value };
    const schema = { [name]: this.schema[name] };
    const { error } = Joi.validate(obj, schema);
    return error ? error.details[0].message : null;
  };

  renderButton(label) {
    return (
      <button disabled={this.validate()} className="btn btn-primary w-100 py-2">
        {label}
      </button>
    );
  }

  renderSelect(name, label, options, error, ...rest) {
    return (
      <Select
        name={name}
        label={label}
        onChange={this.handleChange}
        value={this.state.data[name] || ""}
        options={options}
        error={error}
        {...rest}
      />
    );
  }

  renderInput(name, label, type = "text") {
    return (
      <Input
        name={name}
        value={this.state.data[name]}
        label={label}
        type={type}
        onChange={this.handleChange}
        error={this.state.errors[name]}
      />
    );
  }
}

export default Form;
