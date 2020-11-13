const DOMAIN = 'http://api.thunderstone.tech/api/';

export default class FetchService {
  static login = (username, password) => {
    const header = new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });

    const url = DOMAIN + 'auth';
    const setting = {
      method: 'POST',
      headers: header,
      body: JSON.stringify({username, password}),
    };
    let response;
    return fetch(url, setting)
      .then((res) => {
        response = res;
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return res.json();
        }
        return res;
      })
      .then((body) => {
        if (response && response.status === 200) {
          if (!!body && !body.error) {
            return Promise.resolve(body);
          } else {
            return Promise.reject(body.error);
          }
        }
        return Promise.reject(response.status);
      });
  };

  static get = (endPoint, token) => {
    const header = new Headers({
      Accept: 'application/json',
      'content-type': 'application/json',
      'x-token': token
    });
    const setting = {
      method: 'GET',
      headers: header,
    };
    const url = DOMAIN + endPoint;

    let response;
    return fetch(url, setting)
      .then((res) => {
        response = res;
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return res.json();
        }
        return res;
      })
      .then((body) => {
        if (response && response.status === 200 ) {
          if (!!body && !body.error) {
            const refreshToken = response.headers.get("refresh-token");
            return Promise.resolve({data: body, refreshToken});
          } else {
            return Promise.reject(body.error);
          }
        }
        return Promise.reject(response.status);
      });
  };

  static post = (endPoint, data, token) => {
    const header = new Headers({
      Accept: 'application/json',
      'content-type': 'application/json',
      'x-token': token,
    });
    const setting = {
      method: 'POST',
      headers: header,
      body: JSON.stringify(data),
    };

    const url = DOMAIN + endPoint;

    let response;
    return fetch(url, setting)
      .then((res) => {
        response = res;
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return res.json();
        }
        return res;
      })
      .then((body) => {
        if (response && response.status === 200) {
          if (!!body && !body.error) {
            return Promise.resolve(body);
          } else {
            return Promise.reject(body.error);
          }
        }
        return Promise.reject(response.status);
      });
  }
}
