import { Platform } from "react-native";

const DOMAIN = "http://api-tsl.thunderstone.tech";

export default class FetchService {
    static login = (email, password) => {
        const header = new Headers({
            Accept: "application/json",
            "Content-Type": "application/json"
        });

        const url = DOMAIN + "/authentication";
        const setting = {
            method: "POST",
            headers: header,
            body: JSON.stringify({ email, password })
        };
        let response;
        return fetch(url, setting)
            .then((res) => {
                response = res;
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
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
            Authorization: "Bearer " + token
        });
        const setting = {
            method: "GET",
            headers: header
        };
        const url = DOMAIN + endPoint;

        let response;
        return fetch(url, setting)
            .then((res) => {
                response = res;
                return res.json();
            })
            .then((body) => {
                if (response && response.status === 200 && !!body) {
                    return Promise.resolve(body);
                }
                return Promise.reject(response.status);
            });
    };

    static post = (endPoint, data, token) => {
        const header = new Headers({
            "content-type": "application/json",
            Authorization: "Bearer " + token
        });
        const setting = {
            method: "POST",
            headers: header,
            body: JSON.stringify(data)
        };

        const url = DOMAIN + endPoint;

        let response;
        return fetch(url, setting)
            .then((res) => {
                response = res;
                return res.json();
            })
            .then((body) => {
                if (response && ((response.status === 200 && !!body) || response.status === 201)) {
                    return Promise.resolve(body);
                }
                return Promise.reject(response.status);
            });
    };

    static postImage = (data, token) => {
        const header = new Headers({
            "content-type": "multipart/form-data",
            Authorization: "Bearer " + token
        });
        const formData = new FormData();
        formData.append("file", {
            name: data.fileName,
            type: data.type,
            uri: Platform.OS === "android" ? data.uri : data.uri.replace("file://", "")
        });
        
        const setting = {
            method: "POST",
            headers: header,
            body: formData,
            redirect: "follow"
        };

        const url = DOMAIN + "/images";

        let response;
        return fetch(url, setting)
            .then((res) => {
                response = res;
                return res.json();
            })
            .then((body) => {
                if (response && response.status === 201) {
                    return Promise.resolve(body);
                }
                return Promise.reject(response.status);
            });
    };

    static delete = (endPoint, token) => {
        const header = new Headers({
            "content-type": "application/json",
            Authorization: "Bearer " + token
        });
        const setting = {
            method: "DELETE",
            headers: header
        };

        const url = DOMAIN + endPoint;

        return fetch(url, setting)
            .then((res) => {
                if (res && res.status === 204) {
                    return Promise.resolve("Success");
                }
                return Promise.reject(res.status);
            });
    };

    static patch = (endPoint, data, token) => {
        const header = new Headers({
            "content-type": "application/merge-patch+json",
            Authorization: "Bearer " + token
        });

        const setting = {
            method: "PATCH",
            headers: header,
            body: JSON.stringify(data)
        };

        const url = DOMAIN + endPoint;
        let response;
        console.log(url, setting);
        return fetch(url, setting)
            .then((res) => {
                console.log(res);
                response = res;
                return res.json();
            })
            .then((body) => {
                console.log(body);
                if (response && response.status === 200 && !!body) {
                    return Promise.resolve(body);
                }
                return Promise.reject(response.status);
            });
    };
}
