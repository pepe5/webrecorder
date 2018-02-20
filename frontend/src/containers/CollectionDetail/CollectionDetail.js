import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { asyncConnect } from 'redux-connect';
import { createSearchAction } from 'redux-search';
import { Map } from 'immutable';

import { truncate } from 'helpers/utils';
import { load as loadColl } from 'store/modules/collection';
import { isLoaded as isRBLoaded, load as loadRB } from 'store/modules/remoteBrowsers';
import { getOrderedBookmarks, getOrderedRecordings, bookmarkSearchResults } from 'store/selectors';

import CollectionDetailUI from 'components/CollectionDetailUI';


class CollectionDetail extends Component {

  static propTypes = {
    auth: PropTypes.object,
    collection: PropTypes.object,
    match: PropTypes.object
  };

    // TODO move to HOC
  static childContextTypes = {
    canAdmin: PropTypes.bool,
    canWrite: PropTypes.bool
  };

  getChildContext() {
    const { auth, match: { params: { user } } } = this.props;
    const username = auth.getIn(['user', 'username']);

    return {
      canAdmin: username === user,
      canWrite: username === user //&& !auth.anon
    };
  }

  render() {
    const { collection, match: { params: { user, coll } } } = this.props;

    return (
      <CollectionDetailUI key="c" {...this.props} />
    );
  }
}


const initialData = [
  {
    promise: ({ match: { params }, store: { dispatch } }) => {
      const { user, coll } = params;

      return dispatch(loadColl(user, coll));
    }
  },
  {
    promise: ({ store: { dispatch, getState } }) => {
      if(!isRBLoaded(getState()))
        return dispatch(loadRB());

      return undefined;
    }
  }
];

const mapStateToProps = (outerState) => {
  const { app } = outerState;
  const isLoaded = app.getIn(['collection', 'loaded']);
  const { bookmarkFeed, searchText } = isLoaded ? bookmarkSearchResults(outerState) : { bookmarkFeed: Map(), searchText: '' };
  const isIndexing = isLoaded && !bookmarkFeed.size && app.getIn(['collection', 'bookmarks']).size && !searchText;

  return {
    auth: app.get('auth'),
    collection: app.get('collection'),
    browsers: app.get('remoteBrowsers'),
    recordings: isLoaded ? getOrderedRecordings(app) : null,
    bookmarks: isIndexing ? getOrderedBookmarks(app) : bookmarkFeed,
    searchText
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    searchBookmarks: createSearchAction('collection.bookmarks'),
    dispatch
  };
};

export default asyncConnect(
  initialData,
  mapStateToProps,
  mapDispatchToProps
)(CollectionDetail);
