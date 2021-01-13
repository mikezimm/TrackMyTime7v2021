/**
 * This code was borrowed from sp-dev-fx-webparts/samples/react-manage-profile-card-properties/
 * https://github.com/pnp/sp-dev-fx-webparts/tree/99f859c1ec34029887fd8063cd3848cdfbc7a173/samples/react-manage-profile-card-properties
 */

export interface IListCommandBarProps {
    selectedItem :any;
    onActionSelected: (action:string) => void;
    onSearch: (searchCondition: string) => void;
    }