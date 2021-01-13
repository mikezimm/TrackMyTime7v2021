/**
 * This code was borrowed from sp-dev-fx-webparts/samples/react-manage-profile-card-properties/
 * https://github.com/pnp/sp-dev-fx-webparts/tree/99f859c1ec34029887fd8063cd3848cdfbc7a173/samples/react-manage-profile-card-properties
 */

import * as React from "react";
import {
  CommandBar,
  ICommandBarItemProps,
} from "office-ui-fabric-react/lib/CommandBar";
import { IButtonProps, CommandBarButton } from "office-ui-fabric-react/lib/Button";
import { IListCommandBarProps } from "./IListCommandBarProps";
import { AppContext } from "../../../../Common/AppContextProps";
import { useState, useEffect } from "react";
import { SearchBox, ISearchBoxStyles, Label } from "office-ui-fabric-react";

import { ITrackMyTime7State, IProjectOptions, IProjectAction  } from '../ITrackMyTime7State';
import { MyCons, projActions } from '../TrackMyTime7';

import styles from './ListCommandBar.module.scss';


const searchtyles: ISearchBoxStyles = {
  root: { width: 320, marginRight: 15, marginTop: 5, marginBottom: 5 },
};

export const customButton = (props: IButtonProps) => {

    return (
      <CommandBarButton
        {...props}
        styles={{
          ...props.styles,
          root: {backgroundColor: 'white'  ,padding:'10px 20px 10px 10px !important', height: 32, borderColor: 'white'},
          textContainer: { fontSize: 16, color: '#00457E' },
          icon: { 
            fontSize: 18,
            fontWeight: "bolder",
            margin: '0px 2px',
         },
         
        }}
      />
    );
  };

  


export const ListCommandBar: React.FunctionComponent<IListCommandBarProps> = ( props: IListCommandBarProps ) => {
    
    const _applicationContext = React.useContext(AppContext);
    const {} = _applicationContext;
    const { selectedItem } = props;

    let _disableNew: boolean = false;
    let _disableUpdates: boolean = true;

    //Added this check for selectedItem because zero is first item in array of items
    if (selectedItem || selectedItem === 0 ) {
        _disableUpdates = false;
    }

  //
  useEffect(() => {});

  // On clear Search
  const _onClear = () => {
    let _searchCondition: string = "";
    props.onSearch(_searchCondition);
  };

  const _onSearch = (value: string) => {
    props.onSearch(value);
  };

  // CommandBar Options
  const _items: ICommandBarItemProps[] = [
      {
        key: projActions.new.status, 
        text: projActions.new.status,  
        name: '',
        disabled: _disableNew,
        ariaLabel: projActions.new.status, 
        commandBarButtonAs: customButton, //2021-01-08:  Added my styles to Hugo's example
        onClick: () => props.onActionSelected(projActions.new.status),
        iconProps: {  iconName: projActions.new.icon, },
      },
      {
        key: projActions.edit.status, 
        text: projActions.edit.status,  
        name: '',
        disabled: _disableUpdates,
        ariaLabel: projActions.edit.status, 
        commandBarButtonAs: customButton, //2021-01-08:  Added my styles to Hugo's example
        onClick: () => props.onActionSelected(projActions.edit.status),
        iconProps: {  iconName: projActions.edit.icon, },
      },
      {
        key: projActions.copy.status, 
        text: projActions.copy.status,  
        name: '',
        disabled: _disableUpdates,
        ariaLabel: projActions.copy.status, 
        commandBarButtonAs: customButton, //2021-01-08:  Added my styles to Hugo's example
        onClick: () => props.onActionSelected(projActions.copy.status),
        iconProps: {  iconName: projActions.copy.icon, },
      }

  ];
// FarItems
  const _overflowItems: ICommandBarItemProps[] = [
    {
        key: projActions.review.status, 
        text: projActions.review.status,  
        name: '',
        disabled: _disableUpdates,
        ariaLabel: projActions.review.status, 
        commandBarButtonAs: customButton, //2021-01-08:  Added my styles to Hugo's example
        onClick: () => props.onActionSelected(projActions.review.status),
        iconProps: {  iconName: projActions.review.icon, },
      },{
        key: projActions.plan.status, 
        text: projActions.plan.status,  
        name: '',
        disabled: _disableUpdates,
        ariaLabel: projActions.plan.status, 
        commandBarButtonAs: customButton, //2021-01-08:  Added my styles to Hugo's example
        onClick: () => props.onActionSelected(projActions.plan.status),
        iconProps: {  iconName: projActions.plan.icon, },
      },{
        key: projActions.process.status, 
        text: projActions.process.status,  
        name: '',
        disabled: _disableUpdates,
        ariaLabel: projActions.process.status, 
        commandBarButtonAs: customButton, //2021-01-08:  Added my styles to Hugo's example
        onClick: () => props.onActionSelected(projActions.process.status),
        iconProps: {  iconName: projActions.process.icon, },
      },{
        key: projActions.park.status, 
        text: projActions.park.status,  
        name: '',
        disabled: _disableUpdates,
        ariaLabel: projActions.park.status, 
        commandBarButtonAs: customButton, //2021-01-08:  Added my styles to Hugo's example
        onClick: () => props.onActionSelected(projActions.park.status),
        iconProps: {  iconName: projActions.park.icon, },
      },{
        key: projActions.cancel.status, 
        text: projActions.cancel.status,  
        name: '',
        disabled: _disableUpdates,
        ariaLabel: projActions.cancel.status, 
        commandBarButtonAs: customButton, //2021-01-08:  Added my styles to Hugo's example
        onClick: () => props.onActionSelected(projActions.cancel.status),
        iconProps: {  iconName: projActions.cancel.icon, },
      },{
        key: projActions.complete.status, 
        text: projActions.complete.status,  
        name: '',
        disabled: _disableUpdates,
        ariaLabel: projActions.complete.status, 
        commandBarButtonAs: customButton, //2021-01-08:  Added my styles to Hugo's example
        onClick: () => props.onActionSelected(projActions.complete.status),
        iconProps: {  iconName: projActions.complete.icon, },
      },
  ];

  /**
   * Added my custom styles to make buttons the way I want (no border and white)
   */
  let myStyles = {
        root: { background: 'white', paddingLeft: '0px', height: '32px', borderColor: 'white' }, // - removed backgroundColor: 'white'  
        primarySet: { height: '32px' }, //This sets the main _items - removed backgroundColor: 'white'  
        secondarySet:  { height: '32px' }, //This sets the _farRightItems
    };

  return (
    <div className={ _disableUpdates === true ? styles.tmtCommandBarInActive : styles.tmtCommandBarActive }>
      <CommandBar items={_items} overflowItems={ _overflowItems} 
        styles={myStyles}
      />
    </div>
  );
};


/**
 * 

 // FarItems
const _farItems: ICommandBarItemProps[] = [
    {
      key: "search",
      text: "",
      onRender: () => {
        return (
          <SearchBox
            styles={searchtyles}
            onSearch={_onSearch}
            onClear={_onClear}
            underlined={true}
            placeholder="Search Properties"
          />
        );
      },
    },

    {
      key: "refresh",
      text: "refresh",
      // This needs an ariaLabel since it's icon-only
      ariaLabel: "refresh list",
      iconOnly: true,
      iconProps: { iconName: "Refresh" },
      onClick: () => props.onActionSelected("Refresh"),
    },
  ];
 * 
 * 
 * 
 */
