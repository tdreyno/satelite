export interface IState {
    [key: string]: any;
}
export declare type IActions = {
    [fn: string]: (...args: any[]) => void;
};
export declare type IMapStateToActions<S, A> = (state: S) => A;
export declare type IMapStateToComputed<S, C> = (state: S) => C;
export interface ICreateStoreCreatorOptions<S, A, C> {
    state: S;
    actions?: IMapStateToActions<S, A>;
    computed?: IMapStateToComputed<Readonly<S>, C>;
}
export declare type IChangeCallback<S, K = keyof S> = (state: S, key: K) => any;
export declare type IStoreInstance<S, A, C> = {
    state: Readonly<S>;
    computed: Readonly<C>;
    onChange(cb: IChangeCallback<S>): void;
    offChange(cb: IChangeCallback<S>): void;
} & A;
export declare type IStoreCreator<S, A, C> = (initialState?: S) => IStoreInstance<S, A, C>;
export declare function createStoreCreator<S extends IState, A, C>({state, actions, computed}: ICreateStoreCreatorOptions<S, A, C>): IStoreCreator<S, A, C>;
