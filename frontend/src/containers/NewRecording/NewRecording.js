import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { asyncConnect } from 'redux-connect';

import { isLoaded, load as loadColl } from 'store/modules/collection';
import { truncate } from 'helpers/utils';

import { NewRecordingUI } from 'components/controls';


class NewRecording extends Component {
  static contextTypes = {
    product: PropTypes.string
  };

  static propTypes = {
    auth: PropTypes.object,
    collection: PropTypes.object,
    extractable: PropTypes.object,
    match: PropTypes.object
  };

  // TODO move to HOC
  static childContextTypes = {
    currMode: PropTypes.string,
    canAdmin: PropTypes.bool,
    product: PropTypes.string
  };

  getChildContext() {
    const { auth, match: { params } } = this.props;

    return {
      currMode: 'new',
      canAdmin: auth.getIn(['user', 'username']) === params.user
    };
  }

  render() {
    const { collection, extractable, match: { params: { user, coll } } } = this.props;

    return (
      <NewRecordingUI
        collection={collection}
        extractable={extractable} />
    );
  }
}

const loadCollection = [
  {
    promise: ({ match: { params }, store: { dispatch, getState } }) => {
      const state = getState();
      const collection = state.app.get('collection');
      const { user, coll } = params;

      if(!isLoaded(state) || (collection.get('id') === coll &&
         Date.now() - collection.get('accessed') > 15 * 60 * 1000)) {
        return dispatch(loadColl(user, coll));
      }

      return undefined;
    }
  }
];

const mapStateToProps = ({ app }) => {
  return {
    auth: app.get('auth'),
    collection: app.get('collection'),
    extractable: app.getIn(['controls', 'extractable']),
    remoteBrowserSelected: app.getIn(['remoteBrowsers', 'activeBrowser'])
  };
};

export default asyncConnect(
  loadCollection,
  mapStateToProps
)(NewRecording);
