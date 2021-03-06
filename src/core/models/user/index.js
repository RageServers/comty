import endpoints from 'config/endpoints';
import { v3_model } from 'core/libs';

const set = {
  data: () => {
    // TODO
  },
};

export const get = {
  data: (parms, callback) => {
    if (!parms) return false;
    const { user_id, access_token, serverKey, fetch } = parms;

    let req = {
      fetch: fetch? fetch : 'user_data'
    }

    v3_model.api_request(
      {
        body: {user_id: user_id, fetch: req.fetch},
        serverKey: serverKey,
        userToken: access_token,
        endpoint: endpoints.get_data
        
      },
      (err, res) => {
       return callback(err, res)
      },
    );
  },
  basicData: (parms, callback) => {
    if (!parms) return false

    const { username } = parms
  
    if (username) {
      v3_model.api_request(
        {
          body: { username },
          endpoint: endpoints.basicData
        },
        (err, res) => {
          err? console.error(err) : null
          return callback(false, res);
        },
      );
  
    } else {
      const res = { status: 105, message: 'Invalid Username!' };
      return callback(res, false);
    }
  },
  profileData: (parms, callback) => {
    if (!parms) return false

    const { username, server_key, access_token } = parms

    if (username) {
      v3_model.api_request(
        {
          body: { username, fetch: "user_data" },
          endpoint: endpoints.profileData,
          userToken: access_token,
          serverKey: server_key
        },
        (err, res) => {
          err? console.error(err) : null
          return callback(false, res);
        },
      );
  
    } else {
      const res = { status: 105, message: 'Invalid Username!' };
      return callback(res, false);
    }
  },
};

export const actions = {
  block: parms => {
    if (!parms) return false;
    const { id, toID } = parms;
  },
  find: parms => {
    if (!parms) return false;
    const { id, username, email } = parms;
  },
  follow: parms => {
    if (!parms) return false;
    const { id, toID } = parms;
  },
};

