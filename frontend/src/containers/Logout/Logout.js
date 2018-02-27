import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { logout as doLogout } from 'store/modules/auth';


class Logout extends Component {
  static contextTypes = {
    router: PropTypes.object,
  };

  static propTypes = {
    logout: PropTypes.func
  }

  componentWillMount() {
    this.props.logout();
    this.context.router.history.replace('/');
  }

  render() {
    return null;
  }
}

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return {
    logout: () => dispatch(doLogout()),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Logout);
