import { observable } from "../Store3";

declare const window: any;
declare const writeCookie: any;
declare const AppStateStore: any;
declare function axios(obj: any): Promise<any>

export const state = observable({
  loggedIn: false,
  invalid: false,
  showLogin: false
});

export function setLoggedIn() {
  state.loggedIn = true;
  state.showLogin = false;
}

export function setLoggedOut() {
  writeCookie("ol", "no");
  state.loggedIn = false;
  window.location.href = "/logout";
}

export function setShowLogin() {
  if (!state.loggedIn) {
    AppStateStore.closeMenu();
    state.showLogin = true;
  }
}

export function setHideLogin() {
  if (!state.loggedIn) {
    AppStateStore.closeMenu();
    state.showLogin = false;
  }
}

export async function requestLogin(url: string, payload: any): Promise<any> {
  return await axios({ url, method: "post", data: payload });
}
