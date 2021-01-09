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


export const ListCommandBar: React.FunctionComponent<IListCommandBarProps> = (
  props: IListCommandBarProps
) => {

  const _applicationContext = React.useContext(AppContext);
  const {} = _applicationContext;
  const { selectedItem } = props;

  let _disableNew: boolean = false;
  let _disableEdit: boolean = true;
  let _disableDelete: boolean = true;
  let _disableView: boolean = true;

  //Added this check for selectedItem because zero is first item in array of items
  if (selectedItem || selectedItem === 0 ) {
    _disableEdit = false;
    _disableDelete = false;
    _disableView = false;
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
      key: "newItem",
      text: "New",
      cacheKey: "myCacheKey", // changing this key will invalidate this item's cache
      iconProps: { iconName: "Add" },
      disabled: _disableNew,
      commandBarButtonAs: customButton, //2021-01-08:  Added my styles to Hugo's example
      onClick: () => props.onActionSelected("New"),
    },
    {
      key: "edit",
      text: "Edit",
      iconProps: { iconName: "Edit" },
      disabled: _disableEdit,
      commandBarButtonAs: customButton, //2021-01-08:  Added my styles to Hugo's example
      onClick: () => props.onActionSelected("Edit"),
    },
    /* {
      key: "view",
      text: "View",
      iconProps: { iconName: "View" },
      disabled: _disableView,
        commandBarButtonAs: customButton, //2021-01-08:  Added my styles to Hugo's example
      onClick: () => props.onActionSelected("View"),
    }, */
    {
      key: "delete",
      text: "Delete",
      disabled: _disableDelete,
      iconProps: { iconName: "Delete" },
      commandBarButtonAs: customButton, //2021-01-08:  Added my styles to Hugo's example
      onClick: () => props.onActionSelected("Delete"),
    },
  ];
// FarItems
  const _overflowItems: ICommandBarItemProps[] = [
    {
      key: "refresh",
      text: "refresh",
      // This needs an ariaLabel since it's icon-only
      ariaLabel: "refresh list",
      iconOnly: true,
      iconProps: { iconName: "Refresh" },
      disabled: _disableDelete,
      commandBarButtonAs: customButton, //2021-01-08:  Added my styles to Hugo's example
      onClick: () => props.onActionSelected("Refresh"),
    },
  ];

  /**
   * Added my custom styles to make buttons the way I want (no border and white)
   */
  let myStyles = {
        root: { background: 'white', paddingLeft: '0px', height: '32px' }, // - removed backgroundColor: 'white'  
        primarySet: { height: '32px' }, //This sets the main _items - removed backgroundColor: 'white'  
        secondarySet:  { height: '32px' }, //This sets the _farRightItems
    }

  return (
    <div>
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
