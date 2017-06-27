import { createStoreCreator } from "../Store";

declare const window: any;
declare const writeCookie: any;
declare const AppStateStore: any;
declare function axios(obj: any): Promise<any>

export default createStoreCreator(
  {
    loggedIn: false,
    invalid: false,
    showLogin: false
  },
  // Computed
  () => ({}),
  // Actions
  state => ({
    setLoggedIn() {
      state.loggedIn = true;
      state.showLogin = false;
    },

    setLoggedOut() {
      writeCookie("ol", "no");
      state.loggedIn = false;
      window.location.href = "/logout";
    },

    setShowLogin() {
      if (!state.loggedIn) {
        AppStateStore.closeMenu();
        state.showLogin = true;
      }
    },

    setHideLogin() {
      if (!state.loggedIn) {
        AppStateStore.closeMenu();
        state.showLogin = false;
      }
    }
  }),
  // Etc
  () => ({
    async requestLogin(url: string, payload: any): Promise<any> {
      return await axios({ url, method: "post", data: payload });
    }
  })
);
