import React, { Component } from 'react';
import './register.css';
import { Link } from 'react-router-dom';
import { register } from '../services';

const emailRegex = /^[\w\d.!#$%&’*+/=?^_`{|}~-]+@[\d\w-]+(?:\.[\d\w-]+)*$/;

const formValid = ({ formErrors, ...rest }) => {
    let valid = true;

    // validate form errors being empty
    Object.values(formErrors).forEach(val => {
        val.length > 0 && (valid = false);
    });

    // validate the form was filled out
    Object.values(rest).forEach(val => {
        val === null && (valid = false);
    });

    return valid;
};

class Register extends Component {

    constructor(){
        super()
        this.state = {
            name: null,
            cpf: null,
            phone: null,
            email: null,
            password: null,
            confirmPassword: null,
            formErrors: {
                name: '',
                cpf: '',
                phone: '',
                email: '',
                password: '',
                confirmPassword: ''
            }
        };
    }

    onChange = (event) => {
        event.preventDefault();
        const { name, value } = event.target;

        let formErrors = this.state.formErrors;

        switch (name) {
            case "name":
                formErrors.name = value.length < 3 ? "minimum 3 characters required fro user name" : "";
                break;
            case "cpf":
                formErrors.cpf = value.length < 3 ? "O CPF precisa ter 11 números" : "";
                break;
            case "phone":
                formErrors.phone = value.length > 15 ? "O telefone precisa ter entre 9 e 15 caracteres." : "";
                break;
            case "email":
                formErrors.email = emailRegex.test(value) ? "" : "invalid email address, please check it";
                break;
            case "password":
                formErrors.password = value.length < 6 ? "minimum 6 characaters required fro password" : "";
                break;
            case "confirmPassword":
                formErrors.confirmPassword = value !== this.state.password ? "Password didn't match, please check!" : "";
                break;
            default:
                break;
        };

        this.setState({
            [name]: value, formErrors
        });
    };

    onSubmit = (event) => {
        event.preventDefault();
        if (formValid(this.state)) {
            const { name, cpf, phone, email, password, confirmPassword } = this.state;
            const registerObj = {
                name: name,
                cpf: cpf,
                phone: phone,
                email: email,
                password: password,
                confirmPassword: confirmPassword

            };
            register(registerObj).then(result => {
                var data = JSON.parse(localStorage.getItem('user-data'));
                if (data != null) {
                    localStorage.removeItem('user-data');
                }
                localStorage.setItem('user-data', JSON.stringify(result.data));
                if (result.status === 200) {
                    this.props.history.push("/dashboard");
                }
            }).catch(err => {
                console.error(err);
                const { data } = err.response;
                for (let key of Object.keys(data)) {
                    switch (key) {
                        case "email":
                            let formErrors = { ...this.state.formErrors };
                            formErrors.email = data.email;
                            this.setState({ formErrors });
                            break;
                        case "name":
                            let formErrors2 = { ...this.state.formErrors };
                            formErrors2.name = data.name;
                            this.setState({ formErrors: formErrors2 });
                            break;
                        default:
                            break;
                    }
                };
            });
        };
    };

    render() {
        const { formErrors } = this.state;
        return (
            <div className="wrapper">
                <div className="form-wrapper">
                    <h1>Create Account</h1>
                    <form noValidate onSubmit={this.onSubmit}>
                        <div className="firstName">
                            <label htmlFor="firstName">Name</label>
                            <input
                                className={formErrors.name.length > 0 ? "error" : null}
                                placeholder="Name"
                                type="text"
                                name="name"
                                noValidate
                                onChange={this.onChange}
                            />
                        </div>
                        {formErrors.name.length > 0 && (<span className="errorMessage">{formErrors.name}</span>)}

                        <div className="firstName">
                            <label htmlFor="firstName">CPF</label>
                            <input
                                className={formErrors.cpf.length > 0 ? "error" : null}
                                placeholder="CPF"
                                type="text"
                                name="cpf"
                                noValidate
                                onChange={this.onChange}
                            />
                        </div>
                        {formErrors.cpf.length > 0 && (<span className="errorMessage">{formErrors.cpf}</span>)}

                        <div className="firstName">
                            <label htmlFor="firstName">Telefone</label>
                            <input
                                className={formErrors.phone.length > 0 ? "error" : null}
                                placeholder="Telefone"
                                type="text"
                                name="phone"
                                noValidate
                                onChange={this.onChange}
                            />
                        </div>
                        {formErrors.phone.length > 0 && (<span className="errorMessage">{formErrors.phone}</span>)}

                        <div className="email">
                            <label htmlFor="email">Email</label>
                            <input
                                className={formErrors.email.length > 0 ? "error" : null}
                                placeholder="Email"
                                type="email"
                                name="email"
                                noValidate
                                onChange={this.onChange}
                            />
                        </div>
                        {formErrors.email.length > 0 && (<span className="errorMessage">{formErrors.email}</span>)}
                        <div className="password">
                            <label htmlFor="password">Password</label>
                            <input
                                className={formErrors.password.length > 0 ? "error" : null}
                                placeholder="Password"
                                type="password"
                                name="password"
                                noValidate
                                onChange={this.onChange}
                            />
                        </div>
                        {formErrors.password.length > 0 && (
                            <span className="errorMessage">{formErrors.password}</span>)}
                        <div className="password">
                            <label htmlFor="password">Confirm Password</label>
                            <input
                                className={formErrors.confirmPassword.length > 0 ? "error" : null}
                                placeholder="Confirm Password"
                                type="password"
                                name="confirmPassword"
                                noValidate
                                onChange={this.onChange}
                            />
                        </div>
                        {formErrors.confirmPassword.length > 0 && (<span className="errorMessage">{formErrors.confirmPassword}</span>)}
                        <div className="createAccount">
                            <button type="submit">Create Account</button>
                            <Link to="/login"><small>Already Have an Account?</small></Link>

                        </div>
                    </form>
                </div>
            </div>
        );
    };
};

export {
    Register, emailRegex, formValid
}