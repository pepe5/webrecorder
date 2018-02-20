import React from 'react';
import { connect } from 'react-redux';

import { getActiveRemoteBrowser } from 'store/selectors';

import { ModeSelectorUI } from 'components/controls';


const mapStateToProps = ({ app }) => {
  return {
    remoteBrowserSelected: getActiveRemoteBrowser(app)
  };
};

export default connect(
  mapStateToProps
)(ModeSelectorUI);
