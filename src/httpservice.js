let baseurl = "http://localhost:8050/v1/";
const HttpService = {
    NoTokenServicePost: (payload, url) => {
        return fetch(baseurl + url, {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
        })
        .then(response => {
            return response.json();
        })
        .then(result => {
            return result
        })
        .catch(error => {
           return error
        });
    },

    TokenServiceGet: (url, token) => {
        return fetch(baseurl + url, {
                method: "GET",
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  "Authorization": `Bearer ${token}`
                },
            })
            .then(response => {
                if(response.status === 401) {
                    return response
                }
                else {
                    return response.json()
                }
            })
            .then(result => {
                return result
            })
            .catch(error => {
               return error
            });
    },

    TokenServiceGetNoJson: (url, token) => { //signout for want of a better implementation
        return fetch(baseurl + url, {
                method: "GET",
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  "Authorization": `Bearer ${token}`
                },
            })
            .then(response => {
                return response
            })
            .then(result => {
                return result
            })
            .catch(error => {
               return error
            });
    },

    TokenServicePost: (payload, url, token, method) => {
        if(token) {
            return fetch(baseurl + url, {
                method: method, 
                body: JSON.stringify(payload),
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            })
            .then(response => {
                if(response.status === 401) {
                    return response
                }
                else {
                    return response.json()
                }
            })
            .then(result => {
                return result
            })
            .catch(error => {
               return error
            });
        }
    }
}

export default HttpService;