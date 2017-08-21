import { fromJS } from 'immutable';

const RB_SELECT = 'wr/rb/SELECT';
const RB_LOAD = 'wr/rb/LOAD';
const RB_LOAD_SUCCESS = 'wr/rb/LOAD_SUCCESS';
const RB_LOAD_FAIL = 'wr/rb/LOAD_FAIL';

const initialState = fromJS({
  loaded: false,
  activeBrowser: null,
  accessed: null
});

export default function remoteBrowsers(state = initialState, action = {}) {
  switch (action.type) {
    case RB_LOAD:
      return state.set('loading', true);
    case RB_LOAD_SUCCESS:
      return state.merge({
        loading: false,
        loaded: true,
        browsers: action.result,
        accessed: action.accessed
      });
    case RB_LOAD_FAIL:
      return state.merge({
        loading: false,
        loaded: false,
        error: action.error
      });
    case RB_SELECT:
      return state.set('activeBrowser', action.id);
    default:
      return state;
  }
}

export function isLoaded(globalState) {
  return globalState.get('remoteBrowsers') &&
         globalState.getIn(['remoteBrowsers', 'loaded']) &&
         Date.now() - globalState.getIn(['remoteBrowsers', 'accessed']) < 15 * 60 * 1000;
}

export function load() {
  return {
    types: [RB_LOAD, RB_LOAD_SUCCESS, RB_LOAD_FAIL],
    accessed: Date.now(),
    promise: client => client.get('/api/browsers/browsers')
  };
}

export function selectBrowser(id) {
  return {
    type: RB_SELECT,
    id
  };
}