import React from 'react';
import { withRouter } from 'react-router-dom';
// import NavLoginComponent from '../navbars/nav_login';

class LoginForm extends React.Component {
	constructor (props) {
		super(props);
		this.state = {										// ? ! come back and fix later to add other values for sign up
			email: "",
			password: "",
			// errors: { email: "", password: "" }...
			// have func validate submit, 
			// check if each one is empty or an invlaid format
			// conditionally give classes
		};

		this.handleSubmit = this.handleSubmit.bind(this);
		this.demoLogin = this.demoLogin.bind(this);
		this.renderSignin = this.renderSignin.bind(this);
	}

	componentDidMount() {
		$('html').attr('data-page', this.props.formType);
	}

	componentWillUnmount() {								// ? last lifecycle method?
		this.props.clearErrors();
	}

	handleSubmit(e) {
		e.preventDefault();
		const user = Object.assign({}, this.state);	// !!make sure not to include errors
		this.props.processForm(user).then(						// triggering submit new user/login session action
			() => this.props.history.push('/dashboard')
			);
	}

	update(field) {
		return e => {
			return this.setState({
				[field]: e.target.value
			});
		};
	}

	demoLogin(e){
		e.preventDefault();
		let demoUser = { 
			email: 'demo_user@gmail.com',
			password: '12345678'
		};

		this.props.demoLogin(demoUser); 					// triggering submit new user/login session action
	}


	renderErrors() {
		let errors = this.props.errors.join('.');

		if (errors.length == 0) return null;

		window.setTimeout(() => this.props.clearErrors(), 10000);

		return(
			<p className="sign-in-error">
				<a className="close" onClick={() => this.props.clearErrors()}>x</a>
				{errors}		
			</p>
		);
	}


	renderSignin() {
		const { email, password } = this.state;
		// make if errors class value emtyy string if no errors
		return (
			<>
				<div className="form-group">
					<label htmlFor="email"></label>
					<input 
						type="email" 
						value={email} 
						onChange={this.update('email')} 
						id="email"
						placeholder="Email"
						autoComplete="off"
					/>
				</div>

				<div className="form-group">
					<label htmlFor="password"></label>
					<input 
						type="password" 
						value={password} 
						onChange={this.update('password')} 
						id="password" 
						placeholder="Password"
						autoComplete="off"
					/>
				</div>

				<button className="demo-login" onClick={this.demoLogin}>Demo</button>
			</>
		);
	}


	render() {
		// const { email, password, state, first_name, last_name } = this.state;

		let loginExtras =
			<div className="login-extras">
				<p>
					<a href="#">Forgot Password?</a>
					<a href="#">Don't have an account?</a>
					<a href="#">Privacy Policy</a>
				</p>
				<p>
					<a href="#">Have an issue with 2-factor authentication?</a>
				</p>
			</div>

		return (
			<>
				{this.renderErrors()}
				<div>
					<h2 className="sign-up-header">Sign in to Coinspace</h2>
					<form onSubmit={this.handleSubmit}>
						<div className="center">
							{this.renderSignin()}
							<input type="submit" value={this.props.formType} />
						</div>
					</form>
						{loginExtras}
				</div>
			</>
		);
	}
}

export default withRouter(LoginForm);
// export default withRouter(PostForm);
