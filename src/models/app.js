import store from 'store'
import { app_config } from 'config'
import keys from 'config/app_keys'
import { user, session } from 'core/models'
import { router, verbosity, appInterface } from 'core/libs'
import settings from 'core/libs/settings'
import uri_resolver from 'api/lib/uri_resolver'
import { queryIndexer } from 'core'
import Cryptr from 'cryptr'

import jwt from 'jsonwebtoken'
import cookie from 'cookie_js'

export default {
  namespace: 'app',
  state: {
    env_proccess: process.env,
    server_key: keys.server_key,
    resolvers: null,

    service_valid: false,
    ng_services: false,
    session_valid: false,

    session_authframe: null,
    session_token: null,
    session_data: null,
    session_uuid: null,

    sidebar_collapsed: store.get("sidebar_collapse"),
    overlayActive: false,
    overlayElement: null,
    embedded: false,
    dispatcher: null,

    abortRender: null,
    controlActive: false,
    feedOutdated: false,

    electron: null,
    app_settings: store.get(app_config.app_settings_storage),
    app_theme: store.get(app_config.appTheme_container) || [],
    notifications: [],
  },
  subscriptions: {
    setup({ dispatch }) {
      dispatch({ type: 'updateState', payload: { dispatcher: dispatch } })
      try {
        const electron = window.require("electron")
        dispatch({ type: 'updateState', payload: { electron, embedded: true } })
      } catch (error) {
        // nothing
      }
      uri_resolver().then(res => {
        dispatch({ type: 'updateState', payload: { resolvers: res } })
      })
      dispatch({ type: 'updateFrames' })
      dispatch({ type: 'validateSession' })
      dispatch({ type: 'socket/createNodeSocket' })
      dispatch({ type: 'query', payload: { dispatcher: dispatch } })
    },
    setupHistory({ dispatch, history }) {
      history.listen(location => {
        dispatch({
          type: 'updateState',
          payload: {
            locationPathname: location.pathname,
            locationQuery: location.query,
          },
        })
      })
    },
    setupRequestCancel({ history }) {
      history.listen(() => {
        const { cancelRequest = new Map() } = window
        cancelRequest.forEach((value, key) => {
          if (value.pathname !== window.location.pathname) {
            cancelRequest.delete(key);
          }
        })
      })
    },
  },
  effects: {
    *query({ payload }, { call, put, select }) {
      const state = yield select(state => state.app)

      window.PluginGlobals = []
      window.Internal = []

      queryIndexer([
        {
          match: '/s;:id',
          to: `/settings?key=:id`,
        },
        {
          match: '/h;:id',
          to: `/hashtag?key=:id`,
        },
        {
          match: '/p;:id',
          to: `/post?key=:id`,
        },
        {
          match: '/@:id',
          to: `/@/:id`,
        }
      ], (callback) => {
        window.location = callback
      })

      if (!state.service_valid) {

      }
    },
    *refreshToken({ callback }, { call, put, select }) {
      const state = yield select(state => state.app)
      if (state.session_authframe) {
        return state.dispatcher({
          type: "socket/use",
          scope: "auth",
          invoke: "token",
          query: {
            payload: {
              token: state.session_authframe
            },
            callback: (callbackResponse) => {
              if (typeof (callback) !== "undefined") {
                callback(callbackResponse)
              }
              if (callbackResponse.code == 100) {
                verbosity(`updating authframe`)
                state.dispatcher({
                  type: "setAuth", payload: {
                    token: callbackResponse.response.token,
                    authFrame: jwt.decode(callbackResponse.response.token),
                    dataFrame: state.session_data
                  }
                })
                state.dispatcher({ type: "updateState", payload: { session_valid: true } })
              } else {
                verbosity(`this session is no valid, erasing data`)
                state.dispatcher({ type: "sessionErase" }) // remove without calling api, its already logged out/invalid
              }
            }
          }
        })
      }else{
        verbosity(`no session_authframe found/valid`)
        return false
      }
    },
    *logout({ payload }, { put, select }) {
      const state = yield select(state => state.app)

      session.deauth({
        id: state.session_uuid,
        userToken: state.session_token,
        server_key: state.server_key
      }, (err, res) => {
        verbosity([res])
        state.dispatcher({ type: "sessionErase" })
      })

    },
    *login({ payload, callback }, { call, put, select }) {
      const state = yield select(state => state.app)
      if (!payload) return false
      const cryptr = new Cryptr(keys.server_key)

      state.dispatcher({
        type: "socket/use",
        scope: "auth",
        invoke: "authentication",
        query: {
          payload: {
            username: btoa(payload.username),
            password: cryptr.encrypt(payload.password)
          },
          callback: (callbackResponse) => {
            const { authFrame, dataFrame, token } = callbackResponse.response
            if (typeof (callback) !== "undefined") {
              callback(callbackResponse.code)
            }
            if (callbackResponse.code == 100) {
              state.dispatcher({ type: "setAuth", payload: { authFrame, dataFrame, token } })
            }
          }
        }
      })
    },
    *validateSession({ payload }, { put, select }) {
      const state = yield select(state => state.app)
      if (state.session_authframe) {
        if (typeof (state.session_authframe.exp) == "undefined") {
          return false // no support refresh token when is invalid by ws
        }

        const now = new Date()
        const createdIat = state.session_authframe.iat * 1000
        const expirationTime = (state.session_authframe.iat + state.session_authframe.exp) * 1000

        const isExpired = expirationTime < now.getTime()

        verbosity([`TOKEN EXPIRES => (${new Date(expirationTime).toLocaleString()})`, `NOW => (${now.toLocaleString()})`])

        if (isExpired) {
          verbosity(`🕒 This session_token is expired`, { color: "red" })
          if (settings("session_noexpire")) {
            verbosity(`(session_noexpire) is enabled, refreshing token`)
            return state.dispatcher({ type: "refreshToken" })
          } else {
            return state.dispatcher({ type: "sessionErase" }) // remove session
          }
       
        }

        if (!state.session_data) {
          verbosity(`session_data is not valid but the session is valid, updating from ws`)
          state.dispatcher({ type: "updateUserData" })
        }

        state.dispatcher({ type: "updateState", payload: { session_valid: true } })
      }
    },
    *updateUserData({ payload }, { put, select }) {
      const state = yield select(state => state.app)
      state.dispatcher({
        type: "user/get",
        payload: {
          from: "data"
        },
        callback: (callbackResponse) => {
          if (callbackResponse.code == 115) {
            verbosity(`Cannot update userdata due an data is missing`)
            return false
          }
          try {
            sessionStorage.setItem(app_config.session_data_storage, btoa(JSON.stringify(callbackResponse.response)))
            state.dispatcher({ type: "updateState", payload: { session_data: callbackResponse.response } })
          } catch (error) {
            verbosity([error])
          }
        }
      })
    },
    *updateTheme({ payload }, { put, select }) {
      if (!payload) return false
      let container = yield select(state => state.app.app_theme)
      let style_keys = []
      let tmp = []

      container.forEach((e) => { style_keys[e.key] = e.value })

      if (!style_keys[payload.key]) {
        tmp.push({ key: payload.key, value: payload.value })
      }
      container.forEach((e) => {
        let obj = {}
        if (e.key === payload.key) {
          obj = { key: payload.key, value: payload.value }
        } else {
          obj = { key: e.key, value: e.value }
        }
        tmp.push(obj)
      })
      return tmp ? yield put({ type: 'handleUpdateTheme', payload: tmp }) : null
    },
    *updateFrames({ payload }, { select, put }) {
      try {
        let sessionAuthframe = cookie.get(app_config.session_token_storage)
        let sessionDataframe = atob(sessionStorage.getItem(app_config.session_data_storage))

        if (sessionAuthframe) {
          try {
            sessionAuthframe = jwt.decode(sessionAuthframe)
            yield put({
              type: "updateState",
              payload: {
                session_authframe: sessionAuthframe,
                session_token: sessionAuthframe.access_token,
                session_uuid: sessionAuthframe.user_id
              }
            })
          } catch (error) {
            cookie.remove(app_config.session_token_storage)
          }
        }
        if (sessionDataframe) {
          try {
            sessionDataframe = JSON.parse(sessionDataframe)
            yield put({
              type: "updateState",
              payload: {
                session_data: sessionDataframe
              }
            })
          } catch (error) {
            sessionDataframe = null
            sessionStorage.clear()
          }
        }
      } catch (error) {
        verbosity([error])
      }

    }
  },
  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    setAuth(state, { payload }) {
      if (!payload) return false
      state.session_token = payload.authFrame.access_token
      state.session_uuid = payload.authFrame.user_id
      state.session_data = payload.dataFrame
      state.session_authframe = jwt.decode(payload.token)


      cookie.set(app_config.session_token_storage, payload.token)
      sessionStorage.setItem(app_config.session_data_storage, btoa(JSON.stringify(payload.dataFrame)))

      state.session_valid = true
    },
    handleCollapseSidebar(state, { payload }) {
      state.sidebar_collapsed = payload
    },
    handleUpdateTheme(state, { payload }) {
      verbosity([payload])
      store.set(app_config.appTheme_container, payload);
      state.app_theme = payload
    },
    requireQuery(state, { payload, callback }) {
      if (!payload || !callback) return false
      switch (payload) {
        case 'login': {
          callback(state.session_valid)
          break;
        }
        case 'guest': {
          callback(!state.session_valid)
          break;
        }
        case 'dev': {
          if (state.session_data) {
            return callback(state.session_data.dev ? true : false)
          }
          return callback(false)
        }
        case 'embedded': {
          callback(state.electron ? true : false)
          break;
        }
        default: {
          break;
        }
      }
    },
    ipcInvoke(state, { payload }) {
      if (!payload || !state.embedded) {
        return false
      }
      const ipc = state.electron.ipcRenderer
      ipc.invoke(payload.key, payload.payload)
    },
    ipcSend(state, { payload }) {
      if (!payload || !state.embedded) {
        return false
      }
      const ipc = state.electron.ipcRenderer
      ipc.send(payload.key, payload.payload)
    },
    sessionErase(state) {
      state.service_valid = false;
      state.session_valid = false;
      state.session_data = null;
      state.session_token = null;
      state.session_authframe = null;
      cookie.remove(app_config.session_token_storage)
      sessionStorage.clear()
      location.reload()
    },
  },
}
