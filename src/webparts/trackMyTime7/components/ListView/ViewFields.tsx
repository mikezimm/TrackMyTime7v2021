import * as React from 'react';

import { ListView, IViewField, SelectionMode, GroupOrder, IGrouping } from "@pnp/spfx-controls-react/lib/ListView";
import { Icon } from 'office-ui-fabric-react/lib/Icon';

import { defStatus, planStatus, processStatus, parkStatus, cancelStatus, completeStatus,  } from '../ListProvisioningTMT/columnsTMT';
import { projActions } from '../TrackMyTime7';


export const  initials : IViewField = {
    name: "userInitials",
    displayName: "User",
    isResizable: true,
    sorting: true,
    minWidth: 10,
    maxWidth: 30
};

export const  id : IViewField = {
  name: "id",
  displayName: "ID",
  isResizable: true,
  sorting: true,
  minWidth: 10,
  maxWidth: 30
};

export const  pid : IViewField = {
  name: "pid",
  displayName: "PID",
  isResizable: true,
  sorting: true,
  minWidth: 10,
  maxWidth: 30
};

export const  timeSpan : IViewField = {
  name: "listTimeSpan",
  displayName: "Timespan",
  //linkPropertyName: "c",
  isResizable: true,
  sorting: true,
  minWidth: 150,
  maxWidth: 200
};

export const  title : IViewField = {
  name: "titleProject",
  displayName: "Title",
  isResizable: true,
  sorting: true,
  minWidth: 150,
  maxWidth: 200
};

export const  projectWide : IViewField = {
  name: "titleProject",
  displayName: "Project",
  isResizable: true,
  sorting: true,
  minWidth: 250,
  maxWidth: 400,
  //render: null,
};

export const  description : IViewField = {
  name: "description",
  displayName: "Description",
  //linkPropertyName: "c",
  isResizable: true,
  sorting: true,
  minWidth: 20,
  maxWidth: 100
};

export const  projects : IViewField = {
  name: "listProjects",
  displayName: "Projects",
  //linkPropertyName: "c",
  isResizable: true,
  sorting: true,
  minWidth: 20,
  maxWidth: 75
};

export const  storyChapter : IViewField = {
  name: "listStoryChapter",
  displayName: "Story|Chapter",
  //linkPropertyName: "c",
  isResizable: true,
  sorting: true,
  minWidth: 60,
  maxWidth: 150
};

export const  comments : IViewField = {
  name: "listComments",
  displayName: "Comments",
  //linkPropertyName: "c",
  isResizable: true,
  sorting: true,
  minWidth: 20,
  maxWidth: 100
};

export const  category : IViewField = {
  name: "listCategory",
  displayName: "Category",
  //linkPropertyName: "c",
  isResizable: true,
  sorting: true,
  minWidth: 30,
  maxWidth: 75
};

//This does not yet work because the component ends up showing the field anyway
export function testField(visible: boolean) {
    let test  : IViewField = {
        name: "listCategory",
        displayName: visible ? "Category" : "",
        //linkPropertyName: "c",
        isResizable: visible ? true : false,
        sorting: visible ? true : false,
        minWidth: visible ? 30 : 0,
        maxWidth: visible ? 100 : 0,
    };
    return test;
}

export function viewFieldsFull( focusStory : boolean ) {

    let viewFields: IViewField[]=[];

    
    viewFields.push(id);

    viewFields.push(pid);

    viewFields.push(initials);
    viewFields.push(timeSpan);

    let storyChapter1 = storyChapter;
    let projects1 = projects;
    let category1 = category;
    let comments1 = comments;

    //viewFields.push(description);
    if ( focusStory === true ) {
      viewFields.push(storyChapter1);
      viewFields.push(title);
      comments1.minWidth = comments1.minWidth * 2 ;

    } else {
      projects1.minWidth = projects1.minWidth / 2;
      category1.minWidth = category1.minWidth / 2;

      viewFields.push(storyChapter1);
      viewFields.push(title);
      viewFields.push(projects1);
      viewFields.push(category1);

    }

    viewFields.push(comments1);

    return viewFields;
    
}

export function viewFieldsMin() {

    let viewFields: IViewField[]=[];
    viewFields.push(id);
    viewFields.push(initials);
    viewFields.push(timeSpan);
    viewFields.push(title);

    return viewFields;
    
}

export const projectWide2 : IViewField = {
  name: "titleProject",
  displayName: "Project",
  isResizable: true,
  sorting: true,
  minWidth: 250,
  maxWidth: 400,
  //render: null,
  render: (item: any) => {
    //console.log('projectWide:', item);
    let thisStyle : {} = {
      color: '#333333',
      background: 'transparent',
      verticalAlign: 'top',
//      fontWeight: 'normal',
//      fontStyle: 'normal',
//      fontWeight: 'normal',
    };
    let fColor = item['projOptions.font.color'];
    let fSize = item['projOptions.font.size'];
    let fWeight = item['projOptions.font.weight'];
    let fStyle = item['projOptions.font.style'];
    let bgColor = item['projOptions.bgColor'];
    if (fColor && fColor.length > 0) { thisStyle['color'] = fColor; }
    if (fSize && fSize.length > 0) { thisStyle['font-size'] = fSize; }
    if (fWeight && fWeight.length > 0) { thisStyle['font-weight'] = fWeight; }
    if (fStyle && fStyle.length > 0) { thisStyle['font-style'] = fStyle; }

    if (bgColor && bgColor.length > 0) { thisStyle['background'] = bgColor; }
    let iconName = item['projOptions.icon.name'];
    let iconColor = item['projOptions.icon.color'];
    let iconSize = item['projOptions.icon.size'];
    let iconWeight = item['projOptions.icon.weight'];

    //    iconSize = iconSize == null ? Math.floor(parseInt(fSize) * 1.5) : iconSize;
    iconSize = iconSize == null ? 'large' : iconSize;
/*
    fontSize: 18,
    fontWeight: iconName === 'Help' ? "900" : "normal",
    margin: '0px 2px',
    color: '#00457e', //This will set icon color
*/
//root: {padding:'10px !important', height: 32},//color: 'green' works here
    let iconStyles: any = { root: {
      //top: '10px !important',
      fontSize: iconSize,
      fontWeight: iconWeight,
      color: iconColor,
      paddingRight: '10px',
      //...(cardSectionOrItemStyles.root as object)
    }};

    let lineHeight = iconSize;
    if ( lineHeight === 'x-large') { lineHeight = '20px' ; }
    if ( lineHeight === 'xx-large') { lineHeight = '20px' ; }
    if ( lineHeight === 'large') { lineHeight = '18px' ; }

    if ( iconName && iconName.length ) { thisStyle['line-height'] = lineHeight; }
    
    const icon: any = iconName && iconName.length > 0 ? <Icon iconName={iconName} styles = {iconStyles}/> : null;
//    const element: any = React.createElement("span", { style: { color: _color, background : _bgColor } }, item.titleProject);
    const element: any = React.createElement("span", { style: thisStyle }, item.titleProject);
    let fullElement: any = <div> { icon } { element } </div>;
    return fullElement;
  }
};

function getMinWidthProject( item ) {

  let width = 0;
  for (let i = 0; i < 6; i++ ) {
    if ( item['statusCol.' + i] === 'icon') { width += 50; } 
    else if ( item['statusCol.' + i] === 'number') { width += 50; } 
    else if ( item['statusCol.' + i] === 'text') { width += 100; } 
    else if ( item['statusCol.' + i] === 'full') { width += 150; } 
  }

  return width;
}

export const projectStatus : IViewField = {
  name: "status",
  displayName: "Status",
  isResizable: true,
  sorting: true,
  minWidth: 50,
  maxWidth: 200,
  //render: null,
  render: (item: any) => {
    //console.log('projectWide:', item);
    let thisStyle : {} = {
      color: '#333333',
      background: 'transparent',
      verticalAlign: 'top',
//      fontWeight: 'normal',
//      fontStyle: 'normal',
//      fontWeight: 'normal',
    };

    let statusFull = item['status'];
    let statusArray = statusFull && statusFull.length > 0 ? statusFull.split('.') : [];
    let statusLabel = statusArray[1] ? statusArray[1] : '' ;
    let iconName = null;
    let statusNumber = null;
    let statusInteger = null;

    if (statusFull && statusFull.length > 0 ) {
      statusNumber = statusArray[0];
      statusInteger = parseInt(statusNumber);
      if ( statusNumber.length > 0 ) { statusNumber += '.'; }
      Object.keys(projActions).map( a => {
        if ( projActions[a].status === statusFull ) {
          iconName = projActions[a].icon;
        }
      });
    }

    let fColor = item['projOptions.font.color'];
    let fSize = item['projOptions.font.size'];
    let fWeight = item['projOptions.font.weight'];
    let fStyle = item['projOptions.font.style'];
    let bgColor = item['projOptions.bgColor'];
    if (fColor && fColor.length > 0) { thisStyle['color'] = fColor; }
    if (fSize && fSize.length > 0) { thisStyle['font-size'] = fSize; }
    if (fWeight && fWeight.length > 0) { thisStyle['font-weight'] = fWeight; }
    if (fStyle && fStyle.length > 0) { thisStyle['font-style'] = fStyle; }

    if (bgColor && bgColor.length > 0) { thisStyle['background'] = bgColor; }


    let iconColor = item['projOptions.icon.color'];
    let iconSize = item['projOptions.icon.size'];
    let iconWeight = item['projOptions.icon.weight'];

    //    iconSize = iconSize == null ? Math.floor(parseInt(fSize) * 1.5) : iconSize;
    iconSize = iconSize == null ? 'large' : iconSize;
/*
    fontSize: 18,
    fontWeight: iconName === 'Help' ? "900" : "normal",
    margin: '0px 2px',
    color: '#00457e', //This will set icon color
*/
//root: {padding:'10px !important', height: 32},//color: 'green' works here
    let iconStyles: any = { root: {
      //top: '10px !important',
      fontSize: iconSize,
      fontWeight: iconWeight,
      color: iconColor,
      paddingRight: '10px',
      //...(cardSectionOrItemStyles.root as object)
    }};

    let lineHeight = iconSize;
    if ( lineHeight === 'x-large') { lineHeight = '20px' ; }
    if ( lineHeight === 'xx-large') { lineHeight = '20px' ; }
    if ( lineHeight === 'large') { lineHeight = '18px' ; }

    if ( iconName && iconName.length ) { thisStyle['line-height'] = lineHeight; }
    thisStyle['padding-right'] = '3px';
    const icon: any = iconName && iconName.length > 0 ? <Icon iconName={iconName} styles = {iconStyles}/> : null;

    let elements = [];
    let statusCol = [];
    for (let i = 0; i < 6; i++ ) {
      if ( item['statusCol.' + i] ) { statusCol.push ( item['statusCol.' + i] ) ; }
    }
    if ( statusCol.length > 0 ) {

      statusCol.map( c => {
        if ( c === 'number' || c === 'text' || c === 'full' ) {
          let statusString = '';
          if ( c === 'number' ) { statusString+= statusNumber ; }
          else if ( c === 'text' ) { statusString+= statusLabel ; }
          else if ( c === 'full' ) { statusString+= statusFull ; }
          //    const element: any = React.createElement("span", { style: { color: _color, background : _bgColor } }, item.titleProject);
          const element: any = React.createElement("span", { style: thisStyle }, statusString );
          elements.push( element );
        } else if ( c === 'icon' ) {
          elements.push( icon );
        }
      });

    }

    let fullElement: any = <div title={ statusFull }> { elements } </div>;
    //let fullElement: any = <div title={ statusFull }> { element } </div>;  
    return fullElement;
  }
};

export const projectDueWarn : IViewField = {
  name: "warn",
  displayName: "Warn",
  isResizable: true,
  sorting: true,
  minWidth: 40,
  maxWidth: 40,
  //render: null,
  render: (item: any) => {
    //console.log('projectWide:', item);

    let iconColor = item['dueInfo.isLate'] === true ? 'red' : item['dueInfo.isDue'] === true ? 'DarkOrange' : null ;

    let iconSize = item['projOptions.icon.size'];

    //    iconSize = iconSize == null ? Math.floor(parseInt(fSize) * 1.5) : iconSize;
    iconSize = iconSize == null ? 'large' : iconSize;

    let iconWeight = 'bolder';

//root: {padding:'10px !important', height: 32},//color: 'green' works here
    let iconStyles: any = { root: {
      //top: '10px !important',
      fontSize: iconSize,
      fontWeight: iconWeight,
      color: iconColor,
      paddingRight: '10px',
      //...(cardSectionOrItemStyles.root as object)
    }};

    let lineHeight = iconSize;
    if ( lineHeight === 'x-large') { lineHeight = '20px' ; }
    if ( lineHeight === 'xx-large') { lineHeight = '20px' ; }
    if ( lineHeight === 'large') { lineHeight = '18px' ; }

    let elements = [];
    let statusFull = item['dueInfo.warnLabel'];

    let warnIconStyles = JSON.parse(JSON.stringify(iconStyles));
    if ( item['dueInfo.isLate'] === true ) {
      warnIconStyles.fontSize = 'smaller';
      elements.push( <Icon iconName={'Warning'} styles = {warnIconStyles}/> );

    } else if ( item['dueInfo.isDue'] === true ) {
      warnIconStyles.fontSize = 'smaller';
      elements.push( <Icon iconName={'EventDateMissed12'} styles = {warnIconStyles}/> );
    }


    let fullElement: any = <div title={ statusFull }> { elements } </div>;
    //let fullElement: any = <div title={ statusFull }> { element } </div>;  
    return fullElement;
  }
};


export function viewFieldsProject() {

  let viewFields: IViewField[]=[];
  //viewFields.push(projectWide);
  viewFields.push(projectWide2);

  return viewFields;
  
}