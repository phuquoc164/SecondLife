import React from "react";

const AuthContext = React.createContext();

const authReducer = (prevState, action) => {
    switch (action.type) {
        case "RESTORE_USER":
            return {
                ...prevState,
                user: { ...action.user },
                isLoading: false
            };
        case "SIGN_IN":
            return {
                ...prevState,
                isSignout: false,
                fromLogin: true,
                user: { ...action.user }
            };
        case "SIGN_OUT":
            return {
                ...prevState,
                isSignout: true,
                user: {
                    token: null,
                    firstname: null,
                    lastname: null,
                    email: null,
                    store: null,
                    subscription: null
                }
            };
    }
};

const authInitalState = {
    isLoading: true,
    isSignout: false,
    fromLogin: false,
    user: {
        token: null,
        firstname: null,
        lastname: null,
        email: null,
        store: null,
        subscription: null
    }
};

export { AuthContext, authReducer, authInitalState };
