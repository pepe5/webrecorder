import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { asyncConnect } from 'redux-connect';

import config from 'config';
import { getRemoteBrowser } from 'helpers/utils';

import { isLoaded, load as loadColl } from 'store/modules/collection';
import { getArchives, updateUrl, updateTimestamp } from 'store/modules/controls';
import { loadRecording } from 'store/modules/recordings';
import { load as loadBrowsers, setBrowser } from 'store/modules/remoteBrowsers';

import { RemoteBrowser } from 'containers';
import { IFrame, ReplayUI } from 'components/controls';


class Record extends Component {
  static contextTypes = {
    product: PropTypes.string
  };

  static propTypes = {
    activeBrowser: PropTypes.string,
    auth: PropTypes.object,
    collection: PropTypes.object,
    dispatch: PropTypes.func,
    match: PropTypes.object,
    reqId: PropTypes.string,
    timestamp: PropTypes.string,
    url: PropTypes.string
  };

  // TODO move to HOC
  static childContextTypes = {
    currMode: PropTypes.string,
    canAdmin: PropTypes.bool
  };

  constructor(props) {
    super(props);

    this.mode = 'record';
  }

  getChildContext() {
    const { auth, match: { params: { user } } } = this.props;

    return {
      currMode: 'record',
      canAdmin: auth.getIn(['user', 'username']) === user
    };
  }

  render() {
    const { activeBrowser, dispatch, match: { params }, reqId, timestamp, url } = this.props;
    const { user, coll, rec } = params;

    const appPrefix = `${config.appHost}/${user}/${coll}/${rec}/record/`;
    const contentPrefix = `${config.contentHost}/${user}/${coll}/${rec}/record/`;

    return (
      <React.Fragment>
        <ReplayUI
          params={params}
          timestamp={timestamp}
          url={url} />

        <div className="iframe-container">
          {
            activeBrowser ?
              <RemoteBrowser
                dispatch={dispatch}
                mode={this.mode}
                params={params}
                rb={activeBrowser}
                rec={rec}
                recId={reqId}
                url={url} /> :
              <IFrame
                appPrefix={appPrefix}
                contentPrefix={contentPrefix}
                dispatch={dispatch}
                params={params}
                timestamp={timestamp}
                url={url} />
          }
        </div>
      </React.Fragment>
    );
  }
}

const initialData = [
  {
    promise: ({ store: { dispatch } }) => {
      return dispatch(loadBrowsers());
    }
  },
  {
    // set url and remote browser
    promise: ({ match: { params: { br, splat } }, store: { dispatch } }) => {
      const promises = [
        dispatch(updateUrl(splat)),
        dispatch(setBrowser(br || null))
      ];

      return Promise.all(promises);
    }
  },
  {
    // load recording info
    promise: ({ match: { params: { user, coll, rec } }, store: { dispatch } }) => {
      return dispatch(loadRecording(user, coll, rec));
    }
  },
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
  },
  {
    promise: ({ store: { dispatch, getState } }) => {
      const { app } = getState();

      // TODO: determine if we need to test for stale archives
      if (!app.getIn(['controls', 'archives']).size) {
        return dispatch(getArchives());
      }

      return undefined;
    }
  }
];

const mapStateToProps = ({ app }) => {
  return {
    activeBrowser: app.getIn(['remoteBrowsers', 'activeBrowser']),
    collection: app.get('collection'),
    auth: app.get('auth'),
    reqId: app.getIn(['remoteBrowsers', 'reqId']),
    timestamp: app.getIn(['controls', 'timestamp']),
    url: app.getIn(['controls', 'url'])
  };
};

export default asyncConnect(
  initialData,
  mapStateToProps
)(Record);
