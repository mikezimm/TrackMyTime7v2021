import * as React from 'react';
import styles from './TrackMyTime7.module.scss';
import { ITrackMyTime7Props } from './ITrackMyTime7Props';
import { escape } from '@microsoft/sp-lodash-subset';
import { sp } from '@pnp/sp';

//Updated Jan 5, 2020 per https://pnp.github.io/pnpjs/getting-started/
import { Web } from "@pnp/sp/presets/all"; //const projectWeb = Web(useProjectWeb);
import { WebPartContext } from '@microsoft/sp-webpart-base';

import { Pivot, PivotItem, PivotLinkSize, PivotLinkFormat, IPivotStyles, IPivotStyleProps } from 'office-ui-fabric-react/lib/Pivot';
import { Label, ILabelStyles } from 'office-ui-fabric-react/lib/Label';
import { IStyleSet } from 'office-ui-fabric-react/lib/Styling';

import * as cStyles from '../../../services/styleReact';

import { IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';

import { DefaultButton, autobind, getLanguage, ZIndexes, IconButton, IIconProps } from 'office-ui-fabric-react';
import { Spinner, SpinnerSize, SpinnerLabelPosition } from 'office-ui-fabric-react/lib/Spinner';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';

import ChartsPage from './Charts/chartsPage';
import MyProjectPage from './Project/ProjectEditPage';
import { ProjectMode } from './Project/ProjectEditPage';
import InfoPage from './HelpInfo/infoPages';

import CenterPane from './Project/CenterPane';

import { ISelectedStory, defStory, ISelectedUser, curUser } from './Charts/chartsPage';

import * as strings from 'TrackMyTime7WebPartStrings';
import Utils from './utils';

import { saveTheTime, saveAnalytics, getTheCurrentTime } from '../../../services/createAnalytics';
import { getAge, getDayTimeToMinutes, getBestTimeDelta, getLocalMonths, getTimeSpan, getGreeting,
          getNicks, makeTheTimeObject, getTimeDelta, monthStr3, monthStr, weekday3} from '../../../services/dateServices';

//import { sortObjectArrayByStringKey, doesObjectExistInArray } from '../../../services/arrayServices';

import { sortObjectArrayByStringKey, doesObjectExistInArray } from '@mikezimm/npmfunctions/dist/arrayServices';

import { IPickedWebBasic, IPickedList, IMyProgress,
  IPivot, IMyPivots, ILink, IUser, IMyFonts, IMyIcons,
} from '../../../services/IReUsableInterfaces';

import * as fields from './ListView/ViewFields';
import { ListView, IViewField, SelectionMode, GroupOrder, IGrouping } from "@pnp/spfx-controls-react/lib/ListView";

import {IProject, ISmartText, ITimeEntry, IProjectTarget, IProjectInfo, 
        IEntryInfo, IEntries, ITrackMyTime7State, ISaveEntry,
        IChartData, 
        IProjectOptions, IStory, IStories,
        IPropsActivityURL, IProjectHistory, IProjectAction } from './ITrackMyTime7State';

import { pivotOptionsGroup, } from '../../../services/propPane';
import { getHelpfullError, } from '../../../services/ErrorHandler';
import { camelize, cleanEmptyElementsFromString } from '../../../services/stringServices';

import { Icon } from 'office-ui-fabric-react/lib/Icon';

import { buildFormFields, buildProjectFormFields } from './fields/fieldDefinitions';

import ButtonCompound from './createButtons/ICreateButtons';
import { IButtonProps,ISingleButtonProps,IButtonState } from "./createButtons/ICreateButtons";
import { createIconButton } from "./createButtons/IconButton";
import { CompoundButton, Stack, IStackTokens, elementContains } from 'office-ui-fabric-react';


import * as listBuilders from './ListView/ListView';
import * as formBuilders from './fields/textFieldBuilder';
import * as choiceBuilders from './fields/choiceFieldBuilder';
import * as sliderBuilders from './fields/sliderFieldBuilder';
import * as smartLinks from './ActivityURL/ActivityURLMasks';
import * as dateBuilders from './fields/dateFieldBuilder';

import  { ICommandBarState, ICommandBarProps} from './Project/ProjectCommandBar';
import MyCommandBar from './Project/ProjectCommandBar';
import { nominalTypeHack } from 'prop-types';

import { createDialog } from './Project/ConfirmUpdate';

import  EarlyAccess from './HelpInfo/EarlyAccess';


import * as links from './HelpInfo/AllLinks';

/**
 * 
 * 
 * 
 * THIS Section is for List Provisioning testing
 * 
 * 
 * 
 */
import { addTheseFields } from '../../../services/listServices/columnServices';
import { TMTProjectFields } from './ListProvisioningTMT/columnsTMT';

import { defStatus, planStatus, processStatus, parkStatus, cancelStatus, completeStatus, } from './ListProvisioningTMT/columnsTMT';

import { provisionTheList } from './ListProvisioningTMT/provisionTMT';
// let webURL = 'https://mcclickster.sharepoint.com/sites/Templates/Testing/';
// let result = provisionTheList( 'Projects', webURL);

//export enum TMTDialogMode { False, review, Plan, process, Park, Cancel, Complete }
export enum TMTDialogMode { False, New, Edit, Copy, Review, Plan, Process, Park, Cancel, Complete }

const labelStyles: Partial<IStyleSet<ILabelStyles>> = {
  root: { marginTop: 10 }
};

const allProjEditOptions = cleanEmptyElementsFromString( 'activity;advanced;people;reporting;task', ';', true, 'asc' );

const defProjEditOptions = cleanEmptyElementsFromString( 'people;reporting', ';', true, 'asc' );

export const statusChoices : string[] = [defStatus, planStatus, processStatus, parkStatus, cancelStatus, completeStatus];

export const activityTMTChoices = ['TMT Issue', 'Socialiis Issue'];


/***
 *    .88b  d88. db    db  .o88b.  .d88b.  d8b   db .d8888. 
 *    88'YbdP`88 `8b  d8' d8P  Y8 .8P  Y8. 888o  88 88'  YP 
 *    88  88  88  `8bd8'  8P      88    88 88V8o 88 `8bo.   
 *    88  88  88    88    8b      88    88 88 V8o88   `Y8b. 
 *    88  88  88    88    Y8b  d8 `8b  d8' 88  V888 db   8D 
 *    YP  YP  YP    YP     `Y88P'  `Y88P'  VP   V8P `8888Y' 
 *                                                          
 *                                                          
 */

export const MyCons = {
  new: 'Add',
  edit: 'Edit',
  copy: 'Copy',
  review: 'Rewind',  //ExportMirrored
  plan: 'BranchCompare',
  process: 'Processing',
  cancel: "Cancel",
  park: "Car", //Snooze
  complete: 'SkypeCheck',
};

export enum FieldChange { Clear, Set, Nothing }

const actionPark : IProjectAction = { 
  icon: MyCons.park,
  status: parkStatus,
  verb: 'Parked Project',
  prompt: 'Do you want to Park this project for now?',
  subText: 'This will set the status to ' +  parkStatus +  '.  You can then find it under the "Closed" heading', 
  details: 'Set Status: ' +  parkStatus +  '|Cleared Completed By|Cleared Completed Date',
  setDate: false,
  setUser: false,
  dialog: TMTDialogMode.Park,
 };

 const actionComplete : IProjectAction = { 
  icon: MyCons.complete,
  status: completeStatus,
  verb: 'Completed Project',
  prompt: 'Do you want to Complete this project?',
  subText: 'This will set the status to ' +  completeStatus +  '.  You can then find it under the "Closed" heading', 
  details: 'Set Status: ' +  completeStatus +  '|Set Completed Date:  TimeStamp|Set Completed By: User.',
  setDate: true,
  setUser: true,
  dialog: TMTDialogMode.Complete,
 };
 
 const actionCancel : IProjectAction = { 
  icon: MyCons.cancel,
  status: cancelStatus,
  verb: 'Cancelled Project',
  prompt: 'Do you want to Cancel this?',
  subText: 'This will set the status to ' +  cancelStatus + '.  You can then find it under the "Closed" heading', 
  details: 'Set Status: ' +  cancelStatus +  '|Set Completed Date:  TimeStamp|Set Completed By: User.',
  setDate: true,
  setUser: true,
  dialog: TMTDialogMode.Cancel,
 };

 const actionPlan : IProjectAction = { 
  icon: MyCons.plan,
  status: planStatus,
  verb: 'Sent to Plan',
  prompt: 'Do you want to set the status to ' +  planStatus + '?',
  subText: 'This will set the status to ' +  planStatus + '.',
  details: 'Set Status: ' +  planStatus +  '|Cleared Completed By|Cleared Completed Date',
  setDate: false,
  setUser: false,
  dialog: TMTDialogMode.Plan,
 };

 const actionProcess : IProjectAction = { 
  icon: MyCons.process,
  status: processStatus,
  verb: 'Sent to In Process',
  prompt: 'Do you want to set the status to ' +  processStatus + '?',
  subText: 'This will set the status to ' +  processStatus + '.',
  details: 'Set Status: ' +  processStatus +  '|Cleared Completed By|Cleared Completed Date',
  setDate: false,
  setUser: false,
  dialog: TMTDialogMode.Review,
 };

 const actionReview : IProjectAction = { 
  icon: MyCons.review,
  status: defStatus,
  verb: 'Sent back to Review',
  prompt: 'Do you want to Review this?',
  subText: 'This will set the status to ' +  defStatus + '.',
  details: 'Set Status: ' +  defStatus +  '|Cleared Completed By|Cleared Completed Date',
  setDate: false,
  setUser: false,
  dialog: TMTDialogMode.Review,
 };

 const actionNew : IProjectAction = {
  icon: MyCons.new,
  status: 'New',
  verb: 'Created project',
  dialog: TMTDialogMode.New,
 };

 const actionEdit : IProjectAction = {
  icon: MyCons.edit,
  status: 'Edit',
  verb: 'Updated project',
  dialog: TMTDialogMode.Edit,
 };

 const actionCopy : IProjectAction = {
  icon: MyCons.copy,
  status: 'Copy',
  verb: 'Copied project',
  dialog: TMTDialogMode.Copy,  
 };

export const projActions = {
  new: actionNew,
  edit: actionEdit,
  copy: actionCopy,
  review: actionReview,
  plan: actionPlan,
  process: actionProcess,
  park: actionPark,
  complete: actionComplete,
  cancel: actionCancel,
};



export function getColumnProp( findProp: string, findMe : string, returnProp: string, arr: any ){

  if (findProp == null ) { return null; }
  if (returnProp == null ) { return null; }

  let result = null;
  for (let item of arr) {
    if (item[findProp] === findMe ) { result = item[returnProp]; }
  }

  //console.log('columnProp ' + findMe + ' / ' + returnProp + ': ', result);

  return result;

}

export default class TrackMyTime7 extends React.Component<ITrackMyTime7Props, ITrackMyTime7State> {

/***
 *          .o88b.  .d88b.  d8b   db .d8888. d888888b 
 *         d8P  Y8 .8P  Y8. 888o  88 88'  YP `~~88~~' 
 *         8P      88    88 88V8o 88 `8bo.      88    
 *         8b      88    88 88 V8o88   `Y8b.    88    
 *         Y8b  d8 `8b  d8' 88  V888 db   8D    88    
 *          `Y88P'  `Y88P'  VP   V8P `8888Y'    YP    
 *                                                    
 *                                                    
 */

  private createEntryInfo() {

    let entryInfo = {} as IEntryInfo;
    entryInfo.all = []; //All Entries
    entryInfo.user = []; //Current user's entries
    entryInfo.session = []; //Current user's entries
    entryInfo.today = []; //Current user's entries
    entryInfo.week = []; //Current user's entries
    entryInfo.userKeys = []; //Current user's entry keys
    entryInfo.userPriority = []; //Current user's priority entries
    entryInfo.current = []; //All 'Current' entries
    entryInfo.lastFiltered = []; //Last filtered for search
    entryInfo.lastEntry = []; 
    entryInfo.newFiltered = []; //New filtered for search
    entryInfo.firstItem = null;
    
    return entryInfo;

  }

  /**
   * 
   * @param statusNumber This converts status number to the project active property
   * active = true: project shows up in the "Yours, Team, Others, Everyone" bucket
   * active = false: project shows up in the parking lot bucket
   * active = null:  project is in the Inactive/Closed bucket
   */

  private convertStatusToActive(statusNumber) {

    let active: boolean = true;
    if ( statusNumber == 9 ) {
      active = null;
    } else if ( statusNumber == 8 ) {
      active = false;
    }
    
    return active;
    
  }

  private createLink(){
    let link : ILink = {
      Description: '',
      Url: '',
    };

    return link;

  }

  private createSmartText(title, name) {
    let smart : ISmartText = {
      projListValue: '',
      value: '',
      required: false,
      hidden: false,
      default: '',
      defaultIsPrefix: false,
      prefix: '',
      title: title, //Required for building text fields
      name: name, //Required for building text fields
      mask: '',  //Required for building text fields
    };
    return smart;
  }

  private createActURLRules( projActivityRule: string ) {

  // To be used for if Project Activity URL is used. Syntax:  title=Title Type Activity;
  // title special words:  Replace..., IgnoreTitle, Derive
  // Special shortcuts:  title=Replace...TypeActivity - replace Title only if it's value is ...
  // Special shortcuts:  title=Replace...TypeActivity - replace Title only if it's value is ... 
  // Special shortcuts:  title=IgnoreTitleType-Activity - replaces Project Title with just the Type-Activity values
  // Special shortcuts:  title=DeriveType-Activity - uses just Title column to derive Type and Activity fields (not recommended or programmed yet)
    
    let specialRule = '';
    let rules = projActivityRule != null ? projActivityRule.split(';') : null;
    let titleMap = '';
    let titleRule = '';
    // <Type>-<Activity>
    if ( rules != null ) {
      for (let r in rules){
        let theseRules = r.split('=');
        if ( theseRules != null && theseRules[0] == 'title') { 
          titleRule = theseRules[1] + '';
          if ( theseRules[1].indexOf('Replace...') === 0 ) { specialRule = 'Replace'; theseRules[1] = theseRules[1].replace('Replace...',''); }
          else if ( theseRules[1].indexOf('IgnoreTitle...') === 0 ) { specialRule = 'IgnoreTitle'; theseRules[1] = theseRules[1].replace('IgnoreTitle...',''); }
          else if ( theseRules[1].indexOf('Derive...') === 0 ) { specialRule = 'Derive'; theseRules[1] = theseRules[1].replace('Derive...',''); }
          titleMap = theseRules[1];
          return;
        }
      }
    }

    let result : IPropsActivityURL = {
      rule: specialRule,
      rules:  rules,
      titleMap:  titleMap,  //String with replace variables like Title, Type and Activity
      titleRule:  titleRule,
    };

    return result;   

  }

  private createUser() {
    let user : IUser = {
      title: "",
      Title: "" , //
      initials: "",  //Single person column
      email: "",  //Single person column
      id: null,
      Id: null,
      ID: null,
      isSiteAdmin:null,
      LoginName: "",
      remoteID: null,
    };
    return user;

  }

  private createPivotData(onlyActiveProjects:boolean){
    // Using https://stackoverflow.com/questions/3103962/converting-html-string-into-dom-elements
    let pivots : IMyPivots = {
      heading1: 
        [
          { headerText: "Yours",
            filter: "your",
            itemKey: "your",
            data: "Projects where you are the Leader",
            lastIndex: null,
          },
          { headerText: "Your Team",
            filter: "team",
            itemKey: "team",
            data: "Projects where you are in the Team",
            lastIndex: null,
          },
          { headerText: "Everyone",
            filter: "everyone",
            itemKey: "everyone",
            data: "Projects where Everyone is marked Yes - overrides other categories",
            lastIndex: null,
          },
          { headerText: "Others",
            filter: "otherPeople",
            itemKey: "otherPeople",
            data: "Projects where you are not the Leader, nor in the team, and not marked Everyone",
            lastIndex: null,
          },
        ]
      ,
      heading2: 
        [
          { headerText: "Yours",
            filter: "your",
            itemKey: "your",
            data: "History where you are the User",
            lastIndex: null,
          },
          { headerText: "Your Team",
            filter: "team",
            itemKey: "team",
            data: "History where you are part of the Team, but not the User",
            lastIndex: null,
          },
          { headerText: "Everyone",
            filter: "everyone",
            itemKey: "everyone",
            data: "Currently not in use",
            lastIndex: null,
          },
          { headerText: "Others",
            filter: "otherPeople",
            itemKey: "otherPeople",
            data: "History where you are not the Leader, nor in the team, and not marked Everyone",
            lastIndex: null,
          },
        ]
      ,
    };

    pivots.heading1.push(
      { headerText: "Parking lot",
      filter: "parkingLot",
      itemKey: "parkingLot",
      data: "Projects on hold or in parking lot",
      lastIndex: null,
    });

    if ( !onlyActiveProjects ) { 
      pivots.heading1.push(
        { headerText: "Closed",
        filter: "closed",
        itemKey: "closed",
        data: "Completed or Cancelled projects",
        lastIndex: null,
      }
      );
    }

    return pivots;

  }

  private createFormEntry() {

    //https://stackoverflow.com/a/37802516/4210807

    let form : ISaveEntry = {

    titleProject:'Tell me what you are doing here :)',
    comments: this.createSmartText('Comments','comments'),
    
    category1:[],
    category2:[],
    leader:this.createUser(),
    team:[],
    leaderId:null,
    teamIds:[],
    story: '',
    chapter: '',
    projectID1:this.createSmartText('Project ID1','projectID1'),
    projectID2:this.createSmartText('Project ID2','projectID2'),
    sourceProject:this.createLink(),
    sourceProjectRef: '',
    activity:this.createLink(),
    ccList:this.createLink(),
    ccEmail:'',
    userId: null,
    startTime:'',
    endTime:'',
    entryType:this.props.defaultTimePicker,
    timeEntryTBD1:'',
    timeEntryTBD2:'',
    timeEntryTBD3:'',
    location:this.props.defaultLocation,
    settings:'',

    };

    return form;

  }

  private errTitles() {
    let options = [
      'Oh Snap! We have a slight problem!',
      'Houston, We have a problem!',
      'Typo Alert!',
      'Uhhmm... I have an issue!',
      'Not sure what to say except...',
      'We call these possible Typos...',
      'Typos cost 1 Gazzilion lost electrons every year...',
      'My AutoCorrect never fails... but...',
      'May I call you ' + this.props.pageContext.user.displayName + '?',
      'But but but... I know humans don\'t make mistakes',
      'Please dial ++ (888)-TyposRUs'
    ];

    return options[Math.floor(Math.random() * options.length)];

  }

  private createProjectTimeTracking(pTimeTarget: any) {
    let daily: any = false;
    let weekly: any = false;
    let total: any = false;
    let projListValue = pTimeTarget;

    if (pTimeTarget) {
      let ttOptions = pTimeTarget.split(';');
      for (let opt of ttOptions) {
        let thisOption = opt.split('=');
        if (thisOption[1] && thisOption[0].toLowerCase() === 'daily') {
          daily = parseInt(thisOption[1]);
        } else if (thisOption[1] && thisOption[0].toLowerCase() === 'weekly') {
          weekly = parseInt(thisOption[1]);
        } else if (thisOption[1] && thisOption[0].toLowerCase() === 'total') {
          total = parseInt(thisOption[1]);
        }
      }
    }

    let targetInfo : IProjectTarget = {
      projListValue: projListValue,
      value: pTimeTarget,
      daily: daily ? daily : 0,
      weekly: weekly ? weekly : 0,
      total: total ? total : 0,
      dailyStatus: daily ? true : false,
      weeklyStatus: weekly ? true : false,
      totalStatus: total ? true : false,
    };

    return targetInfo;
  }

  private createProjOptionsObject() {

    let projOptions: IProjectOptions =  {
      showLink: null,
      activity: null,
      type: null,
      href: null,
      title: null,
  
      optionString: null,
      optionArray: null,
      bgColor: null,
      font: null,
      icon: null,
      projectEditOptions: defProjEditOptions,
    };

    return projOptions;

  }

  private createEmptyProjectObject() {
    let emptyProject : IProject =   {
      titleProject : null,

      //Reporting columns
      category1 : null,
      category2 : null,
      projectID1 : this.buildSmartText(null, null),
      projectID2 : this.buildSmartText(null, null),
      comments: this.buildSmartText(null, null),

      story : null,
      chapter : null,

      //Activity Columns
      projOptions: this.createProjOptionsObject(),

      //People Columns
      everyone : false,
      leader : null,
      leaderId: null,
      team : null,
      teamIds: null,

      //Task Columns
      status : null,
      dueDate : null,
      completedDate : null,
      completedBy : null,
      completedById: null,
      
      //Advanced Columns
      ccEmail : null,
      ccList : null,
      sortOrder : null,

      timeTarget: this.createProjectTimeTracking(null),
    };

    return emptyProject;

  }


  private createprojectInfo() {

    let projectInfo = {} as IProjectInfo;

    projectInfo.master = [];
    projectInfo.user = [];
    projectInfo.masterPriority = [];
    projectInfo.userPriority = [];
    projectInfo.current = [];
    projectInfo.lastFiltered = [];
    projectInfo.lastProject = [];
    projectInfo.all = [];
    projectInfo.newFiltered = []; //New filtered for search

    return projectInfo;

  }

  private cleanURL(originalURL: String) {

    let newURL = originalURL.toLowerCase();
    if ( newURL.indexOf('/sitepages/') > 0 ) { return newURL.substring(0, newURL.indexOf('/sitepages/') + 1) ; }
    if ( newURL.indexOf('/lists/') > 0 ) { return newURL.substring(0, newURL.indexOf('/lists/') + 1) ; }
    if ( newURL.indexOf('/siteassets/') > 0 ) { return newURL.substring(0, newURL.indexOf('/siteassets/') + 1) ; }
    if ( newURL.indexOf('/_layouts/') > 0 ) { return newURL.substring(0, newURL.indexOf('/_layouts/') + 1) ; }
    if ( newURL.indexOf('/documents/') > 0 ) { return newURL.substring(0, newURL.indexOf('/documents/') + 1) ; }
    if ( newURL.indexOf('/shared documents/') > 0 ) { return newURL.substring(0, newURL.indexOf('/shared documents/') + 1) ; }
    if ( newURL.indexOf('/shared%20documents/') > 0 ) { return newURL.substring(0, newURL.indexOf('/shared%20documents/') + 1) ; }
    if ( newURL.indexOf('/forms/') > 0 ) { 
      newURL = newURL.substring(0, newURL.indexOf('/forms/'));
      newURL = newURL.substring(0, newURL.indexOf('/') + 1);
      return newURL;
    }
    if ( newURL.indexOf('/pages/') > 0 ) { return newURL.substring(0, newURL.indexOf('/pages/') + 1) ; }
    if ( newURL.substring(newURL.length) !== '/' ) { return newURL + '/'; }

    return newURL;

  }

/***
 *          .o88b.  .d88b.  d8b   db .d8888. d888888b d8888b. db    db  .o88b. d888888b  .d88b.  d8888b. 
 *         d8P  Y8 .8P  Y8. 888o  88 88'  YP `~~88~~' 88  `8D 88    88 d8P  Y8 `~~88~~' .8P  Y8. 88  `8D 
 *         8P      88    88 88V8o 88 `8bo.      88    88oobY' 88    88 8P         88    88    88 88oobY' 
 *         8b      88    88 88 V8o88   `Y8b.    88    88`8b   88    88 8b         88    88    88 88`8b   
 *         Y8b  d8 `8b  d8' 88  V888 db   8D    88    88 `88. 88b  d88 Y8b  d8    88    `8b  d8' 88 `88. 
 *          `Y88P'  `Y88P'  VP   V8P `8888Y'    YP    88   YD ~Y8888P'  `Y88P'    YP     `Y88P'  88   YD 
 *                                                                                                       
 *                                                                                                       
 */


  public constructor(props:ITrackMyTime7Props){
    super(props);
    let projWeb = this.cleanURL(this.props.projectListWeb ? this.props.projectListWeb : props.pageContext.web.absoluteUrl);
    let timeWeb = this.cleanURL(this.props.timeTrackListWeb ? this.props.timeTrackListWeb : props.pageContext.web.absoluteUrl);
    this.state = { 

      //Size courtesy of https://www.netwoven.com/2018/11/13/resizing-of-spfx-react-web-parts-in-different-scenarios/
      WebpartHeight: this.props.WebpartElement.getBoundingClientRect().height ,
      WebpartWidth:  this.props.WebpartElement.getBoundingClientRect().width - 50 ,

      // 1 - Analytics options

      // 2 - Source and destination list information
      projectListURL: projWeb + 'lists/' + this.props.projectListTitle, //Get from list item
      timeTrackerListURL: timeWeb + 'lists/' + this.props.timeTrackListTitle, //Get from list item

      projectListWeb: projWeb, //Get from list item
      timeTrackerListWeb: timeWeb, //Get from list item

      projectListName: this.props.projectListTitle,  // Static Name of list (for URL) - used for links and determined by first returned item
      timeTrackListName: this.props.timeTrackListTitle,  // Static Name of list (for URL) - used for links and determined by first returned item

      // 3 - General how accurate do you want this to be

      // 4 -Project options
      pivots: this.createPivotData(this.props.onlyActiveProjects),
      projects: this.createprojectInfo(),
      entries: this.createEntryInfo(),
      
      loadData: {
        user: null,
        projects: [],
        entries: [],
      },

      showCharts: false,
      chartData: null,
      selectedStory: defStory,
      selectedUser: curUser,

      fields: buildFormFields(this.props, this.state),
      projectFields: buildProjectFormFields(this.props,this.state),

      pivtTitles:['Yours', 'Your Team','Everyone','Others'],
      filteredCategory: this.props.defaultProjectPicker,
      pivotDefSelKey:"",
      onlyActiveProjects: this.props.onlyActiveProjects,
      projectType: this.props.projectType,

      syncProjectPivotsOnToggle: this.props.syncProjectPivotsOnToggle, //always keep pivots in sync when toggling projects/history

      projColumns : {
        statusChoices: [],
        activityTMTChoices: [],
        category1Choices: [],
        category2Choices: [], 

        statusDefault: '',
        activityTMTDefault: '',
        category1Default: '',
        category2Default: '',

        optionsTMTCalc: '',
        activtyURLCalc: '',
      },

      projActivityRule: this.createActURLRules(this.props.projActivityRule),

      // 5 - UI Defaults
      currentProjectPicker: '', //User selection of defaultProjectPicker:  Recent, Your Projects, All Projects etc...
      currentTimePicker: this.props.defaultTimePicker, //User selection of :defaultTimePicker  SinceLast, Slider, Manual???
      locationChoice: '',  //semi-colon separated choices
      blinkOnProject: 0, //Tells text fields to blink when project is clicked on and values reset
      blinkOnActivity: 0, //Tells text fields to blink when project is clicked on and values reset

      coreStart: 8, //Used for calculating hours in core times
      coreEnd: 18, //Used for calculating hours in core times
      coreWeekend: true, //Used for calculating hours in core times 

      smartLinkRules: smartLinks.buildSmartLinkRules(this.props),

      // 6 - User Feedback:
      showElapsedTimeSinceLast: true,  // Idea is that it can be like a clock showing how long it's been since your last entry.
      elapsedTime: 0,   //Elapsed Time since last entry

      allEntries: [], // List of all entries
      filteredEntries: [],  //List of recent entries
      lastEndTime: null,
      formEntry: null,

      // 7 - Slider Options
      timeSliderValue: 0,  //incriment of time slider
      projectMasterPriorityChoice: this.props.projectMasterPriority, //Use to determine what projects float to top.... your most recent?  last day?
      projectUserPriorityChoice: this.props.projectUserPriority,  //Use to determine what projects float to top.... your most recent?  last day?

      // 9 - Other web part options

      selectedProjectIndex: null,  //Adding these 2 sets the default as the first project ever time, then the number of the selection stays between pivots.
      selectedProjectIndexArr: [],
      lastSelectedProjectIndex: null,

      showProjectScreen: ProjectMode.False,

      loadOrder: "",
      projectsLoadStatus:"Loading",
      projectsLoadError: "",
      projectsListError: false,
      projectsItemsError: false,

      timeTrackerLoadStatus:"Loading",
      timeTrackerLoadError: "",
      timeTrackerListError: false,
      timeTrackerItemsError: false,

      selectedProject: null,
      userLoadStatus:"Loading",
      errTitle: this.errTitles(),
      showTips: false,
      loadError: "",
      debugColors: false,

      lastTrackedClick: null,
      clickHistory: [],
      allLoaded: false,

      listError: false,
      itemsError: false,

      searchType: '',
      searchShow: true,
      searchCount: 0,
      searchWhere: '',

      dialogMode: TMTDialogMode.False,

    };

    // because our event handler needs access to the component, bind 
    //  the component to the function so it can get access to the
    //  components properties (this.props)... otherwise "this" is undefined
    this.onLinkClick = this.onLinkClick.bind(this);
    this.toggleType = this.toggleType.bind(this);
    this.toggleTips = this.toggleTips.bind(this);
    this.minimizeTiles = this.minimizeTiles.bind(this);
    this.searchMe = this.searchMe.bind(this);
    this.showAll = this.showAll.bind(this);
    this.toggleLayout = this.toggleLayout.bind(this);
    this.onChangePivotClick = this.onChangePivotClick.bind(this);
    this.toggleCharts = this.toggleCharts.bind(this);
    this.toggleDebug = this.toggleDebug.bind(this);

    this.trackMyTime = this.trackMyTime.bind(this);
    this.clearMyInput = this.clearMyInput.bind(this);

    this._updateComments = this._updateComments.bind(this);
    this._updateStory = this._updateStory.bind(this);
    this._updateUserFilter = this._updateUserFilter.bind(this);
    this._updateChartFilter = this._updateChartFilter.bind(this);

    this._onActivityClick = this._onActivityClick.bind(this);

    this._newProject = this._newProject.bind(this);
    this._editProject = this._editProject.bind(this);
    this._copyProject = this._copyProject.bind(this);

    this._reviewProject = this._reviewProject.bind(this);
    this._planProject = this._planProject.bind(this);
    this._processProject = this._processProject.bind(this);

    this._parkProject = this._parkProject.bind(this);
    this._cancelProject = this._cancelProject.bind(this);
    this._completeProject = this._completeProject.bind(this);   
    this._closeProjectEdit = this._closeProjectEdit.bind(this); 

    this._reviewProjectDialog = this._reviewProjectDialog.bind(this); 
    this._planProjectDialog = this._planProjectDialog.bind(this); 
    this._processProjectDialog = this._processProjectDialog.bind(this); 

    this._parkProjectDialog = this._parkProjectDialog.bind(this); 
    this._cancelProjectDialog = this._cancelProjectDialog.bind(this); 
    this._completeProjectDialog = this._completeProjectDialog.bind(this); 
    this._closeDialog = this._closeDialog.bind(this); 

    this._createHistoryObjectNoDetails = this._createHistoryObjectNoDetails.bind(this); 

    this._processCatch = this._processCatch.bind(this); 

    this._getMoreItems = this._getMoreItems.bind(this);

    //this._getSelectedProject = this._getSelectedProject.bind(this)

  }


  public componentDidMount() {

    this._getListItems();
    
  }


  /***
 *         d8888b. d888888b d8888b.      db    db d8888b. d8888b.  .d8b.  d888888b d88888b 
 *         88  `8D   `88'   88  `8D      88    88 88  `8D 88  `8D d8' `8b `~~88~~' 88'     
 *         88   88    88    88   88      88    88 88oodD' 88   88 88ooo88    88    88ooooo 
 *         88   88    88    88   88      88    88 88~~~   88   88 88~~~88    88    88~~~~~ 
 *         88  .8D   .88.   88  .8D      88b  d88 88      88  .8D 88   88    88    88.     
 *         Y8888D' Y888888P Y8888D'      ~Y8888P' 88      Y8888D' YP   YP    YP    Y88888P 
 *                                                                                         
 *                                                                                         
 */

  public componentDidUpdate(prevProps){

    let rebuildTiles = false;
    if (this.props.defaultProjectPicker !== prevProps.defaultProjectPicker) {  rebuildTiles = true ; }

    if (rebuildTiles === true) {
      this._updateStateOnPropsChange({});
    }
  }

/***
 *         d8888b. d888888b db    db  .d88b.  d888888b .d8888. 
 *         88  `8D   `88'   88    88 .8P  Y8. `~~88~~' 88'  YP 
 *         88oodD'    88    Y8    8P 88    88    88    `8bo.   
 *         88~~~      88    `8b  d8' 88    88    88      `Y8b. 
 *         88        .88.    `8bd8'  `8b  d8'    88    db   8D 
 *         88      Y888888P    YP     `Y88P'     YP    `8888Y' 
 *                                                             
 *                                                             
 */

  public createProjectChoices(thisState){
    let projectHeading: JSX.Element = <div>
        <h2> { this.state.projectType === false ? 'Pick from the Project List' : 'Or... Your recent history'}</h2>
      </div>;
    let elemnts = [];

    if (thisState.projects.all[0]){
      elemnts = 
        thisState.projects.newFiltered.map(project => (
        <div>
          { project.projectType } <span>: </span>{ project.titleProject } <span> - </span>{ project.category1 } <span> - </span>{ project.category2 }
        </div>
        ));
    } 

    return ( 
      <Stack horizontal={false} wrap={false}>{/* Stack for Projects */}
        {projectHeading}
        {elemnts} 
      </Stack>
      );
  }



  public createPivotObject(setPivot, display){

    let theseStyles = this.state.debugColors ? cStyles.styleRootBGColor(true, 'piv') : null;

    let pivotPart = 
    <Pivot 
      style={{ flexGrow: 1, paddingLeft: '10px', display: display }}
      styles={ theseStyles }
      linkSize= { pivotOptionsGroup.getPivSize(this.props.pivotSize) }
      linkFormat= { pivotOptionsGroup.getPivFormat(this.props.pivotFormat) }
      onLinkClick= { this.onLinkClick.bind(this) }  //{this.specialClick.bind(this)}
      selectedKey={ setPivot }
      headersOnly={true}>
        {this.createPivots(this.state,this.props)}
    </Pivot>;
    return pivotPart;
  }

  /***
 *         d8888b. db    db d888888b db      d8888b. d88888b d8888b. .d8888. 
 *         88  `8D 88    88   `88'   88      88  `8D 88'     88  `8D 88'  YP 
 *         88oooY' 88    88    88    88      88   88 88ooooo 88oobY' `8bo.   
 *         88~~~b. 88    88    88    88      88   88 88~~~~~ 88`8b     `Y8b. 
 *         88   8D 88b  d88   .88.   88booo. 88  .8D 88.     88 `88. db   8D 
 *         Y8888P' ~Y8888P' Y888888P Y88888P Y8888D' Y88888P 88   YD `8888Y' 
 *                                                                           
 *                                                                           
 */

  public createHistoryItems(thisState){
    let elemnts = [];
    if (thisState.filteredEntries[0]){
      elemnts = thisState.filteredEntries.map(project => (
        <div>
          { project.titleProject } { project.startTime } { project.endTime }
        </div>
        ));
    }
    return ( elemnts );
  }

  public createProjectTypeToggle(thisState){

    let togglePart = <Toggle label="" 
      onText={strings.ToggleLabel_History } 
      offText={strings.ToggleLabel_Projects} 
      onChange={this.toggleType.bind(this)} 
      checked={this.state.projectType}
      styles={{ root: { width: 120, paddingTop: 13, } }}
      />;
    return togglePart;

  }


/***
 *         d8888b. d88888b d8b   db d8888b. d88888b d8888b. 
 *         88  `8D 88'     888o  88 88  `8D 88'     88  `8D 
 *         88oobY' 88ooooo 88V8o 88 88   88 88ooooo 88oobY' 
 *         88`8b   88~~~~~ 88 V8o88 88   88 88~~~~~ 88`8b   
 *         88 `88. 88.     88  V888 88  .8D 88.     88 `88. 
 *         88   YD Y88888P VP   V8P Y8888D' Y88888P 88   YD 
 *                                                          
 *                                                          
 */

  public render(): React.ReactElement<ITrackMyTime7Props> {

    const showProjectScreen = this.state.showProjectScreen ;

/***
 *              d88888b d8888b. d888888b d888888b      d8888b. d8888b.  .d88b.     d88b d88888b  .o88b. d888888b 
 *              88'     88  `8D   `88'   `~~88~~'      88  `8D 88  `8D .8P  Y8.    `8P' 88'     d8P  Y8 `~~88~~' 
 *              88ooooo 88   88    88       88         88oodD' 88oobY' 88    88     88  88ooooo 8P         88    
 *              88~~~~~ 88   88    88       88         88~~~   88`8b   88    88     88  88~~~~~ 8b         88    
 *              88.     88  .8D   .88.      88         88      88 `88. `8b  d8' db. 88  88.     Y8b  d8    88    
 *              Y88888P Y8888D' Y888888P    YP         88      88   YD  `Y88P'  Y8888P  Y88888P  `Y88P'    YP    
 *                                                                                                               
 *                                                                                                               
 */

    if (showProjectScreen !== ProjectMode.False ) {

      let selectedProject: IProject = null;
      
      if ( showProjectScreen === ProjectMode.New ) { 
        selectedProject = this.createEmptyProjectObject();
      }
      else if ( showProjectScreen === ProjectMode.Copy ) {
        selectedProject = JSON.parse(JSON.stringify(this.state.selectedProject));
        selectedProject.titleProject = "Copy of " + selectedProject.titleProject;
        selectedProject.projOptions.activity = this.state.selectedProject.projOptions.activity == '' ? 
              "" : "Copy of " + this.state.selectedProject.projOptions.activity;
        selectedProject.status = defStatus;
        selectedProject.dueDate = null;
        selectedProject.completedDate = null;
        selectedProject.completedBy = null;
        selectedProject.projOptions.projectEditOptions = allProjEditOptions;
      
      } else {
        selectedProject = JSON.parse(JSON.stringify(this.state.selectedProject));        
      }

      let projectPage = <MyProjectPage 

        currentUser= {this.state.currentUser}
        projColumns={ this.state.projColumns }
        wpContext= {this.props.wpContext}
        showProjectScreen={ this.state.showProjectScreen }
        selectedProject={ selectedProject }
        _closeProjectEdit={ this._closeProjectEdit.bind(this)}
        _closeProjectReload={ this._closeProjectReload.bind(this)}
        _createHistoryObjectNoDetails={ this._createHistoryObjectNoDetails.bind(this)}
        _processCatch={ this._processCatch.bind(this)}
        projectFields={this.state.projectFields}
        
        // 2 - Source and destination list information
        projectListTitle= { this.props.projectListTitle}
        projectListWeb= { this.props.projectListWeb}

      ></MyProjectPage>;

      return (
        <div className={ styles.trackMyTime7 }>
          { projectPage }
        </div>);


      /***
 *              d88888b d8888b. d888888b d888888b      d888888b d888888b .88b  d88. d88888b      d88888b d8b   db d888888b d8888b. db    db 
 *              88'     88  `8D   `88'   `~~88~~'      `~~88~~'   `88'   88'YbdP`88 88'          88'     888o  88 `~~88~~' 88  `8D `8b  d8' 
 *              88ooooo 88   88    88       88            88       88    88  88  88 88ooooo      88ooooo 88V8o 88    88    88oobY'  `8bd8'  
 *              88~~~~~ 88   88    88       88            88       88    88  88  88 88~~~~~      88~~~~~ 88 V8o88    88    88`8b      88    
 *              88.     88  .8D   .88.      88            88      .88.   88  88  88 88.          88.     88  V888    88    88 `88.    88    
 *              Y88888P Y8888D' Y888888P    YP            YP    Y888888P YP  YP  YP Y88888P      Y88888P VP   V8P    YP    88   YD    YP    
 *                                                                                                                                          
 *                                                                                                                                          
 */

    } else {


      const isSinceEntry = this.state.currentTimePicker === 'sinceLast' ? true : false;   
      const isSliderEntry = this.state.currentTimePicker === 'slider' ? true : false;
      const isManualEntry = this.state.currentTimePicker === 'manual' ? true : false;
  
      let setPivot = !this.state.projectType ? this.state.projectMasterPriorityChoice :this.state.projectUserPriorityChoice ;
      //console.log('render setPivot:', setPivot);
      //console.log('Public render props:', this.props);
      console.log('TRACK MY TIME STATE:', this.state);
  
 

/***
 *     .o88b. db   db d88888b  .o88b. db   dD      d8888b. d888888b .d8888.  .d8b.  d8888b. db      d88888b      .d8888.  .d8b.  db    db d88888b 
 *    d8P  Y8 88   88 88'     d8P  Y8 88 ,8P'      88  `8D   `88'   88'  YP d8' `8b 88  `8D 88      88'          88'  YP d8' `8b 88    88 88'     
 *    8P      88ooo88 88ooooo 8P      88,8P        88   88    88    `8bo.   88ooo88 88oooY' 88      88ooooo      `8bo.   88ooo88 Y8    8P 88ooooo 
 *    8b      88~~~88 88~~~~~ 8b      88`8b        88   88    88      `Y8b. 88~~~88 88~~~b. 88      88~~~~~        `Y8b. 88~~~88 `8b  d8' 88~~~~~ 
 *    Y8b  d8 88   88 88.     Y8b  d8 88 `88.      88  .8D   .88.   db   8D 88   88 88   8D 88booo. 88.          db   8D 88   88  `8bd8'  88.     
 *     `Y88P' YP   YP Y88888P  `Y88P' YP   YD      Y8888D' Y888888P `8888Y' YP   YP Y8888P' Y88888P Y88888P      `8888Y' YP   YP    YP    Y88888P 
 *                                                                                                                                                
 *                                                                                                                                                
 */

      const stackButtonTokensBody: IStackTokens = { childrenGap: 40 };
      const stackButtonTokens: IStackTokens = { childrenGap: 40 };
      const stackFormRowTokens: IStackTokens = { childrenGap: 20 };
      const stackFormRowsTokens: IStackTokens = { childrenGap: 10 };
      const stackManualDateTokens: IStackTokens = { childrenGap: 20 };
      const stackChartTokens: IStackTokens = { childrenGap: 30 };
  
      let hoursSinceLastTime = 0;
      if ( this.state.timeTrackerLoadStatus === "Complete" ) {
        hoursSinceLastTime = getTimeDelta( this.state.lastEndTime.theTime, new Date() , 'hours');
      }
  
      let isSaveDisabledTime = false;
      let isSaveDisabledFields = false;
      let isSaveButtonDisabled = false;
      let isEndBeforeStart = false;
      
      let deltaTime = this.state.formEntry == null ? null : getTimeDelta(this.state.formEntry.startTime,this.state.formEntry.endTime,'hours');
      let allowedHours = this.props.timeSliderMax/60;
  
      if ( this.state.currentTimePicker === 'slider' ) {
        if ( this.state.timeSliderValue == 0 ) { isSaveDisabledTime = true; isSaveDisabledFields = true; isSaveButtonDisabled = true; }
        if ( getTimeDelta(this.state.formEntry.endTime, this.state.formEntry.startTime, 'ms') > 0 ) { isEndBeforeStart = true; isSaveButtonDisabled = true; }
        // Also need to add if the slider would put the start time before the last end time.
      } else if ( this.state.currentTimePicker === 'sinceLast' ) {
        if ( hoursSinceLastTime > this.props.timeSliderMax / 60 ) { isSaveDisabledTime = true; isSaveDisabledFields = true; isSaveButtonDisabled = true; }
  
      } else if ( this.state.currentTimePicker === 'manual' ) {
        if ( deltaTime < 0 ) { isEndBeforeStart = true; isSaveButtonDisabled = true; }
      }
  
      if ( isSaveButtonDisabled === false ) {
        if ( this.state.fields.ProjectID1.required ) {
          if ( this.state.formEntry.projectID1.value === "*" || this.state.formEntry.projectID1.value == null  || this.state.formEntry.projectID1.value.replace(' ','') == '' ) {
            isSaveButtonDisabled = true;
          }
        }
        if ( this.state.fields.ProjectID2.required ) {
          if ( this.state.formEntry.projectID2.value === "*" || this.state.formEntry.projectID2.value == null  || this.state.formEntry.projectID1.value.replace(' ','') == ''  ) {
            isSaveButtonDisabled = true;
          }
        }
        if ( this.state.fields.Category1.required ) {
          if ( this.state.formEntry.category1 === ["*"] || this.state.formEntry.category1 == null  || this.state.formEntry.category1[0].replace(' ','') == ''  ) {
            isSaveButtonDisabled = true;
          }
        }
        if ( this.state.fields.Category2.required ) {
          if ( this.state.formEntry.category2=== ["*"] || this.state.formEntry.projectID2 == null  || this.state.formEntry.category2[0].replace(' ','') == ''  ) {
            isSaveButtonDisabled = true;
          }
        }
      }
  
  
      let entryOptions = choiceBuilders.creatEntryTypeChoices(this.state.currentTimePicker, this._updateEntryType.bind(this));

/***
 *     d888b  d88888b d888888b      .d8888. d888888b  .d8b.  d8888b. d888888b      d888888b d888888b .88b  d88. d88888b 
 *    88' Y8b 88'     `~~88~~'      88'  YP `~~88~~' d8' `8b 88  `8D `~~88~~'      `~~88~~'   `88'   88'YbdP`88 88'     
 *    88      88ooooo    88         `8bo.      88    88ooo88 88oobY'    88            88       88    88  88  88 88ooooo 
 *    88  ooo 88~~~~~    88           `Y8b.    88    88~~~88 88`8b      88            88       88    88  88  88 88~~~~~ 
 *    88. ~8~ 88.        88         db   8D    88    88   88 88 `88.    88            88      .88.   88  88  88 88.     
 *     Y888P  Y88888P    YP         `8888Y'    YP    YP   YP 88   YD    YP            YP    Y888888P YP  YP  YP Y88888P 
 *                                                                                                                      
 *                                                                                                                      
 */

      let theTime;
  
      //How to set personal time settings
      //https://sharepointmaven.com/sharepoint-time-zone/
  
      if (this.state.timeTrackerLoadStatus === "Complete") {
        if (this.state.currentTimePicker === 'sinceLast') {
  
          theTime = <div className={( isSaveDisabledTime ? styles.timeError : styles.timeInPast )}>
            From: { getDayTimeToMinutes(this.state.lastEndTime.theTime) } until NOW<br/>
            {( isSaveDisabledTime ? <div>Is to far in the past.</div> : "" )}
            {( isSaveDisabledTime ? <div>Use Slider or Manual Mode to save time.</div> : "" )}
            </div>; 
  
        } else if  (this.state.currentTimePicker === 'slider' ) {
          if ( isEndBeforeStart ) {
            theTime = <div className={( styles.timeError )}>
              Adjust the slider before saving.
            </div>;
          } else if (this.state.timeSliderValue > 0 ) {
              //The START time IS NOW and the end time is in the future (based on slider)
              theTime = <div className={ styles.timeInFuture }>From NOW until: { getDayTimeToMinutes(this.state.formEntry.endTime) }</div>;
          } else if ( this.state.timeSliderValue < 0 )  {
            //The END time IS NOW and the end time is in the past (based on slider)
            theTime = <div className={ styles.timeInPast }>From { getDayTimeToMinutes(this.state.formEntry.startTime) } until NOW</div>;
          } else { // Value can not be zero or the save button should not be visible.
            theTime = <div className={ styles.timeError }>Adjust the slider before saving</div>;
          }
  
        } else if ( this.state.currentTimePicker === 'start' ) {
          theTime = <div>Creates zero minutes entry to start your day</div>;
  
        } else if ( this.state.currentTimePicker === 'manual' ) {
  
          if ( deltaTime != null ) {
            if ( deltaTime < 0 ) {
              theTime = <div className={( styles.timeError )}>
                End Time is BEFORE Start Time, please fix before saving.
                </div>; 
    
            } else if (deltaTime > allowedHours ) {
              theTime = <div className={( styles.timeError )}>
                Exceeded max allowed timespan of { allowedHours } hours.
                </div>; 
            }
          }
        }
  
      } else { theTime = ""; }
  
/***
 *    d8888b. d8888b.  .d88b.     d88b      db   d8b   db d88888b d8888b.      d88888b d8888b. d8888b. 
 *    88  `8D 88  `8D .8P  Y8.    `8P'      88   I8I   88 88'     88  `8D      88'     88  `8D 88  `8D 
 *    88oodD' 88oobY' 88    88     88       88   I8I   88 88ooooo 88oooY'      88ooooo 88oobY' 88oobY' 
 *    88~~~   88`8b   88    88     88       Y8   I8I   88 88~~~~~ 88~~~b.      88~~~~~ 88`8b   88`8b   
 *    88      88 `88. `8b  d8' db. 88       `8b d8'8b d8' 88.     88   8D      88.     88 `88. 88 `88. 
 *    88      88   YD  `Y88P'  Y8888P        `8b8' `8d8'  Y88888P Y8888P'      Y88888P 88   YD 88   YD 
 *                                                                                                     
 *                                                                                                     
 */

      const projectsWebError = this.props.projectListWeb.indexOf(this.props.tenant) > -1 ? '' :
      <div>
          <p>Your Project List is not in this Tenanat...</p>
          <ul>
            <li>{ this.props.projectListWeb } &lt;&lt;== Project Web</li>
            <li>{ this.props.tenant } &lt;&lt;== Should have this in it</li>
          </ul>
      </div>;
  
/***
 *    d888888b d888888b .88b  d88. d88888b      db   d8b   db d88888b d8888b.      d88888b d8888b. d8888b. 
 *    `~~88~~'   `88'   88'YbdP`88 88'          88   I8I   88 88'     88  `8D      88'     88  `8D 88  `8D 
 *       88       88    88  88  88 88ooooo      88   I8I   88 88ooooo 88oooY'      88ooooo 88oobY' 88oobY' 
 *       88       88    88  88  88 88~~~~~      Y8   I8I   88 88~~~~~ 88~~~b.      88~~~~~ 88`8b   88`8b   
 *       88      .88.   88  88  88 88.          `8b d8'8b d8' 88.     88   8D      88.     88 `88. 88 `88. 
 *       YP    Y888888P YP  YP  YP Y88888P       `8b8' `8d8'  Y88888P Y8888P'      Y88888P 88   YD 88   YD 
 *                                                                                                         
 *                                                                                                         
 */

      const timeWebError = this.props.timeTrackListWeb.indexOf(this.props.tenant) > -1 ? '' :
      <div>
          <p>Your TimeTrack List is not in this Tenanat...</p>
          <ul>
            <li>{ this.props.timeTrackListWeb } &lt;&lt;== TrackTime List Web</li>
            <li>{ this.props.tenant } &lt;&lt;== Should have this in it</li>
          </ul>
      </div>;
  
/***
 *    d8888b. d8888b.  .d88b.     d88b      db      d888888b .d8888. d888888b      d88888b d8888b. d8888b. 
 *    88  `8D 88  `8D .8P  Y8.    `8P'      88        `88'   88'  YP `~~88~~'      88'     88  `8D 88  `8D 
 *    88oodD' 88oobY' 88    88     88       88         88    `8bo.      88         88ooooo 88oobY' 88oobY' 
 *    88~~~   88`8b   88    88     88       88         88      `Y8b.    88         88~~~~~ 88`8b   88`8b   
 *    88      88 `88. `8b  d8' db. 88       88booo.   .88.   db   8D    88         88.     88 `88. 88 `88. 
 *    88      88   YD  `Y88P'  Y8888P       Y88888P Y888888P `8888Y'    YP         Y88888P 88   YD 88   YD 
 *                                                                                                         
 *                                                                                                         
 */
      const projectsListError = this.state.projects.master.length !== 0 ? '' :
        <div>
          <ul>
            <li>Is this the right Projects List URL? <b>{ this.props.projectListWeb }</b></li>
            <li>Is this the right Projects List Title? <b>{ this.props.projectListTitle }</b></li>
            <li>
              <a href={this.state.projectListURL} target='_blank'>
                <span>Check your Project list here</span>
              </a>
            </li>
          </ul>
        </div>;
  

/***
 *    d888888b d888888b .88b  d88. d88888b      db      d888888b .d8888. d888888b      d88888b d8888b. d8888b. 
 *    `~~88~~'   `88'   88'YbdP`88 88'          88        `88'   88'  YP `~~88~~'      88'     88  `8D 88  `8D 
 *       88       88    88  88  88 88ooooo      88         88    `8bo.      88         88ooooo 88oobY' 88oobY' 
 *       88       88    88  88  88 88~~~~~      88         88      `Y8b.    88         88~~~~~ 88`8b   88`8b   
 *       88      .88.   88  88  88 88.          88booo.   .88.   db   8D    88         88.     88 `88. 88 `88. 
 *       YP    Y888888P YP  YP  YP Y88888P      Y88888P Y888888P `8888Y'    YP         Y88888P 88   YD 88   YD 
 *                                                                                                             
 *                                                                                                             
 */
      const timeListError = this.state.projects.user.length !== 0 ? '' :
      <div>
        <ul>
          <li>Is this the right TrackYourTime List URL? <b>{ this.props.timeTrackListWeb }</b></li>
          <li>Is this the right TrackYourTime List Title? <b>{ this.props.timeTrackListTitle }</b></li>
          <li>
            <a href={this.state.timeTrackerListURL} target='_blank'>
              <span>Check your TrackTime list here</span>
            </a>
          </li>
        </ul>
      </div>;
  
/***
 *    db      d888888b .d8888. d888888b      d88888b d8888b. d8888b. 
 *    88        `88'   88'  YP `~~88~~'      88'     88  `8D 88  `8D 
 *    88         88    `8bo.      88         88ooooo 88oobY' 88oobY' 
 *    88         88      `Y8b.    88         88~~~~~ 88`8b   88`8b   
 *    88booo.   .88.   db   8D    88         88.     88 `88. 88 `88. 
 *    Y88888P Y888888P `8888Y'    YP         Y88888P 88   YD 88   YD 
 *                                                                   
 *                                                                   
 */
      const listError = this.state.listError === false ? '' :
        <div style={{ paddingTop: '0px' }}>
          <h2>{ this.state.errTitle }</h2>
          <h3>Here are the error(s) we received</h3>
          <p><mark>{ this.state.loadError }</mark></p>
          <h3>Here are some suggestions</h3>
            {projectsWebError} 
            {projectsListError}
            {timeWebError}
            {timeListError}
  
        </div>;
      
/***
 *    d8b   db  .d88b.       d8888b. d8888b.  .d88b.     d88b      d88888b  .d88b.  db    db d8b   db d8888b. 
 *    888o  88 .8P  Y8.      88  `8D 88  `8D .8P  Y8.    `8P'      88'     .8P  Y8. 88    88 888o  88 88  `8D 
 *    88V8o 88 88    88      88oodD' 88oobY' 88    88     88       88ooo   88    88 88    88 88V8o 88 88   88 
 *    88 V8o88 88    88      88~~~   88`8b   88    88     88       88~~~   88    88 88    88 88 V8o88 88   88 
 *    88  V888 `8b  d8'      88      88 `88. `8b  d8' db. 88       88      `8b  d8' 88b  d88 88  V888 88  .8D 
 *    VP   V8P  `Y88P'       88      88   YD  `Y88P'  Y8888P       YP       `Y88P'  ~Y8888P' VP   V8P Y8888D' 
 *                                                                                                            
 *                                                                                                            
 */

      const noProjectsFound = this.state.projectType !== false && this.state.projectsLoadStatus === 'Complete' ? '' :
      <div style={{ paddingTop: '0px' }}>
        <h2>No Projects found in "{this.state.filteredCategory}" :(</h2>
        <h3>Get started by checking for other projects</h3>
        <ul>
        <li>Click on the other Project Categories like</li>
          <ol>
            <li>{this.state.pivots.heading1[0].headerText}</li>
            <li>{this.state.pivots.heading1[1].headerText}</li>
            <li>{this.state.pivots.heading1[2].headerText}</li>
            <li>{this.state.pivots.heading1[3].headerText}</li>
          </ol>
        </ul>
        <h3>Can't find any? Create a new one!</h3>
        <ol>
          <li>
            <a href={this.state.projectListURL} >
              <span>Go to your list: { this.props.projectListTitle }</span>
            </a>
          </li>
          <li>Create some new projects</li>
          <li>Make yourself the Leader for easy access</li>
          <li>Mark generic ones 'Everyone' so they are easy to find</li>
        </ol>
      </div>;
  
/***
 *    .d8888.  .d8b.  db    db d88888b      d8888b. db    db d888888b d888888b  .d88b.  d8b   db .d8888. 
 *    88'  YP d8' `8b 88    88 88'          88  `8D 88    88 `~~88~~' `~~88~~' .8P  Y8. 888o  88 88'  YP 
 *    `8bo.   88ooo88 Y8    8P 88ooooo      88oooY' 88    88    88       88    88    88 88V8o 88 `8bo.   
 *      `Y8b. 88~~~88 `8b  d8' 88~~~~~      88~~~b. 88    88    88       88    88    88 88 V8o88   `Y8b. 
 *    db   8D 88   88  `8bd8'  88.          88   8D 88b  d88    88       88    `8b  d8' 88  V888 db   8D 
 *    `8888Y' YP   YP    YP    Y88888P      Y8888P' ~Y8888P'    YP       YP     `Y88P'  VP   V8P `8888Y' 
 *                                                                                                       
 *                                                                                                       
 */

      const buttons: ISingleButtonProps[] =
        [/*
          {
          disabled: isSaveDisabled,  
          checked: true, 
          primary: true,
          label: "Start Time",
          secondary: "Create start ime",
          buttonOnClick: this.startMyTime.bind(this),
        },*/
  {
          disabled: false,  
          checked: true, 
          primary: false,
          label: "Clear item",
          secondary: "Press to clear form",
          buttonOnClick: this.clearMyInput.bind(this),
        },      {
          disabled: isSaveButtonDisabled,  
          checked: true, 
          primary: true,
          label: "Save item",
          secondary: "Press to Create entry",
          buttonOnClick: this.trackMyTime.bind(this),
        },
  
        ];
  
      let saveButtons = 
      <div style={{ paddingTop: '20px' }}>
        <ButtonCompound
          buttons={buttons} horizontal={true}
        />
      </div>;
       
      let timeSlider = isSliderEntry ? sliderBuilders.createSlider(this.props,this.state, this._updateTimeSlider.bind(this)) : '';
      let comments = formBuilders.createThisField(this.props,this.state, this.state.fields.Comments, isSaveDisabledFields, this._updateComments.bind(this));
      let projectTitle = formBuilders.createThisField(this.props,this.state,this.state.fields.Title, isSaveDisabledFields,  this._updateProjectTitle.bind(this));
      let projectID1 = formBuilders.createThisField(this.props,this.state, this.state.fields.ProjectID1, isSaveDisabledFields,  this._updateProjectID1.bind(this));
      let projectID2 = formBuilders.createThisField(this.props,this.state, this.state.fields.ProjectID2, isSaveDisabledFields,  this._updateProjectID2.bind(this));
  
      let showActivity = true;
      if (this.state.selectedProjectIndex != null) {
        if (this.state.projects.newFiltered.length > 0){
          if (this.state.projects.newFiltered[this.state.selectedProjectIndex]){
            if (this.state.projects.newFiltered[this.state.selectedProjectIndex].projOptions) {
              if (this.state.projects.newFiltered[this.state.selectedProjectIndex].projOptions.showLink) {
                showActivity = false;
              }
            }
          }
        }
      }
  
      let activity =  !showActivity ? null : formBuilders.createThisField(this.props,this.state, this.state.fields.Activity, isSaveDisabledFields,  this._updateActivity.bind(this));
  
      //let activity = ( this.state.projects.newFiltered[this.state.selectedProjectIndex].projActivity.showLink === true ) ? null :
        //formBuilders.createThisField(this.props,this.state, this.state.fields.Activity, isSaveDisabledFields,  this._updateActivity.bind(this));
  

/***
 *    d8888b. d8888b.  .d88b.     d88b d88888b  .o88b. d888888b      db      d888888b .d8888. d888888b 
 *    88  `8D 88  `8D .8P  Y8.    `8P' 88'     d8P  Y8 `~~88~~'      88        `88'   88'  YP `~~88~~' 
 *    88oodD' 88oobY' 88    88     88  88ooooo 8P         88         88         88    `8bo.      88    
 *    88~~~   88`8b   88    88     88  88~~~~~ 8b         88         88         88      `Y8b.    88    
 *    88      88 `88. `8b  d8' db. 88  88.     Y8b  d8    88         88booo.   .88.   db   8D    88    
 *    88      88   YD  `Y88P'  Y8888P  Y88888P  `Y88P'    YP         Y88888P Y888888P `8888Y'    YP    
 *                                                                                                     
 *                                                                                                     
 */

      //let entryType = formBuilders.createThisField(this.props,this.state, this.state.fields., this._updateEntryType.bind(this));
      

      let testUpdate = '' + this.state.filteredCategory + this.state.selectedProjectIndex;
      let hasProject = false;
      
      console.log('MYCOMMANDBAR Testing: selectedProjectIndex', this.state.selectedProjectIndex );
      console.log('MYCOMMANDBAR Testing: selectedProject', this.state.selectedProject );

      if ( this.state.selectedProjectIndex !== null && this.state.selectedProjectIndex !== undefined ) { 
        if ( this.state.selectedProjectIndex > -1 ) { 
          hasProject = true ; 
          let titleProject = this.state.selectedProject ? this.state.selectedProject.titleProject : 'null';
          testUpdate += titleProject ;
        }
      }

      /**
       * Do inline project list view here
       * this.state.projectType = false then this is a project list based
       *    else it's based on Time
       */

      let listProjects = null;
      if (this.state.listError) { listProjects = listError; }
      else if ( this.state.projectsLoadStatus === 'Complete' && this.state.projects.newFiltered.length===0 ) {
        listProjects =  noProjectsFound;
      } else if ( this.state.projectsLoadStatus === 'Loading' || this.state.projectsLoadStatus === 'Pending' ) {
        listProjects =  <Spinner 
          size={SpinnerSize.medium}
          label={ this.state.projectsLoadStatus + ' Projects' }
          labelPosition='left'
        ></Spinner>;
      } else {

        listProjects = //<div className={ this.state.debugColors ? styles.projectListView : '' } >
            <ListView
              items={ this.state.projects.newFiltered }
              viewFields={ [ fields.projectWide2 ] }
              compact={true}
              selectionMode={SelectionMode.single}
              selection={ this._getSelectedProject.bind(this) }
              showFilter={false}
              filterPlaceHolder="Search..."
              //defaultSelection={ this.state.selectedProjectIndex ? [this.state.selectedProjectIndex] : [] }
              defaultSelection={ this.state.selectedProjectIndexArr }
            />
          //</div>;
          /*     
          listProjects = listBuilders.projectBuilder(this.props,this.state,this.state.projects.newFiltered, this._getSelectedProject.bind(this));
          */
        }
  
      let listBuild = listBuilders.listViewBuilder(this.props,this.state,this.state.entries.newFiltered);
  
      let userName = this.state.currentUser
        ? getNicks(this.state.currentUser) + " ( Id: " + this.state.currentUser.Id + " ) entry count: " + this.state.allEntries.length
        : "";
  
/***
 *    d888888b d8b   db d88888b  .d88b.       d8888b.  .d8b.   d888b  d88888b 
 *      `88'   888o  88 88'     .8P  Y8.      88  `8D d8' `8b 88' Y8b 88'     
 *       88    88V8o 88 88ooo   88    88      88oodD' 88ooo88 88      88ooooo 
 *       88    88 V8o88 88~~~   88    88      88~~~   88~~~88 88  ooo 88~~~~~ 
 *      .88.   88  V888 88      `8b  d8'      88      88   88 88. ~8~ 88.     
 *    Y888888P VP   V8P YP       `Y88P'       88      YP   YP  Y888P  Y88888P 
 *                                                                            
 *                                                                            
 */
      const infoPage = <div>
        <InfoPage 
            allLoaded={ this.state.allLoaded }
            showInfo={ this.state.showTips }
            parentProps= { this.props }
            parentState= { this.state }
            toggleDebug = { this.toggleDebug.bind(this) }
        ></InfoPage>
      </div>;
  
  /***
 *     .o88b. db   db  .d8b.  d8888b. d888888b .d8888. 
 *    d8P  Y8 88   88 d8' `8b 88  `8D `~~88~~' 88'  YP 
 *    8P      88ooo88 88ooo88 88oobY'    88    `8bo.   
 *    8b      88~~~88 88~~~88 88`8b      88      `Y8b. 
 *    Y8b  d8 88   88 88   88 88 `88.    88    db   8D 
 *     `Y88P' YP   YP YP   YP 88   YD    YP    `8888Y' 
 *                                                     
 *                                                     
 */

      let loadCharts = this.state.allLoaded && this.state.showCharts ? true : false;
      const chartPage = !loadCharts ? null : <div>
        <ChartsPage 
          allLoaded={ this.state.allLoaded }
          showCharts={ this.state.showCharts }
          entries= { this.state.entries }
          entryCount={ this.state.allEntries.length }
          defaultStory="None"
          today={ this.props.today }
          selectedStory = { this.state.selectedStory }
          selectedUser = { this.state.selectedUser }
          chartStringFilter = { this.state.chartStringFilter }
          _updateStory={ this._updateStory.bind(this) }
          _updateUserFilter={ this._updateUserFilter.bind(this) }
          _updateChartFilter={ this._updateChartFilter.bind(this) }
          _getMoreItems={ this._getMoreItems.bind(this) }
          WebpartHeight={ this.state.WebpartHeight }
          WebpartWidth={ this.state.WebpartWidth }
          parentState= { this.state }
        ></ChartsPage>
      </div>;
  
      let toggleChartsButton = createIconButton('BarChartVerticalFill','Toggle Charts',this.toggleCharts.bind(this), null, null, false );
      let toggleTipsButton = createIconButton('Help','Toggle Tips',this.toggleTips.bind(this), null, null, false );
  
      
    
/***
 *     .o88b. d88888b d8b   db d888888b d88888b d8888b.      d8888b.  .d8b.  d8b   db d88888b 
 *    d8P  Y8 88'     888o  88 `~~88~~' 88'     88  `8D      88  `8D d8' `8b 888o  88 88'     
 *    8P      88ooooo 88V8o 88    88    88ooooo 88oobY'      88oodD' 88ooo88 88V8o 88 88ooooo 
 *    8b      88~~~~~ 88 V8o88    88    88~~~~~ 88`8b        88~~~   88~~~88 88 V8o88 88~~~~~ 
 *    Y8b  d8 88.     88  V888    88    88.     88 `88.      88      88   88 88  V888 88.     
 *     `Y88P' Y88888P VP   V8P    YP    Y88888P 88   YD      88      YP   YP VP   V8P Y88888P 
 *                                                                                            
 *                                                                                            
 */

      let centerPane = <CenterPane 
          allLoaded={ true } 
          projectIndex={ this.state.selectedProjectIndex }
          showCenter={ true }
          parentProps= { this.props }
          parentState= { this.state }
          _onActivityClick={ this._onActivityClick.bind(this) }
      ></CenterPane>;
  
/***
 *    d8888b. d8888b.  .d88b.     d88b       .o88b.  .d88b.  .88b  d88. .88b  d88.  .d8b.  d8b   db d8888b.      d8888b.  .d8b.  d8888b. 
 *    88  `8D 88  `8D .8P  Y8.    `8P'      d8P  Y8 .8P  Y8. 88'YbdP`88 88'YbdP`88 d8' `8b 888o  88 88  `8D      88  `8D d8' `8b 88  `8D 
 *    88oodD' 88oobY' 88    88     88       8P      88    88 88  88  88 88  88  88 88ooo88 88V8o 88 88   88      88oooY' 88ooo88 88oobY' 
 *    88~~~   88`8b   88    88     88       8b      88    88 88  88  88 88  88  88 88~~~88 88 V8o88 88   88      88~~~b. 88~~~88 88`8b   
 *    88      88 `88. `8b  d8' db. 88       Y8b  d8 `8b  d8' 88  88  88 88  88  88 88   88 88  V888 88  .8D      88   8D 88   88 88 `88. 
 *    88      88   YD  `Y88P'  Y8888P        `Y88P'  `Y88P'  YP  YP  YP YP  YP  YP YP   YP VP   V8P Y8888D'      Y8888P' YP   YP 88   YD 
 *                                                                                                                                       
 *                                                                                                                                       
 */

      console.log('MYCOMMANDBAR Testing: testUpdate', testUpdate );
      console.log('MYCOMMANDBAR Testing: hasProject', hasProject );

      const projCommands = this.state.allLoaded === true ? <div>
        <MyCommandBar
          testUpdate= { '' }
          hasProject={ true }
          newProject={ this._newProject.bind(this) }
          editProject={ this._editProject.bind(this) }
          copyProject={ this._copyProject.bind(this) }
          parkProject={ this._parkProjectDialog.bind(this) }
          cancelProject={ this._cancelProjectDialog.bind(this) }
          completeProject={ this._completeProjectDialog.bind(this) }

          reviewProject={ this._reviewProjectDialog.bind(this) }
          planProject={ this._planProjectDialog.bind(this) }
          processProject={ this._processProjectDialog.bind(this) }

        ></MyCommandBar>
      </div> : <div></div>;

      const projCommandsNewOnly = this.state.allLoaded === true ? <div>
        <MyCommandBar
          testUpdate= { '' }
          hasProject={ false }
          newProject={ this._newProject.bind(this) }
          editProject={ this._editProject.bind(this) }
          copyProject={ this._copyProject.bind(this) }
          parkProject={ this._parkProjectDialog.bind(this) }
          cancelProject={ this._cancelProjectDialog.bind(this) }
          completeProject={ this._completeProjectDialog.bind(this) }

          reviewProject={ this._reviewProjectDialog.bind(this) }
          planProject={ this._planProjectDialog.bind(this) }
          processProject={ this._processProjectDialog.bind(this) }

        ></MyCommandBar>
      </div> : <div></div>;

      let makeDialog = null;
      if ( this.state.dialogMode === TMTDialogMode.False ) {
      } else if ( this.state.dialogMode === TMTDialogMode.Review ) {
        makeDialog = createDialog( projActions.review.prompt,  projActions.review.subText, 'Yes', 'No', true, this._reviewProject, this._closeDialog );

      } else if ( this.state.dialogMode === TMTDialogMode.Plan ) {
        makeDialog = createDialog( projActions.plan.prompt,  projActions.plan.subText, 'Yes', 'No', true, this._planProject, this._closeDialog );

      } else if ( this.state.dialogMode === TMTDialogMode.Process ) {
        makeDialog = createDialog( projActions.process.prompt,  projActions.process.subText, 'Yes', 'No', true, this._processProject, this._closeDialog );

      } else if ( this.state.dialogMode === TMTDialogMode.Park ) {
        makeDialog = createDialog( projActions.park.prompt,  projActions.park.subText, 'Yes', 'No', true, this._parkProject, this._closeDialog );

      } else if ( this.state.dialogMode === TMTDialogMode.Complete ) {
        makeDialog = createDialog( projActions.complete.prompt, projActions.complete.subText, 'Yes', 'No', true, this._completeProject, this._closeDialog );

      } else if ( this.state.dialogMode === TMTDialogMode.Cancel ) {
        makeDialog = createDialog( projActions.cancel.prompt,  projActions.cancel.subText, 'Yes', 'No', true, this._cancelProject, this._closeDialog );

      } 

/***
 *    d88888b  .d8b.  d8888b. db      db    db       .d8b.   .o88b.  .o88b. d88888b .d8888. .d8888. 
 *    88'     d8' `8b 88  `8D 88      `8b  d8'      d8' `8b d8P  Y8 d8P  Y8 88'     88'  YP 88'  YP 
 *    88ooooo 88ooo88 88oobY' 88       `8bd8'       88ooo88 8P      8P      88ooooo `8bo.   `8bo.   
 *    88~~~~~ 88~~~88 88`8b   88         88         88~~~88 8b      8b      88~~~~~   `Y8b.   `Y8b. 
 *    88.     88   88 88 `88. 88booo.    88         88   88 Y8b  d8 Y8b  d8 88.     db   8D db   8D 
 *    Y88888P YP   YP 88   YD Y88888P    YP         YP   YP  `Y88P'  `Y88P' Y88888P `8888Y' `8888Y' 
 *                                                                                                  
 *                                                                                                  
 */

      let earlyAccess = 
      <div style={{ paddingBottom: 10 }}>
        <EarlyAccess 
            image = { "https://autoliv.sharepoint.com/sites/crs/PublishingImages/Early%20Access%20Image.png" }
            messages = { [ <div><span><b>Welcome to ALV Webpart Early Access!!!</b></span></div>, "Get more info here -->"] }
            links = { [ links.gitRepoTrackMyTime.wiki, links.gitRepoTrackMyTime.issues ]}
            email = { 'mailto:General - WebPart Dev <0313a49d.Autoliv.onmicrosoft.com@amer.teams.ms>?subject=Track My Time Webpart Feedback&body=Enter your message here :)  \nScreenshots help!' }
            farRightIcons = { [ ] }
        ></EarlyAccess>
      </div>
      ;
      const newProjCommands = null;

      let devHeader = null;// this.state.showDevHeader === true ? <div><b>Props: </b> { this.props.lastPropChange + ', ' + this.props.lastPropDetailChange } - <b>State: lastStateChange: </b> { this.state.lastStateChange  } </div> : null ;

  /***
   *                   d8888b. d88888b d888888b db    db d8888b. d8b   db 
   *                   88  `8D 88'     `~~88~~' 88    88 88  `8D 888o  88 
   *                   88oobY' 88ooooo    88    88    88 88oobY' 88V8o 88 
   *                   88`8b   88~~~~~    88    88    88 88`8b   88 V8o88 
   *                   88 `88. 88.        88    88b  d88 88 `88. 88  V888 
   *                   88   YD Y88888P    YP    ~Y8888P' 88   YD VP   V8P 
   *                                                                      
   *                                                                      
   */
  
      let greeting = this.state.WebpartWidth < 800 ? null : <div><span style={{fontSize: 20, paddingRight: 30,}}>{ getGreeting(this.state.currentUser)}</span></div>;
    
      let startDate = isManualEntry ? dateBuilders.creatDateTimeControled(this.props,this.state,this.state.fields.Start, false, this._updateStart.bind(this)) : '';
      let endDate = isManualEntry ? dateBuilders.creatDateTimeControled(this.props,this.state,this.state.fields.End, false, this._updateEnd.bind(this)) : '';
  
      /**
       * this section was added to keep pivots in sync when syncProjectPivotsOnToggle === true
      */
      let display1 = this.state.projectType === true ? "block" :"none";
      let display2 = this.state.projectType === true ? "none" :"block";
      let choice1 = this.state.projectMasterPriorityChoice;
      let choice2 = this.state.projectUserPriorityChoice;
  
      if (this.state.syncProjectPivotsOnToggle){
        display1 = "block";
        display2 = "none";
        choice1 = this.state.projectMasterPriorityChoice;
        choice2 = this.state.projectMasterPriorityChoice;
      }

      return (
        <div className={ styles.trackMyTime7 }>
          <div className={ styles.container }>
          { devHeader }
          { earlyAccess }
          <div className={styles.floatLeft}>
  
              { this.createPivotObject(choice2, display2)  }
              { this.createPivotObject(choice1, display1)  }
  
              { /*this.createPivotObject(setPivot, "block") */ }
              { greeting }
              { this.createProjectTypeToggle(this.state) }
              { toggleChartsButton }
              { toggleTipsButton }
             
          </div>
          <div className={( this.state.showTips ? '' : styles.hideMe )}>
            { infoPage }
          </div>
  
          <div className={( this.state.showCharts ? '' : styles.hideMe )}>
  
            { chartPage }
  
          </div>
            <div>
  
              <Stack padding={20} horizontal={true} horizontalAlign={"space-between"} tokens={stackButtonTokensBody}> {/* Stack for Projects and body */}
                { /* this.createProjectChoices(this.state) */ }
                <Stack horizontal={false} horizontalAlign={"start"} tokens={stackFormRowsTokens}>{/* Stack for Pivot Help and Projects */}
                  { this.getPivotHelpText(this.state, this.props)}
                  { hasProject === true ? projCommands : projCommandsNewOnly }
                  { listProjects }
                </Stack>  {/* Stack for Pivot Help and Projects */}
                { centerPane }
                <Stack horizontal={false} horizontalAlign={"end"} tokens={stackFormRowsTokens}>{/* Stack for Buttons and Fields */}
                  { entryOptions }
                  { (timeSlider) }
                  <Stack horizontal={true} wrap={true} horizontalAlign={"end"} tokens={stackManualDateTokens}>{/* Stack for Buttons and Fields */}
                  { startDate }
                  { endDate }
                  </Stack>  {/* Stack for Buttons and Fields */}
                  { theTime }
                  { projectTitle }
                  { activity }
                  { comments }
                  { /* entryType */ }
                  <Stack horizontal={true} tokens={stackFormRowTokens}>{ projectID1 }{ projectID2 }</Stack>
  
                  { saveButtons }
  
                </Stack>  {/* Stack for Buttons and Fields */}
  
              </Stack> {/* Stack for Projects and body */}
              { makeDialog }
            </div>
  
            <div></div><div><br/><br/></div>
            <div style={{ paddingLeft: '20px', paddingRight: '20px' }}>
              <div><h2>Recent TrackYourTime History { userName }</h2></div>
              {(listBuild)}
              { /* this.createHistoryItems(this.state) */ }
            </div>
  
  
          </div>
        </div>
      );



    }

  }

/***
 *    d8888b. d8888b.  .d88b.     d88b       .o88b.  .d88b.  .88b  d88. .88b  d88.  .d8b.  d8b   db d8888b. .d8888. 
 *    88  `8D 88  `8D .8P  Y8.    `8P'      d8P  Y8 .8P  Y8. 88'YbdP`88 88'YbdP`88 d8' `8b 888o  88 88  `8D 88'  YP 
 *    88oodD' 88oobY' 88    88     88       8P      88    88 88  88  88 88  88  88 88ooo88 88V8o 88 88   88 `8bo.   
 *    88~~~   88`8b   88    88     88       8b      88    88 88  88  88 88  88  88 88~~~88 88 V8o88 88   88   `Y8b. 
 *    88      88 `88. `8b  d8' db. 88       Y8b  d8 `8b  d8' 88  88  88 88  88  88 88   88 88  V888 88  .8D db   8D 
 *    88      88   YD  `Y88P'  Y8888P        `Y88P'  `Y88P'  YP  YP  YP YP  YP  YP YP   YP VP   V8P Y8888D' `8888Y' 
 *                                                                                                                  
 *                                                                                                                  
 */

  private _newProject(){   this.setState({  showProjectScreen: ProjectMode.New,   }); }
  private _editProject(){   this.setState({  showProjectScreen: ProjectMode.Edit,   }); }
  private _copyProject(){   this.setState({  showProjectScreen: ProjectMode.Copy,  }); }

  private _closeProjectEdit(){   this.setState({  showProjectScreen: ProjectMode.False,    }); }
  private _closeProjectReload(){   this._getListItems(); }
  private _closeDialog(){  this.setState({   dialogMode: TMTDialogMode.False    });  }
    
  private _reviewProjectDialog(){  this.setState({  dialogMode: TMTDialogMode.Review     });  }
  private _planProjectDialog(){  this.setState({  dialogMode: TMTDialogMode.Plan     });  }
  private _processProjectDialog(){  this.setState({  dialogMode: TMTDialogMode.Process     });  }

  private _parkProjectDialog(){  this.setState({   dialogMode: TMTDialogMode.Park     });  }
  private _cancelProjectDialog(){  this.setState({   dialogMode: TMTDialogMode.Cancel    });  }
  private _completeProjectDialog(){  this.setState({   dialogMode: TMTDialogMode.Complete    });  }

  private _reviewProject(){    this._updateProject(projActions.review);  }
  private _planProject(){    this._updateProject(projActions.plan);  }
  private _processProject(){    this._updateProject(projActions.process);  }

  private _parkProject(){    this._updateProject(projActions.park);  }
  private _cancelProject(){    this._updateProject(projActions.cancel);  }
  private _completeProject(){    this._updateProject(projActions.complete);  }

  private _updateProject(action: IProjectAction ){
    let today: any = new Date().toISOString();
    let history: string = this._createHistory(this.state.selectedProject.history, action);
    let user: any = action.setUser === true ? this.state.currentUser.id : null;
    let saveItem = { StatusTMT: action.status, CompletedByTMTId: user , CompletedDateTMT : action.setDate ? today : null, HistoryTMT: history };
    this.updateProjectListItem ( this.state.selectedProject.id, saveItem );
  }
  
  private _createHistory(prevHistory, action: IProjectAction) {
    let history: IProjectHistory = this._createHistoryObjectNoDetails(action);
    history.details = action.details.replace('User',this.state.currentUser.title).replace("TimeStamp", history.timeStamp);
    let historyString = JSON.stringify(history);
    if ( prevHistory != null ) { historyString = historyString += "," + prevHistory; }
    return historyString;
  }
    
  private _createHistoryObjectNoDetails(action: IProjectAction) {
    let today: any = new Date().toISOString();
    let historyObject: IProjectHistory = {
      details: null,
      timeStamp: today,
      userName: this.state.currentUser.Title,
      verb: action.verb,
      icon: action.icon,
    };

    return historyObject;
  }

  private updateProjectListItem( id: number, saveThisItem ) {
    let projListObject = this._getProjectList();
    console.log('Attempting to save this Project:', id, saveThisItem );
    projListObject.items.getById(id).update( saveThisItem ).then((response) => {
        console.log('Project Saved', response);
        this._getListItems();
        }).catch((e) => {
          this._processCatch(e);
      });

  }
    /*
*/

  /***
 *          d888b  d88888b d888888b      d8888b. d8888b.  .d88b.     d88b d88888b  .o88b. d888888b .d8888. 
 *         88' Y8b 88'     `~~88~~'      88  `8D 88  `8D .8P  Y8.    `8P' 88'     d8P  Y8 `~~88~~' 88'  YP 
 *         88      88ooooo    88         88oodD' 88oobY' 88    88     88  88ooooo 8P         88    `8bo.   
 *         88  ooo 88~~~~~    88         88~~~   88`8b   88    88     88  88~~~~~ 8b         88      `Y8b. 
 *         88. ~8~ 88.        88         88      88 `88. `8b  d8' db. 88  88.     Y8b  d8    88    db   8D 
 *          Y888P  Y88888P    YP         88      88   YD  `Y88P'  Y8888P  Y88888P  `Y88P'    YP    `8888Y' 
 *                                                                                                         
 *                                                                                                         
 */

 /**
  * This is called from within _getSelectedProject
  * It takes an array of items, checks a prop (key) for a val, and then returns the index of the item in the array
  * 
  * @param val 
  * @param prop 
  * @param array 
  */
  private _getProjectIndexFromArray(val,prop,array){

    for (let index = 0; index < array.length; index++) {
      if (array[index][prop] === val) {
        //console.log('Found index: ', index);
        return index;
      }
    }
  }

  /**
   * This should run when a project is selected in the list.
   * It will return an array of the items selected.
   * The array should only be of length 0 (if nothing is selected) or length 1
   * 
   * @param items 
   * @param exitMe 
   */

  private _getSelectedProject = ( items: any[]): void => {

    console.log( "_getSelectedProject items:", items );
    let selectedProject: IProject = null;

    if (this.state.userLoadStatus !== 'Complete') { return; }
    if (this.state.timeTrackerLoadStatus !== 'Complete') { return; }
    if (this.state.userLoadStatus !== 'Complete') { return; }
    //if (event) { event.preventDefault(); }

    if (items.length === 0 ) {

      //Only return here if the lastTrackedClick was not a project.
      //The reasoning logic is because if the last click was a project, and the length is 0, then it was "unselected"
      //And instead of just returning on unselect, we need to handle it and update the state.
      //This does not work yet... I have to see what's causing the other render.
      //if (this.state.lastTrackedClick.indexOf('project') < 0 ) { return;  }
      console.log('_getSelectedProject:  ITEMS.LENGTH===0');
      return;
    }
    console.log('_getSelectedProject:  ITEMS.LENGTH <> 0');
    console.log('Selected items:', items);
    
    let item : IProject; // = this.state.projects.newFiltered[0];

    for (let p of this.state.projects.newFiltered ) {
      if (p.id === items[0].id) {
        item = p;
      }
    }

    /**
     * This is the location of the mysterious web part disappearing trick.
     * Cannot read property 'id' of undefined.
     */

    let isItemNull = item == null ? true : false;
    if (isItemNull) {
      console.log('_getSelectedProject error:');
      console.log('_getSelectedProject items:', items);
      console.log('_getSelectedProject item:', item);
      console.log('_getSelectedProject this.state.projects:',this.state.projects);
      //item = this.createFormEntry();
    }

    //2020-04-03:  let selectedProjectIndex = isItemNull ? this.state.selectedProjectIndex + 1 : this._getProjectIndexFromArray(item.id,'id',this.state.projects.newFiltered);
    //2020-04-03:  let selectedProjectIndex = isItemNull ? 0 : this._getProjectIndexFromArray(item.id,'id',this.state.projects.newFiltered);

//    let selectedProjectIndex = isItemNull ? this.state.selectedProjectIndex : this._getProjectIndexFromArray(item.id,'id',this.state.projects.newFiltered);
    let selectedProjectIndexAny : any = isItemNull ? this.state.selectedProjectIndex : doesObjectExistInArray(this.state.projects.newFiltered,'id', item.id, true );
    if ( typeof selectedProjectIndexAny === 'string' ) { selectedProjectIndexAny = parseInt(selectedProjectIndexAny) ; }
    let selectedProjectIndex : number = selectedProjectIndexAny === false ? null : selectedProjectIndexAny ;

    if (selectedProjectIndex === -66666666 ) { //this.state.selectedProjectIndex ) { 
      //The project is already selected... do not do an update.

      //BUT Do we need to update anything else????

    } else {
      
      let formEntry = this.state.formEntry;

      if (isItemNull) {
        formEntry = this.createFormEntry();
      } else {
        formEntry = this.updateFormEntry(formEntry, item);
      }
  
      //2020-05-22:  Copying into separate object to pass to Project Edit screen.
      if (isItemNull != null) {
        selectedProject = JSON.parse(JSON.stringify(item));
      }
  
      /**
       * This section was added to save the selected project index in the Pivot object so it can be retrieved and set when changing pivots.
       */
      let statePivots = this.updateStatePivots( this.state.pivots, selectedProjectIndex, this.state.projectType);
  
      let clickHistory = this.state.clickHistory;
      let lastTrackedClick = 'Project: ' + formEntry.sourceProject.Description;
      clickHistory.push(lastTrackedClick);
  
      this.setState({ 
        pivots: statePivots,
        formEntry:formEntry, 
        blinkOnProject: this.state.blinkOnProject === 1 ? 2 : 1,
        selectedProjectIndex : selectedProjectIndex,
        selectedProjectIndexArr : selectedProjectIndex ? [selectedProjectIndex] : [],
        selectedProject: selectedProject,
        lastSelectedProjectIndex: this.state.selectedProjectIndex,
        lastTrackedClick: lastTrackedClick,
        clickHistory: clickHistory,
       });

    }

  }

/**
 * This updates the entry form given the current form and the selected project.
 * 
 * @param formEntryOrig 
 * @param item 
 */
  private updateFormEntry( formEntryOrig: ISaveEntry, item : IProject){

    let formEntry = formEntryOrig;

    formEntry.sourceProjectRef = [this.state.projectListURL, this.state.projectListName, item.id,].join(' || ');

    //let splitActivity = item.projOptions.activity != null ? item.projOptions.activity.split(";") : null;
    let splitActivity = null;
    let activityURL = null;
    if ( item.projOptions != null ){
      if ( item.projOptions.activity != null && item.projOptions.activity.length > 0 ){
        splitActivity = item.projOptions.activity.split(";");
      }
      if ( item.projOptions.href != null && item.projOptions.href.length > 0 ){
        activityURL = item.projOptions.href;
      }

    }

    if ( splitActivity != null && splitActivity[0] != null ) { 
      splitActivity[0] = splitActivity[0].trim();
      activityURL = activityURL === null ? null : activityURL.replace('[Activity]',splitActivity[0]) ;
     }

    formEntry.sourceProject = {
      Description: '( ' + item.id + ' ) ' + item.titleProject ,
      Url: this.state.projectListURL + '/DispForm.aspx?ID=' + item.id ,
    };

    formEntry.titleProject = item.titleProject;
    formEntry.projectID1  =  item.projectID1;
    formEntry.projectID2  =  item.projectID2;
    formEntry.category1  =  item.category1;
    formEntry.category2  =  item.category2;
    formEntry.leaderId  =  item.leaderId;
    formEntry.leader  =  item.leader;
    formEntry.team  =  item.team;
    formEntry.teamIds  =  item.teamIds;
    formEntry.ccEmail  =  item.ccEmail;
    formEntry.ccList  =  item.ccList;
    formEntry.story  =  item.story;
    formEntry.chapter  =  item.chapter;

    if ( item.projOptions != null ) {
      if ( item.projOptions.showLink ) {
        formEntry.activity = {
          Description: item.projOptions.type + ' - ' + item.projOptions.activity,
          Url: activityURL,
        };
      } else {
        formEntry.activity = {
          Description: null,
          Url: null,
        };
      }
    }

    return formEntry;

  }

//   d888b  d88888b d888888b      .d8888. d888888b  .d8b.  d888888b d88888b      d8888b. d888888b db    db  .d88b.  d888888b .d8888. 
//  88' Y8b 88'     `~~88~~'      88'  YP `~~88~~' d8' `8b `~~88~~' 88'          88  `8D   `88'   88    88 .8P  Y8. `~~88~~' 88'  YP 
//  88      88ooooo    88         `8bo.      88    88ooo88    88    88ooooo      88oodD'    88    Y8    8P 88    88    88    `8bo.   
//  88  ooo 88~~~~~    88           `Y8b.    88    88~~~88    88    88~~~~~      88~~~      88    `8b  d8' 88    88    88      `Y8b. 
//  88. ~8~ 88.        88         db   8D    88    88   88    88    88.          88        .88.    `8bd8'  `8b  d8'    88    db   8D 
//   Y888P  Y88888P    YP         `8888Y'    YP    YP   YP    YP    Y88888P      88      Y888888P    YP     `Y88P'     YP    `8888Y' 
//                                                                                                                                   
//   

  /**
   * This section was added to save the selected project index in the Pivot object so it can be retrieved and set when changing pivots.
   * 
   * @param statePivots 
   * @param setLastIndex 
   * @param projectType 
   */

  private updateStatePivots( statePivots: IMyPivots, setLastIndex: number, projectType: boolean ){

    let newPivots = statePivots;
     /**
     * This section was added to save the selected project index in the Pivot object so it can be retrieved and set when changing pivots.
     */
    let pivProj = newPivots.heading1;
    let pivHist = newPivots.heading2;
    let pivots = projectType === false ? pivProj : pivHist;
    let pivotHeader = projectType === false ? this.state.projectMasterPriorityChoice : this.state.projectUserPriorityChoice;  

    //get last index from pivot object... then set it to lastIndex here.
    for (let p of pivots){
      if ( p.filter === pivotHeader ) {
        p.lastIndex = setLastIndex;
        console.log('1138-Pivot index:', p);
      }
    }

    return newPivots;

  }
  
//   d888b  d88888b d888888b      d8888b. d888888b db    db      d8888b. d8888b.  .d88b.  d8888b. 
//  88' Y8b 88'     `~~88~~'      88  `8D   `88'   88    88      88  `8D 88  `8D .8P  Y8. 88  `8D 
//  88      88ooooo    88         88oodD'    88    Y8    8P      88oodD' 88oobY' 88    88 88oodD' 
//  88  ooo 88~~~~~    88         88~~~      88    `8b  d8'      88~~~   88`8b   88    88 88~~~   
//  88. ~8~ 88.        88         88        .88.    `8bd8'       88      88 `88. `8b  d8' 88      
//   Y888P  Y88888P    YP         88      Y888888P    YP         88      88   YD  `Y88P'  88      
//                                                                                                
//                 

/**
 * 
 * @param statePivots - copy of this.state.pivots
 * @param projectType - copy of this.state.projectType (Projects or History driven)
 * @param pivProp - property of pivot object to compare to
 * @param propFind - value of pivot object to find
 * @param returnProp - return property of pivot
 */
  private getSStatePivotProp( statePivots: IMyPivots, projectType: boolean, pivProp: string, propFindValue: string, returnProp: string ){

    let newPivots = statePivots;
     /**
     * This section was added to save the selected project index in the Pivot object so it can be retrieved and set when changing pivots.
     */
    let pivProj = newPivots.heading1;
    let pivHist = newPivots.heading2;
    let pivots = projectType === false ? pivProj : pivHist;

    let returnValue = null;

    //get last index from pivot object... then set it to lastIndex here.
    for (let p of pivots){
      if ( p[pivProp] === propFindValue ) {
        returnValue = p[returnProp];
        console.log('1233-get Pivot index:', p);
      }
    }

    return returnValue;

  }

/***
 *         db    db d8888b.      .d8888. db      d888888b d8888b. d88888b d8888b. 
 *         88    88 88  `8D      88'  YP 88        `88'   88  `8D 88'     88  `8D 
 *         88    88 88oodD'      `8bo.   88         88    88   88 88ooooo 88oobY' 
 *         88    88 88~~~          `Y8b. 88         88    88   88 88~~~~~ 88`8b   
 *         88b  d88 88           db   8D 88booo.   .88.   88  .8D 88.     88 `88. 
 *         ~Y8888P' 88           `8888Y' Y88888P Y888888P Y8888D' Y88888P 88   YD 
 *                                                                                
 *                                                                                
 */
  
  private _updateTimeSlider(newValue: number){
    let formEntry = this.state.formEntry;

    let now = new Date();
    let then = new Date();
    then.setMinutes(then.getMinutes() + newValue);

    if (newValue < 0) {

      formEntry.startTime = then.toLocaleString();     
      formEntry.endTime = now.toLocaleString();

    } else if (newValue > 0 ) {
      formEntry.startTime = now.toLocaleString();
      formEntry.endTime = then.toLocaleString();

    }

    this.setState({
      timeSliderValue: newValue,
      formEntry: formEntry,
      blinkOnProject: 0,
    });
  }

/***
 *         db    db d8888b.       .d8b.   .o88b. d888888b d888888b db    db d888888b d888888b db    db 
 *         88    88 88  `8D      d8' `8b d8P  Y8 `~~88~~'   `88'   88    88   `88'   `~~88~~' `8b  d8' 
 *         88    88 88oodD'      88ooo88 8P         88       88    Y8    8P    88       88     `8bd8'  
 *         88    88 88~~~        88~~~88 8b         88       88    `8b  d8'    88       88       88    
 *         88b  d88 88           88   88 Y8b  d8    88      .88.    `8bd8'    .88.      88       88    
 *         ~Y8888P' 88           YP   YP  `Y88P'    YP    Y888888P    YP    Y888888P    YP       YP    
 *                                                                                                     
 *                                                                                                     
 */
  
  private _updateActivity(newValue: string){

    if (this.state.timeTrackerLoadStatus !== 'Complete' || 
      this.state.userLoadStatus !== 'Complete'  || 
      this.state.projectsLoadStatus !== 'Complete' ) {
        return;
      }

    let formEntry = this.state.formEntry;
    let result = smartLinks.convertSmartLink(newValue, this.state.smartLinkRules);

    if ( result ) {
      formEntry.comments.value = result.commentText ? result.commentText : null;
      formEntry.activity.Description = result.activityDesc ? result.activityDesc : null;
      formEntry.activity.Url = newValue ? newValue : null ;
      formEntry.category1 = [ result.category1 ] ? [ result.category1 ] : null;
      formEntry.category2 = [ result.category2 ] ? [ result.category2 ] : null;
      formEntry.projectID1.value = result.projectID1 ? result.projectID1 : null;
      formEntry.projectID2.value = result.projectID2 ? result.projectID2 : null;
      console.log('updated formEntry: ', formEntry);
    } else {
      console.log('Did not update anthing based on activity.');
    }


    this.setState({ formEntry:formEntry, blinkOnProject: 0,});
  }

/***
 *         db    db d8888b.      .88b  d88.  .d8b.  d8b   db db    db  .d8b.  db      
 *         88    88 88  `8D      88'YbdP`88 d8' `8b 888o  88 88    88 d8' `8b 88      
 *         88    88 88oodD'      88  88  88 88ooo88 88V8o 88 88    88 88ooo88 88      
 *         88    88 88~~~        88  88  88 88~~~88 88 V8o88 88    88 88~~~88 88      
 *         88b  d88 88           88  88  88 88   88 88  V888 88b  d88 88   88 88booo. 
 *         ~Y8888P' 88           YP  YP  YP YP   YP VP   V8P ~Y8888P' YP   YP Y88888P 
 *                                                                                    
 *                                                                                    
 */

  private _updateStart(newValue){
    let formEntry = this.state.formEntry;
    formEntry.startTime = newValue.toLocaleString();
    this.setState({ formEntry:formEntry, blinkOnProject: 0,});
  }

  private _updateEnd(newValue){
    let formEntry = this.state.formEntry;
    formEntry.endTime = newValue.toLocaleString();
    this.setState({ formEntry:formEntry, blinkOnProject: 0,});
  }

  /***
 *         db    db d8888b.      d888888b d88888b db    db d888888b 
 *         88    88 88  `8D      `~~88~~' 88'     `8b  d8' `~~88~~' 
 *         88    88 88oodD'         88    88ooooo  `8bd8'     88    
 *         88    88 88~~~           88    88~~~~~  .dPYb.     88    
 *         88b  d88 88              88    88.     .8P  Y8.    88    
 *         ~Y8888P' 88              YP    Y88888P YP    YP    YP    
 *                                                                  
 *                                                                  
 */

  private _updateComments(newValue: string){
    let formEntry = this.state.formEntry;
    formEntry.comments.value = newValue;
    this.setState({ formEntry:formEntry, blinkOnProject: 0,});
  }

  private _updateProjectTitle(newValue: string){
    let formEntry = this.state.formEntry;
    formEntry.titleProject = newValue;
    this.setState({ formEntry:formEntry, blinkOnProject: 0, });
  }

/***
 *         db    db d8888b.      d8888b. d8888b.  .d88b.     d88b d88888b  .o88b. d888888b 
 *         88    88 88  `8D      88  `8D 88  `8D .8P  Y8.    `8P' 88'     d8P  Y8 `~~88~~' 
 *         88    88 88oodD'      88oodD' 88oobY' 88    88     88  88ooooo 8P         88    
 *         88    88 88~~~        88~~~   88`8b   88    88     88  88~~~~~ 8b         88    
 *         88b  d88 88           88      88 `88. `8b  d8' db. 88  88.     Y8b  d8    88    
 *         ~Y8888P' 88           88      88   YD  `Y88P'  Y8888P  Y88888P  `Y88P'    YP    
 *                                                                                         
 *                                                                                         
 */

  private _updateProjectID1(newValue: string){
    let formEntry = this.state.formEntry;
    formEntry.projectID1.value = newValue;
    this.setState({ formEntry:formEntry, blinkOnProject: 0 });
  }

  private _updateProjectID2(newValue: string){
    let formEntry = this.state.formEntry;
    formEntry.projectID2.value = newValue;
    this.setState({ formEntry:formEntry, blinkOnProject: 0, });
  }

/***
 *         db    db d8888b.      d88888b d8b   db d888888b d8888b. db    db      d888888b db    db d8888b. d88888b 
 *         88    88 88  `8D      88'     888o  88 `~~88~~' 88  `8D `8b  d8'      `~~88~~' `8b  d8' 88  `8D 88'     
 *         88    88 88oodD'      88ooooo 88V8o 88    88    88oobY'  `8bd8'          88     `8bd8'  88oodD' 88ooooo 
 *         88    88 88~~~        88~~~~~ 88 V8o88    88    88`8b      88            88       88    88~~~   88~~~~~ 
 *         88b  d88 88           88.     88  V888    88    88 `88.    88            88       88    88      88.     
 *         ~Y8888P' 88           Y88888P VP   V8P    YP    88   YD    YP            YP       YP    88      Y88888P 
 *                                                                                                                 
 *                                                                                                                 
 */

  private _updateEntryType(ev: React.FormEvent<HTMLInputElement>, option: IChoiceGroupOption){

    let formEntry = this.state.formEntry;
    formEntry.entryType = option.key;

    if (formEntry.entryType === 'manual') {
      //Check if date is empty, if so, set to now.
      let now = new Date();
      if ( formEntry.startTime === "" ) { formEntry.startTime = now.toLocaleString(); }
      if ( formEntry.endTime === "" ) { formEntry.endTime = now.toLocaleString(); }

    }
    console.log('_updateEntryType: this.state', this.state);
    console.log('_updateEntryType: formEntry', formEntry);
    console.log('_updateEntryType: formEntry.entryType', formEntry.entryType);

    this.setState({ 
      formEntry:formEntry, 
      currentTimePicker : option.key,
      blinkOnProject: 0,
     });
  }
  

  public _onActivityClick = (ev: React.FormEvent<HTMLInputElement>): void => {
    //This sends back the correct pivot category which matches the category on the tile.

    //let itemID = (item.title + '|Splitme|' + item.activity);
    let parent = ev.currentTarget.parentElement;
    let buttonID = parent.id;

    //2020-05-11:  Issue 44 Added so activity can have / or \ from partial URLs
    buttonID = buttonID.replace(/forwardSSlash/gi, '\/');
    buttonID = buttonID.replace(/backwardSSlash/gi, '\\');
    buttonID = buttonID.replace(/singlePeriod/gi, '\.');

    let splitID = buttonID.split('|Splitme|');

    let e = ev;
    console.log('_onActivityClick e:', e);
    console.log('_onActivityClick event:', ev);
    
    let thisProject = this.state.projects.newFiltered[this.state.selectedProjectIndex];

    let projOptions = thisProject.projOptions;
    let url = projOptions.href;

    if ( splitID[1] != null ) { 
      splitID[1] = splitID[1].trim();
      url = url.replace('[Activity]',splitID[1]) ;
     }
    
    console.log('_onActivityClick item:', url);
    window.open(url, '_blank');

    let formEntry = this.state.formEntry;
    formEntry.activity = {
      Description: buttonID.replace('|Splitme|',' - '),
      Url: url,
    };

    this.setState({ 
      formEntry:formEntry, 
    });

  } //End onNavClick

/***
 *         d8b   db  .d88b.  d888888b      db    db .d8888. d88888b d8888b. 
 *         888o  88 .8P  Y8. `~~88~~'      88    88 88'  YP 88'     88  `8D 
 *         88V8o 88 88    88    88         88    88 `8bo.   88ooooo 88   88 
 *         88 V8o88 88    88    88         88    88   `Y8b. 88~~~~~ 88   88 
 *         88  V888 `8b  d8'    88         88b  d88 db   8D 88.     88  .8D 
 *         VP   V8P  `Y88P'     YP         ~Y8888P' `8888Y' Y88888P Y8888D' 
 *                                                                          
 *                                                                          
 */



  private searchMe = (item: PivotItem): void => {
    //This sends back the correct pivot category which matches the category on the tile.
    let e: any = event;
    console.log(e);
    let searchType = "";
    let newSearchShow =  e.altKey === true ? true : !this.state.searchShow;
    let searchCount = this.state.projects.lastFiltered.length;
    let searchWhere = this.state.searchWhere;
    if (e.altKey) { 
      searchType = "all";
      newSearchShow = true;
      //searchCount = this.state.projects.all.length;
      searchWhere = ' in all categories';
    }
    
    let projects = this.state.projects;
    //projects.lastFiltered = (searchType === 'all' ? this.state.projects.all : this.state.lastFilteredProjects );

    console.log('newSearchShow: ', newSearchShow, searchType);
    this.setState({
      searchType: searchType,
      searchShow: ( e.altKey === true ? true : !this.state.searchShow ),
      projects: projects,
      searchCount: searchCount,
      searchWhere: searchWhere,
      blinkOnProject: 0,
    });

    
  } //End searchMe

  /**
   * This does not seem to be used.
   * @param item 
   */
  public searchForItems = (item): void => {
    //This sends back the correct pivot category which matches the category on the tile.
    let e: any = event;
 
    console.log('searchForItems: e',e);
    console.log('searchForItems: item', item);
    console.log('searchForItems: this', this);
    /*
    */

    let searchItems = [];
    if (this.state.searchType === 'all'){
      searchItems =this.state.projects.all;
    } else {
      searchItems =this.state.projects.lastFiltered;
    }
    let searchCount = searchItems.length;
    let newFilteredProjects = [];
    for (let thisItem of searchItems) {
      let fileName = thisItem.href.substring(thisItem.href.lastIndexOf('/'));

      let searchString = 'title:' + thisItem.title.toLowerCase() + 'tescription:' + thisItem.description.toLowerCase() + 'href:' + fileName;
      if(searchString.indexOf(item.toLowerCase()) > -1) {
        //console.log('fileName', fileName);
        newFilteredProjects.push(thisItem);
      }
    }

    searchCount = newFilteredProjects.length;

    let projects = this.state.projects;
    //projects.lastFiltered = (searchType === 'all' ? this.state.projects.all : this.state.lastFilteredProjects );

    this.setState({
      projects: projects,
      searchCount: searchCount,
    });


    return ;
    
  } //End searchForItems


  
  public onChangePivotClick = (item): void => {
    //This sends back the correct pivot category which matches the category on the tile.
    let e: any = event;

    this._updateStateOnPropsChange({

    });

  } //End onClick

  private showAll = (item: PivotItem): void => {
    //This sends back the correct pivot category which matches the category on the tile.
    let e: any = event;
    if (e.altKey && e.shiftKey && !e.ctrlKey) { 

    } else if (e.ctrlKey) { 

    } else {
      let newFilteredProjects = [];
      for (let thisItem of this.state.projects.all) {
          let showthisItem = true;
          if (showthisItem === true) {newFilteredProjects.push(thisItem) ; }
      }

      let projects = this.state.projects;
      projects.lastFiltered = (this.state.searchType === 'all' ? this.state.projects.all : this.state.projects.lastFiltered );

      this.setState({
        projects: projects,
        searchCount: this.state.projects.all.length,
        pivotDefSelKey: "-100",
        searchWhere: ' in all categories',
        blinkOnProject: 0,
      });
    }
    
  }

  private minimizeTiles = (item: PivotItem): void => {
    //This sends back the correct pivot category which matches the category on the tile.
    let e: any = event;
    console.log(e);
    if (e.altKey && e.shiftKey && !e.ctrlKey) { 

      if (strings.analyticsWeb.indexOf(this.props.tenant) === 0 ) {
        let openThisWindow = strings.analyticsWeb + '/lists/' + strings.analyticsList;
        window.open(openThisWindow, '_blank');
        event.preventDefault();
      } else {

        console.log('the analyticsWeb is not in the same tenant...',strings.analyticsWeb,this.props.tenant);

      }
    } else if (e.ctrlKey) { 

      if (strings.minClickWeb.indexOf(this.props.tenant) === 0 ) {
        let openThisWindow = strings.minClickWeb + this.props.pageContext.web.absoluteUrl;
        window.open(openThisWindow, '_blank');
        event.preventDefault();
      } else {

        console.log('the minClickWeb is not in the same tenant...',strings.minClickWeb,this.props.tenant);

      }
    } else {
      let newFilteredProjects = [];
      let projects = this.state.projects;
      projects.newFiltered = [];
      projects.lastFiltered = projects.all;

      this.setState({
        projects: projects,
        searchCount: this.state.projects.all.length,
        pivotDefSelKey: "-100",
        searchWhere: ' in all categories',
        blinkOnProject: 0,
      });
    }
    


  } //End onClick

  public toggleLayout = (item: any): void => {
    //This sends back the correct pivot category which matches the category on the tile.
    /*
    let setLayout = this.state.setLayout;

    if (setLayout === "Card") {
      setLayout = this.props.setSize
    } else if (setLayout === "List") {
      setLayout = "Card"
    } else {       setLayout = "List" }

    this.setState({
      setLayout: setLayout,
    });
    */

  } //End toggleTips  




/***
 *          .d88b.  d8b   db      db      d888888b d8b   db db   dD       .o88b. db      d888888b  .o88b. db   dD 
 *         .8P  Y8. 888o  88      88        `88'   888o  88 88 ,8P'      d8P  Y8 88        `88'   d8P  Y8 88 ,8P' 
 *         88    88 88V8o 88      88         88    88V8o 88 88,8P        8P      88         88    8P      88,8P   
 *         88    88 88 V8o88      88         88    88 V8o88 88`8b        8b      88         88    8b      88`8b   
 *         `8b  d8' 88  V888      88booo.   .88.   88  V888 88 `88.      Y8b  d8 88booo.   .88.   Y8b  d8 88 `88. 
 *          `Y88P'  VP   V8P      Y88888P Y888888P VP   V8P YP   YD       `Y88P' Y88888P Y888888P  `Y88P' YP   YD 
 *                                                                                                                
 *                                                                                                                
 */

  public onLinkClick = (item): void => {
    //This sends back the correct pivot category which matches the category on the tile.
    let e: any = event;

    if (e.ctrlKey) {
      //Set clicked pivot as the hero pivot
      this._updateStateOnPropsChange({heroCategory: item.props.headerText});

    } else if (e.altKey) {
      //Enable-disable ChangePivots options
      this.setState({
        
      });

    } else {

      this.updateProjectSelection( item.props.headerText , this.state.projectType,  'Pivot: ' + item.props.headerText , null ) ;

    }

  } //End onClick

  private updateProjectSelection( filteredCategory: string, newProjectType : boolean, trackedClick: string, filterText : string ) {

    console.log('onLinkClick: this.state', this.state);
      
    let thisFilter = [];
    
    //get last index from pivot object... then set it to lastIndex here.

    let selectedProjectIndex = this.getSStatePivotProp( this.state.pivots, newProjectType, 'headerText' , filteredCategory, 'lastIndex' );
    let thisFilterString = this.getSStatePivotProp( this.state.pivots, newProjectType, 'headerText' , filteredCategory, 'filter' );

    if (thisFilterString != null ) {
      thisFilter.push(thisFilterString);
    }

    console.log('thisFilter', thisFilter);

    let projects = this.state.projects;
    projects.lastFiltered = projects.newFiltered;
    let filterThese = newProjectType ? projects.user : projects.master ;
    projects.newFiltered = this.getTheseProjects(filterThese, thisFilter, 'asc', 'titleProject');
    //projects.lastFiltered = (searchType === 'all' ? this.state.projects.all : this.state.lastFilteredProjects );

    let newProjectMasterPriorityChoice = !newProjectType ? thisFilter[0] : this.state.projectMasterPriorityChoice;
    let newProjectUserPriorityChoice = newProjectType ? thisFilter[0] : this.state.projectUserPriorityChoice;
    
    if ( this.state.syncProjectPivotsOnToggle ) {
      newProjectMasterPriorityChoice = thisFilter[0];
      newProjectUserPriorityChoice = thisFilter[0];
    }

    let clickHistory = this.state.clickHistory;
    clickHistory.push(trackedClick);

    //2020-05-22:  Copying into separate object to pass to Project Edit screen.
    //2021-01-05:  WTH was I thinking on 5-22?  Not sure!
    let selectedProject: IProject = null;
    if (projects.newFiltered.length > 0 && selectedProjectIndex != null ) {
      selectedProject = JSON.parse(JSON.stringify(projects.newFiltered[selectedProjectIndex]));
    }

    //public updateProjectSelection
    this.setState({
      projectType: newProjectType,
      filteredCategory: filteredCategory,
      projectMasterPriorityChoice: newProjectMasterPriorityChoice,
      projectUserPriorityChoice: newProjectUserPriorityChoice,
      projects: projects,
      //searchCount: newFilteredProjects.length,
      searchType: '',
      searchWhere: ' in ' + filteredCategory,
      //pivotDefSelKey: defaultSelectedKey,
      blinkOnProject: 0,
      selectedProject: selectedProject,
      lastTrackedClick: trackedClick,
      clickHistory: clickHistory,
      selectedProjectIndex: selectedProjectIndex,
      selectedProjectIndexArr : selectedProjectIndex ? [selectedProjectIndex] : [],
      
    });

  }

/***
 *          d888b  d88888b d888888b      d888888b db   db d88888b .d8888. d88888b      d8888b. d8888b.  .d88b.     d88b 
 *         88' Y8b 88'     `~~88~~'      `~~88~~' 88   88 88'     88'  YP 88'          88  `8D 88  `8D .8P  Y8.    `8P' 
 *         88      88ooooo    88            88    88ooo88 88ooooo `8bo.   88ooooo      88oodD' 88oobY' 88    88     88  
 *         88  ooo 88~~~~~    88            88    88~~~88 88~~~~~   `Y8b. 88~~~~~      88~~~   88`8b   88    88     88  
 *         88. ~8~ 88.        88            88    88   88 88.     db   8D 88.          88      88 `88. `8b  d8' db. 88  
 *          Y888P  Y88888P    YP            YP    YP   YP Y88888P `8888Y' Y88888P      88      88   YD  `Y88P'  Y8888P  
 *                                                                                                                      
 *                                                                                                                      
 */

  public getTheseProjects(startingProjects: IProject[], filterFlags : string[], sortOrder: 'asc' | 'dec', sortProp: string){

    //console.log('getTheseProjects: filterFlags', filterFlags);

    let filteredProjects: IProject[] = [];

    if (filterFlags.length === 0) {
      return startingProjects;
    }

    for (let thisItem of startingProjects) {
      if (Utils.arrayContainsArray(thisItem.filterFlags,filterFlags)) {
        filteredProjects.push(thisItem);
      }
    }

    if ( sortProp && sortProp.length > 0 ) {
      filteredProjects = sortObjectArrayByStringKey( filteredProjects, sortOrder, sortProp ) ;
    }

    console.log('getTheseProjects: filteredProjects', filteredProjects);
    return filteredProjects;
  }
  

  /**
   * This builds unique string key based on properties passed in through this.props.projectKey
   * @param project 
   */
  private getProjectKey(project){

    let key = "";
    for (let k of this.props.projectKey ){
      //console.log('timeTrackData',timeTrackData[k])
      let partialKey = project[k];
      if ( k === 'comments' || k === 'projectID1' || k === 'projectID2' || k === 'timeTarget') {
        //These properties have custom object model to them so we need to check the .value
        if ( project[k] ) { partialKey = project[k].value ; } else { partialKey = '' ; }
      }
      if ( typeof partialKey === 'object') {
        if (partialKey) { key += partialKey.join(' '); }
      } else if (partialKey) { key += partialKey;}
      key += ' ';
    }

    return key;

  }

  private convertToProject(timeTrackData){

    let thisProject: IProject = {

        //Values that would come from Project item
      projectType: 'User', //master or user
      id: timeTrackData.id, //Item ID on list
      editLink: timeTrackData.editLink, //Link to view/edit item link
      titleProject: timeTrackData.titleProject,
      comments: timeTrackData.comments, // syntax similar to ProjID?
      active: timeTrackData.active,  //Used to indicate inactive projects
      everyone: timeTrackData.everyone, //Used to designate this option should be available to everyone.
      sortOrder: timeTrackData.sortOrder, //Used to prioritize in choices.... ones with number go first in order, followed by empty
      key: this.getProjectKey(timeTrackData),

      category1: timeTrackData.category1,
      category2: timeTrackData.category2,
      leader: timeTrackData.leader,  //Likely single person column
      team: timeTrackData.team,  //Likely multi person column
      leaderId: timeTrackData.leaderId,
      teamIds: timeTrackData.teamIds ? timeTrackData.teamIds : [] ,

      filterFlags: [], // what flags does this match?  yourRecent, allRecent etc...

      projectID1: timeTrackData.projectID1,  //Example Project # - look for strings starting with * and ?
      projectID2: timeTrackData.projectID2,  //Example Cost Center # - look for strings starting with * and ?

      timeTarget: timeTrackData.timeTarget,

      //This might be computed at the time page loads
      lastEntry: timeTrackData.lastEntry,  //Should be a time entry

      //Values that relate to project list item
      sourceProject: timeTrackData.sourceProject, //Link back to the source project list item.
      sourceProjectRef: timeTrackData.sourceProjectRef, //Link back to the source project list item.
      ccList: timeTrackData.ccList, //Link to CC List to copy item
      ccEmail: timeTrackData.ccEmail, //Email to CC List to copy item 

      created: timeTrackData.created,
      modified: timeTrackData.modified,
      createdBy: timeTrackData.createdBy,
      modifiedBy: timeTrackData.modifiedBy,

    };

    return thisProject;

  }


  /***
 *         d888888b  .d88b.   d888b   d888b  db      d88888b      d888888b db    db d8888b. d88888b 
 *         `~~88~~' .8P  Y8. 88' Y8b 88' Y8b 88      88'          `~~88~~' `8b  d8' 88  `8D 88'     
 *            88    88    88 88      88      88      88ooooo         88     `8bd8'  88oodD' 88ooooo 
 *            88    88    88 88  ooo 88  ooo 88      88~~~~~         88       88    88~~~   88~~~~~ 
 *            88    `8b  d8' 88. ~8~ 88. ~8~ 88booo. 88.             88       88    88      88.     
 *            YP     `Y88P'   Y888P   Y888P  Y88888P Y88888P         YP       YP    88      Y88888P 
 *                                                                                                  
 *                                                                                                  
 */

  public toggleType = (item): void => {
    //This sends back the correct pivot category which matches the category on the tile.
    let e: any = event;
    
    if (e.ctrlKey) {
      //Set clicked pivot as the hero pivot
    } else if (e.altKey) {
      //Enable-disable ChangePivots options
    } else {
    }

    let newProjectType = !this.state.projectType;
    let pivotHeader = newProjectType === false ? this.state.projectMasterPriorityChoice : this.state.projectUserPriorityChoice;  
    let trackedClick = 'ToggleType from ' +  this.state.projectType + ' to ' + newProjectType;
    this.updateProjectSelection( pivotHeader , this.state.projectType,  trackedClick , null ) ;

  } //End toggleType


/***
 *         d8888b. db    db d888888b d888888b  .d88b.  d8b   db       .o88b. db      d888888b  .o88b. db   dD .d8888. 
 *         88  `8D 88    88 `~~88~~' `~~88~~' .8P  Y8. 888o  88      d8P  Y8 88        `88'   d8P  Y8 88 ,8P' 88'  YP 
 *         88oooY' 88    88    88       88    88    88 88V8o 88      8P      88         88    8P      88,8P   `8bo.   
 *         88~~~b. 88    88    88       88    88    88 88 V8o88      8b      88         88    8b      88`8b     `Y8b. 
 *         88   8D 88b  d88    88       88    `8b  d8' 88  V888      Y8b  d8 88booo.   .88.   Y8b  d8 88 `88. db   8D 
 *         Y8888P' ~Y8888P'    YP       YP     `Y88P'  VP   V8P       `Y88P' Y88888P Y888888P  `Y88P' YP   YD `8888Y' 
 *                                                                                                                    
 *                                                                                                                    
 */

 
 
public toggleTips = (item: any): void => {
  //This sends back the correct pivot category which matches the category on the tile.

  this.setState({
    showTips: !this.state.showTips,
    showCharts: false,
  });

} //End toggleTips  


  public toggleCharts = () : void => {
    //alert('trackMyTime');
    //alert('Hey dummy!');
    if (this.state.allLoaded !== true ) { return ;}
    this.setState({  
      showCharts: !this.state.showCharts,
      showTips: false,
    });

  }

  public toggleDebug = () : void => {
    //alert('trackMyTime');
    //alert('Hey dummy!');
    if (this.state.allLoaded !== true ) { return ;}
    this.setState({  
      debugColors: !this.state.debugColors,

    });

  }
  

  /**
   * This should save an item
   */
  public trackMyTime = () : void => {
    //alert('trackMyTime');

      let saveError = '';

      if ( this.state.fields.ProjectID1.required ) {
        if ( this.state.formEntry.projectID1.value === "*" || this.state.formEntry.projectID1.value == null  || this.state.formEntry.projectID1.value.replace(' ','') == '' ) {
          saveError += 'Project ID1 ';
        }
      }
      if ( this.state.fields.ProjectID2.required ) {
        if ( this.state.formEntry.projectID2.value === "*" || this.state.formEntry.projectID2.value == null  || this.state.formEntry.projectID1.value.replace(' ','') == ''  ) {
          saveError += 'Project ID2 ';
        }
      }
      if ( this.state.fields.Category1.required ) {
        if ( this.state.formEntry.category1 === ["*"] || this.state.formEntry.category1 == null  || this.state.formEntry.category1[0].replace(' ','') == ''  ) {
          saveError += 'Category1 ';
        }
      }
      if ( this.state.fields.Category2.required ) {
        if ( this.state.formEntry.category2=== ["*"] || this.state.formEntry.projectID2 == null  || this.state.formEntry.category2[0].replace(' ','') == ''  ) {
          saveError += 'Category2 ';
        }
      }

      let deltaTime = getTimeDelta(this.state.formEntry.startTime,this.state.formEntry.endTime,'hours');
      let timeMessage = this.state.formEntry.startTime + ' to ' + this.state.formEntry.endTime;
      let allowedHours = this.props.timeSliderMax/60;
      if ( deltaTime < 0 ) {
        alert('Please make sure End Time is AFTER start time!  ' + timeMessage +  ' or ' + deltaTime + ' hours.');
        return;
      } else if (saveError.length > 0 ) {
        alert('Please enter value in these fields before saving: ' +  saveError);
        return;
      } else if (deltaTime > allowedHours ) {
        alert('Time span seems to be greater than the allowed ' + allowedHours +  ' hours: ' + timeMessage +  ' or ' + deltaTime + ' hours.');
        return;
      } else {
        this.saveMyTime (this.state.formEntry , 'master');
      }

  }

  public startMyTime = () : void => {
    //alert('trackMyTime');
    this.saveMyTime (this.state.formEntry , 'master');

  }

  public _updateStory = (selectedStory: ISelectedStory) : void => {
    
    this.setState({  
      selectedStory: selectedStory,
      chartStringFilter: null, //2020-04-08:  Added to clear filter box when updating story
    });
  }
  
  public _updateUserFilter = (selectedUser: ISelectedUser) : void => {
  
    this.setState({  
      selectedUser: selectedUser,
      chartStringFilter: null, //2020-04-08:  Added to clear filter box when updating story
    });
  }
    
  public _updateChartFilter = (chartStringFilter: string) : void => {
  
    this.setState({  
      chartStringFilter: chartStringFilter,
    });
  }
  
  



  public clearMyInput = () : void => {

    let formEntry =this.createFormEntry();
    //console.log('formEntry: currentUser', formEntry);

    let clickHistory = this.state.clickHistory;
    let lastTrackedClick = 'Clear Input';
    clickHistory.push(lastTrackedClick);

    this.setState({  
      formEntry: formEntry,
      lastTrackedClick: lastTrackedClick,
      clickHistory: clickHistory,
    });

    //this.saveMyTime (this.state.entries.all[0] , 'master');
    alert('We cleared all unsaved data.');
  }


  /***
 *         d8888b. d888888b db    db  .d88b.  d888888b .d8888. 
 *         88  `8D   `88'   88    88 .8P  Y8. `~~88~~' 88'  YP 
 *         88oodD'    88    Y8    8P 88    88    88    `8bo.   
 *         88~~~      88    `8b  d8' 88    88    88      `Y8b. 
 *         88        .88.    `8bd8'  `8b  d8'    88    db   8D 
 *         88      Y888888P    YP     `Y88P'     YP    `8888Y' 
 *                                                             
 *                                                             
 */

  //http://react.tips/how-to-create-reactjs-components-dynamically/ - based on createImage
  public createPivot(pivT: IPivot) {

      return (
        <PivotItem 
          headerText={pivT.headerText} 
          itemKey={pivT.itemKey}
        >
        </PivotItem>
      );
  }

  public createPivots(thisState,thisProps){
    let pivots = this.state.projectType === false ? this.state.pivots.heading1 : this.state.pivots.heading2;  
    let piv2 = pivots.map(this.createPivot);
    return (
      piv2
    );
  }

  
  private getPivotHelpText (parentState: ITrackMyTime7State, parentProps: ITrackMyTime7Props) {
          
    let helpText = null;
    let pivots = parentState.projectType === false ? parentState.pivots.heading1 : parentState.pivots.heading2;  
    let setPivot = !this.state.projectType ? this.state.projectMasterPriorityChoice :this.state.projectUserPriorityChoice ;


    for (let p of pivots){
      if ( setPivot === p.itemKey ) {
        //https://stackoverflow.com/questions/3103962/converting-html-string-into-dom-elements
        // DOES NOT WORK helpText = new DOMParser().parseFromString(p.data, "text/xml");
        helpText = p.data;
      }
    }
    //return "";

    return <div className={ styles.pivotLabel }>{ helpText }</div>;

  }




/***
 *         db    db d8888b. d8888b.  .d8b.  d888888b d88888b      .d8888. d888888b  .d8b.  d888888b d88888b 
 *         88    88 88  `8D 88  `8D d8' `8b `~~88~~' 88'          88'  YP `~~88~~' d8' `8b `~~88~~' 88'     
 *         88    88 88oodD' 88   88 88ooo88    88    88ooooo      `8bo.      88    88ooo88    88    88ooooo 
 *         88    88 88~~~   88   88 88~~~88    88    88~~~~~        `Y8b.    88    88~~~88    88    88~~~~~ 
 *         88b  d88 88      88  .8D 88   88    88    88.          db   8D    88    88   88    88    88.     
 *         ~Y8888P' 88      Y8888D' YP   YP    YP    Y88888P      `8888Y'    YP    YP   YP    YP    Y88888P 
 *                                                                                                          
 *                                                                                                          
 */

  private _updateStateOnPropsChange(params: any ): void {
  
    /*
    this.setState({

    });
    */

  }

  /***
 *         d888888b .88b  d88. d888888b      d88888b db    db d8b   db  .o88b. d888888b d888888b  .d88b.  d8b   db .d8888. 
 *         `~~88~~' 88'YbdP`88 `~~88~~'      88'     88    88 888o  88 d8P  Y8 `~~88~~'   `88'   .8P  Y8. 888o  88 88'  YP 
 *            88    88  88  88    88         88ooo   88    88 88V8o 88 8P         88       88    88    88 88V8o 88 `8bo.   
 *            88    88  88  88    88         88~~~   88    88 88 V8o88 8b         88       88    88    88 88 V8o88   `Y8b. 
 *            88    88  88  88    88         88      88b  d88 88  V888 Y8b  d8    88      .88.   `8b  d8' 88  V888 db   8D 
 *            YP    YP  YP  YP    YP         YP      ~Y8888P' VP   V8P  `Y88P'    YP    Y888888P  `Y88P'  VP   V8P `8888Y' 
 *                                                                                                                         
 *                                                                                                                         
 */

  public buildSmartText (makeThisSmart: string, projListValue: string) {

    let projectText : string = makeThisSmart ;
    let isRequired : boolean = ( projectText && projectText.indexOf("\*") === 0 ) ? true : false ;
    let projectString = isRequired ? makeThisSmart.substring(1) : makeThisSmart;

    let isHidden : boolean = ( projectText && projectText.indexOf("hideme;") === 0 ) ? true : false ;
    if ( isHidden ) { projectString = projectString.replace('hideme;',''); }

    let isDefault : boolean = (projectString && projectString.indexOf("\?") === 0 ) ? true : false ;

    projectString = isDefault ? projectString.substring(1) : projectString;
    let lastIndexOfDots : number = projectString ? projectString.lastIndexOf("...") : -1;
    let defaultIsPrefix = lastIndexOfDots > -1 ? true : false;


    let prefix : string = (projectString && lastIndexOfDots === projectString.length -3 ) ? projectString.substring(0,lastIndexOfDots) : null ;
    let mask : string = (makeThisSmart && makeThisSmart.indexOf('mask=')===0) ? makeThisSmart.replace('mask=','') : '';
    let thisProj : ISmartText = {
      projListValue: projListValue,
      value: defaultIsPrefix ? "" : isHidden ? projectString : makeThisSmart,
      hidden: isHidden,
      required: isRequired,
      default: projectString ,
      defaultIsPrefix: defaultIsPrefix,
      prefix: prefix,
      mask: mask,
    };

    return thisProj;
  }


  
/***
 *             d888b  d88888b d888888b db      d888888b .d8888. d888888b d888888b d888888b d88888b .88b  d88. .d8888. 
 *            88' Y8b 88'     `~~88~~' 88        `88'   88'  YP `~~88~~'   `88'   `~~88~~' 88'     88'YbdP`88 88'  YP 
 *            88      88ooooo    88    88         88    `8bo.      88       88       88    88ooooo 88  88  88 `8bo.   
 *            88  ooo 88~~~~~    88    88         88      `Y8b.    88       88       88    88~~~~~ 88  88  88   `Y8b. 
 *            88. ~8~ 88.        88    88booo.   .88.   db   8D    88      .88.      88    88.     88  88  88 db   8D 
 *    C88888D  Y888P  Y88888P    YP    Y88888P Y888888P `8888Y'    YP    Y888888P    YP    Y88888P YP  YP  YP `8888Y' 
 *                                                                                                                    
 *                                                                                                                    
 */

 private _getProjectListTitle() {
  let useProjectList: string = strings.DefaultProjectListTitle;
  if ( this.props.projectListTitle ) {
    useProjectList = this.props.projectListTitle;
  }
  return useProjectList;
 }

 private _getProjectList  () {
  let useProjectWeb: string = this.state.projectListWeb;
  
  let useProjectList:string = this._getProjectListTitle();

  const projectWeb = Web(useProjectWeb);

  return projectWeb.lists.getByTitle(useProjectList);

 }

  //Added for Get List Data:  https://www.youtube.com/watch?v=b9Ymnicb1kc
  @autobind 

  private _getMoreItems() {
    let currentCount = this.state.allEntries.length;
    this._getListItems(currentCount + 200);
  }
  //    private async loadListItems(): Promise<IPivotTileItemProps[]> {
  private _getListItems(timeItems = 200): void {

    let useTrackMyTimeList: string = strings.DefaultTrackMyTimeListTitle;
    if ( this.props.timeTrackListTitle ) {
      useTrackMyTimeList = this.props.timeTrackListTitle;
    }

    let useTrackMyTimeWeb: string = this.state.timeTrackerListWeb;
   
    //const fixedURL = Utils.fixURLs(this.props.listWebURL, this.props.pageContext);

    let projectSort: string = "SortOrder";
    //let projectSort: string = "Title";
    let trackTimeSort: string = "StartTime";

//    let projectRestFilter: string = "Team eq '" + 20 + "'";
//    let trackTimeRestFilter: string = "User eq '" + 20 + "'";

    let projectRestFilter: string = "";
    let trackTimeRestFilter: string = "";

    let selectCols: string = "*";
    let expandThese = "";

    //These should only be columns COMMON to both lists
    let peopleColumns = ["Author","Editor","Team","Leader"];
    let peopleProps = ["Title","ID","Name"];
    let allColumns = [];

    for (let peep of peopleColumns){
      for (let pro of peopleProps){
        allColumns.push(peep + "/" +  pro);
      }     
    }

    let expColumns = this.getExpandColumns(allColumns);
    let selColumns = this.getSelectColumns(allColumns);
 
    selColumns.length > 0 ? selectCols += "," + selColumns.join(",") : selectCols = selectCols;
    if (expColumns.length > 0) { expandThese = expColumns.join(","); }

    let expandTheseTrack = expandThese + ',User';
    let selectColsTrack = selectCols + ',User/Title,User/ID,User/Name';
    //Add all hidden columns on list to read
    selectColsTrack += ',OriginalHours,OriginalStart,OriginalEnd,SourceProject,SourceProjectRef';

    let expandTheseProj = expandThese + ',CompletedByTMT';
    let selectColsProj = selectCols + ',CompletedByTMT/Title,CompletedByTMT/ID,CompletedByTMT/Name';

    //Add all hidden columns on list to read
    selectColsProj += ',HistoryTMT,ProjectEditOptions';

    //Updated Jan 5, 2020 per https://pnp.github.io/pnpjs/getting-started/
    const trackTimeWeb = Web(useTrackMyTimeWeb);

    //let batch: any = sp.createBatch();

    let loadProjectItems = new Array<IProject>();
    let loadTrackMyTimeItems = new Array<ITimeEntry>();

    let trackMyProjectsInfo = {
      projectData: loadProjectItems,
      timeTrackData: loadTrackMyTimeItems,
    };

/**
 * projectWeb.lists.getByTitle(useProjectList).items
 * 
 * Another way.... go by full URL
 * http://www.ktskumar.com/2017/04/get-list-based-url-using-pnp-javascript-library/
 * $pnp.sp.web.getList("/sites/development/Lists/sample").items
 * projectWeb.getList("/sites/Templates/Tmt/Lists/TrackMyTime/").items
 * projectWeb.getList("/sites/Templates/Tmt/Lists/Projects").items
 * projectWeb.getList().items
 */


 /***
 *                         d888b  d88888b d888888b      db    db .d8888. d88888b d8888b. 
 *                        88' Y8b 88'     `~~88~~'      88    88 88'  YP 88'     88  `8D 
 *                        88      88ooooo    88         88    88 `8bo.   88ooooo 88oobY' 
 *                        88  ooo 88~~~~~    88         88    88   `Y8b. 88~~~~~ 88`8b   
 *                        88. ~8~ 88.        88         88b  d88 db   8D 88.     88 `88. 
 *                         Y888P  Y88888P    YP         ~Y8888P' `8888Y' Y88888P 88   YD 
 *                                                                                       
 *                                                                                       
 */

    //From https://www.ktskumar.com/2018/11/get-current-user-using-pnp-library-spfx/
    //Removed r: CurrentUser with @pnp/sp v2.
    //sp.web.currentUser.inBatch(batch).get().then((r: CurrentUser) => {
    // This did not seem to work when on another site:
    // sp.web.currentUser.inBatch(batch).get().then((r) => {
    // trackTimeWeb.currentUser.inBatch(batch).get().then((r) => {
    //  console.log('sp.web:', sp.web);
    //  console.log('sp.web.currentUser:', sp.web.currentUser);    

    sp.web.currentUser.get().then((r) => {

      let currentUser : IUser = {
        title: r['Title'] , //
        Title: r['Title'] , //
        initials: r['Title'].split(" ").map((n)=>n[0]).join(""), //Single person column
        email: r['Email'] , //Single person column
        id: r['Id'] , //
        Id: r['Id'] , //
        ID: r['Id'] , //        
        isSiteAdmin: r['IsSiteAdmin'],
        LoginName: r['LoginName'],
        Name: r['LoginName'],
        remoteID: null,
      };

      let formEntry =this.createFormEntry();
      //console.log('formEntry: currentUser', formEntry);
      this.setState({  
        formEntry: formEntry,
        loadOrder: (this.state.loadOrder === "") ? 'User' : this.state.loadOrder + ' > User',
        currentUser: currentUser,
        userLoadStatus: "Complete",
        allLoaded: (this.state.projectsLoadStatus === 'Complete' && this.state.timeTrackerLoadStatus === 'Complete') ? true : false,
        showProjectScreen: ProjectMode.False,
      });

      if (this.state.projectsLoadStatus === "Pending") {
        this.processProjects(this.state.loadData.projects);
      }

      if (this.state.timeTrackerLoadStatus === "Pending") {
        this.processTimeEntries(this.state.loadData.entries);
      }

    }).catch((e) => {
      console.log('ERROR:  catch sp.web.currentUser');
      this._processCatch(e);
    });


    // https://pnp.github.io/pnpjs/v1/sp/docs/fields/#filtering-fields
    //const includeFields = [ 'Title', 'Author', 'Editor', 'Modified', 'Created' ];
    //const filter3 = `Hidden eq false and (ReadOnlyField eq false or (${
    //    includeFields.map(field => `InternalName eq '${field}'`).join(' or ')
    //}))`;

    const includeFields = [ 'ActivityType', 'Category1', 'Category2', 'StatusTMT', 'OptionsTMTCalc', 'ActivtyURLCalc'];
    const filter3 = `(${
        includeFields.map(field => `StaticName eq '${field}'`).join(' or ')
    })`;

    //projectWeb.lists.getByTitle(useProjectList).fields.filter(filter3).inBatch(batch).get().then((response) => {
      let projListObject = this._getProjectList();
    
      projListObject.fields.filter(filter3).get().then((response) => {

        console.log('Here are selected Project List Columns: ', response);
        this.setState({  
          loadOrder: (this.state.loadOrder === "") ? 'ProjColumns' : this.state.loadOrder + ' > ProjColumns',
          projColumns : {

            statusChoices: getColumnProp( 'StaticName', 'StatusTMT','Choices', response),
            activityTMTChoices: getColumnProp( 'StaticName', 'ActivityType','Choices', response),
            category1Choices: getColumnProp( 'StaticName', 'Category1','Choices', response),
            category2Choices: getColumnProp( 'StaticName', 'Category2','Choices', response), 

            statusDefault: getColumnProp( 'StaticName', 'StatusTMT','DefaultValue', response),
            activityTMTDefault: getColumnProp( 'StaticName', 'ActivityType','DefaultValue', response),
            category1Default: getColumnProp( 'StaticName', 'Category1','DefaultValue', response),
            category2Default: getColumnProp( 'StaticName', 'Category2','DefaultValue', response),

            optionsTMTCalc: getColumnProp( 'StaticName', 'OptionsTMTCalc','Formula', response),
            activtyURLCalc: getColumnProp( 'StaticName', 'ActivtyURLCalc','Formula', response),

          }});

    }).catch((e) => {
      console.log('ERROR:  projectWeb.lists.getByTitle(useProjectList).fields.filter(filter3)',this._getProjectListTitle(), e);
      let projColumnsMessage = getHelpfullError(e);
      this.setState({  
        loadStatus: projColumnsMessage, 
        loadError: this.state.loadError + '.  ' + projColumnsMessage, 
        listError: true, //timeTrackerListError: true, 
        timeTrackerLoadError: projColumnsMessage,});
      this._processCatch(e);
    });
/***
 *                         d888b  d88888b d888888b      d8888b. d8888b.  .d88b.     d88b d88888b  .o88b. d888888b .d8888. 
 *                        88' Y8b 88'     `~~88~~'      88  `8D 88  `8D .8P  Y8.    `8P' 88'     d8P  Y8 `~~88~~' 88'  YP 
 *                        88      88ooooo    88         88oodD' 88oobY' 88    88     88  88ooooo 8P         88    `8bo.   
 *                        88  ooo 88~~~~~    88         88~~~   88`8b   88    88     88  88~~~~~ 8b         88      `Y8b. 
 *                        88. ~8~ 88.        88         88      88 `88. `8b  d8' db. 88  88.     Y8b  d8    88    db   8D 
 *                         Y888P  Y88888P    YP         88      88   YD  `Y88P'  Y8888P  Y88888P  `Y88P'    YP    `8888Y' 
 *                                                                                                                        
 *                                                                                                                        
 */


    projListObject.items
    .select(selectColsProj).expand(expandTheseProj).filter(projectRestFilter).getAll()
    .then((response) => {
      //console.log('useProjectList', response);
      console.log('fetched Project Info:', response);


      /**
       * This loop loosely increases performance by compounding number of entries.
        * End test performance loop
      */

      if (this.props.stressMultiplierProject > 1) {
        let stressProjects : any[] = [];
        for (let i = 0; i < this.props.stressMultiplierProject; i++ ) {
          //trackMyProjectsInfo.timeTrackData = trackMyProjectsInfo.timeTrackData.concat(trackMyProjectsInfo.timeTrackData);
          response.map( project => {
            let projectX = JSON.parse(JSON.stringify(project));
            projectX.Title += '-' + i;
            stressProjects.push(projectX);
          });
        }
        response = stressProjects;
      }

      trackMyProjectsInfo.projectData = response.map((p) => {
        //https://stackoverflow.com/questions/13142635/how-can-i-create-an-object-based-on-an-interface-file-definition-in-typescript

        let targetInfo : IProjectTarget = this.createProjectTimeTracking(p.TimeTarget);

        //Capturing original values for use in Project Edit screen
        let origProjectID1 = p.ProjectID1 === null ? "" : p.ProjectID1 + "";
        let origProjectID2 = p.ProjectID2 === null ? "" : p.ProjectID2 + "";
        let origComments = p.Comments === null ? "" : p.Comments + "";       

        let pOptions = [];
        if (p.OptionsTMT != null ) { pOptions = p.OptionsTMT.split(';'); }
        else if ( p.OptionsTMTCalc != null && p.OptionsTMTCalc.length>0 ) { pOptions = p.OptionsTMTCalc.split(';'); }


        //console.log('p.Options', p.OptionsTMT, pOptions);

        function getThisOption(arr: string[], splitter: string, prop: string ) {
          let theResult = null;
          for ( let m of arr ) {
            let theProp = m.length > 0 ? m.split(splitter) : null;
            if ( theProp != null && theProp[1] != null && prop.toLowerCase() === theProp[0].toLowerCase()) {  
              //console.log('getThisOption', m, theProp);
              return theProp[1];
              
            }
          }

          return theResult;

        }

        function getFontOptions(arr: string[], splitter: string ) {

          let size =getThisOption(arr, splitter, 'fSize');
          size = size == null ? getThisOption(arr, splitter, 'size') : size;

          let fontOptions: IMyFonts = {
            size: size,
            weight: getThisOption(arr, splitter, 'fWeight'),
            style: getThisOption(arr, splitter, 'fStyle'),
            color: getThisOption(arr, splitter, 'fColor'),
          };
          return fontOptions;
        }

        function getIconOptions(arr: string[], splitter: string ) {
          let iconName = getThisOption(arr, splitter, 'icon');
          iconName = iconName == null ? getThisOption(arr, splitter, 'iconName') : iconName;

          let size =getThisOption(arr, splitter, 'iSize');
          size = size == null ? getThisOption(arr, splitter, 'size') : size;

          let iconOptions: IMyIcons = {
            hasIcon: iconName == null ? false : true,
            name: iconName,
            size: iconName == null ? '' : size,
            height: iconName == null ? '' : getThisOption(arr, splitter, 'iHeight'),
            width: iconName == null ? '' : getThisOption(arr, splitter, 'iHeight'),
            margin: iconName == null ? '' : getThisOption(arr, splitter, 'iMargin'),
          };
          return iconOptions;
        }


        /**
         * Get Project Pre-made Activity Link URL
         */
        let pActivityType = p.ActivityType;  //Label part of Activity Type ( before the | )
        //Activity ID is later .split(;) so it's best to just make it empty string now.
        let pActivityID = p.ActivityTMT === null ? '' : p.ActivityTMT; //Test value from Activity Column in list
        let pActivtyOptionsCalc = p.ActivtyOptionsCalc; //Options for formatting the Icon

        let pActivityURL = p.ActivtyURLCalc;
        // To be used for if Project Activity URL is used. Syntax:  title=Title Type Activity;
        // title special words:  Replace..., IgnoreTitle, Derive
        // Special shortcuts:  title=Replace...TypeActivity - replace Title only if it's value is ...
        // Special shortcuts:  title=Replace...TypeActivity - replace Title only if it's value is ... 
        // Special shortcuts:  title=NoTitleType-Activity - replaces Project Title with just the Type-Activity values
        // Special shortcuts:  title=DeriveType-Activity - uses just Title column to derive Type and Activity fields (not recommended or programmed yet)
        // projActivityRule: string;  //title=NoTitleType-Activity

        let showLink = false;
        let thisProjectTitle = p.Title;

        /**
         * This is to allow the calculation to add these fields values if the field itself is empty
         */
        if ( pOptions.length > 0 ) {

          let checkThis = null;

          checkThis = getThisOption(pOptions, '=', 'Story');
          if ( checkThis!= null && p.Story == null ) { p.Story = checkThis; }

          checkThis = getThisOption(pOptions, '=', 'Chapter');
          if ( checkThis!= null && p.Chapter == null ) { p.Chapter = checkThis; }

          checkThis = getThisOption(pOptions, '=', 'Category1');
          if ( checkThis!= null && p.Category1 == null ) { p.Category1 = [checkThis]; }

          checkThis = getThisOption(pOptions, '=', 'Category2');
          if ( checkThis!= null && p.Category2 == null ) { p.Category2 = [checkThis]; }

          checkThis = getThisOption(pOptions, '=', 'ProjectID1');
          if ( checkThis!= null && p.ProjectID1 == null ) { p.ProjectID1 = checkThis; }

          checkThis = getThisOption(pOptions, '=', 'ProjectID2');
          if ( checkThis!= null && p.ProjectID2 == null ) { p.ProjectID2 = checkThis; }

          checkThis = getThisOption(pOptions, '=', 'ActivityTMT');
          if ( checkThis!= null && p.ActivityTMT == null ) { p.ActivityTMT = checkThis; pActivityID = checkThis; }

          checkThis = getThisOption(pOptions, '=', 'ActivityType');
          if ( checkThis!= null && p.ActivityType == null ) { p.ActivityType = checkThis; pActivityType = checkThis; }

          checkThis = getThisOption(pOptions, '=', 'Active');
          if ( checkThis!= null ) { 
            checkThis=checkThis.toLowerCase();
            if ( checkThis.indexOf('force') === 0 ){
              //Need to set like this to over-ride the column value already has value like a default:  Active=forceYes or Active=forceNo
              checkThis = checkThis.replace('force','');
              if (checkThis === 'yes') { p.Active = true; }
              if (checkThis === 'no') { p.Active = false; }
            } else if ( p.Active == null) {
              //Only set if the current value is null
              if (checkThis === 'yes') { p.Active = true; }
              if (checkThis === 'no') { p.Active = false; }
            }
          }
        }

        
        if ( pActivityURL != null && pActivityURL.length > 0 ) {
          //Intentionally skip ActivityTMT column at this point so it can be multi-mapped later when building the link.
          pActivityURL = pActivityURL.replace("[Title]",p.Title).replace("[Type]",p.ActivityType);
          pActivityURL = pActivityURL.replace("[Category1]",p.Category1).replace("[Category2]",p.Category2);
          pActivityURL = pActivityURL.replace("[ProjectID1]",p.ProjectID1).replace("[ProjectID2]",p.ProjectID2);
          pActivityURL = pActivityURL.replace("[Story]",p.Story).replace("[Chapter]",p.Chapter);
          //There is no ActivityURL Formula value so there is no URL to click.
          showLink = true;
        }

        if ( this.state.projActivityRule.rule === 'Derive' ) {

        } else if ( this.state.projActivityRule.rule === 'Replace' ) {
          thisProjectTitle = p.Title.replace('<Title>',p.Title).replace('<Type>',pActivityType).replace('<Activity>',pActivityID); 

        } else if ( this.state.projActivityRule.rule === 'IgnoreTitle' ) {
          thisProjectTitle = this.state.projActivityRule.titleMap.replace('<Type>',pActivityType).replace('<Activity>',pActivityID);

        }

        let projOptions : IProjectOptions = {
          showLink: showLink,
          activity: pActivityID,
          type: pActivityType,
          href: pActivityURL,
          title: thisProjectTitle,

          optionString: p.OptionsTMT,
          optionArray: pOptions,
          bgColor: getThisOption(pOptions,'=', 'bgColor'),
          font: getFontOptions(pOptions,'='),
          icon: getIconOptions(pOptions,'='),

          projectEditOptions: p.ProjectEditOptions == null ? defProjEditOptions : cleanEmptyElementsFromString( p.ProjectEditOptions, ';', true, 'asc' ),

        };

        //Attempt to split ActivityType by | in case formatting or icon is included.


        let leader : IUser = {
          title: 'p.' , //
          initials: 'p.' , //Single person column
          email: 'p.' , //Single person column
          Title: 'p.' , //
          id: p.LeaderId , //
          Id: p.LeaderId , //
          ID: p.LeaderId , //         
          remoteID: null, 
        };

        let team : IUser = {
          title: 'p.' , //
          Title: 'p.' , //
          initials: 'p.' , //Single person column
          email: 'p.' , //Single person column
          id: p.TeamId , //
          Id: p.TeamId , //
          ID: p.TeamId , //  
          remoteID: null,
        };

        let project : IProject = {
          projectType: 'Master',
          id: p.Id,
          editLink: null , //Link to view/edit item link
          titleProject: thisProjectTitle,

          comments: this.buildSmartText(p.Comments, origComments),
          //2020-05-13:  Replace Active with StatusTMT  when Status = 9 then active = null, Status = 8 then active = false else true
          active: this.convertStatusToActive(p.StatusNumber),
          everyone: p.Everyone,
          sortOrder: p.SortOrder,

          category1: p.Category1,
          category2: p.Category2,

          leader: p.Leader , // BE SURE TO ADD PEOPLE COLUMNS TO EXPANDED COLUMNS FIRST!
          team: p.Team, // BE SURE TO ADD PEOPLE COLUMNS TO EXPANDED COLUMNS FIRST!

          story: p.Story,
          chapter: p.Chapter,

          leaderId: p.Leader == null ? null : p.LeaderId, // BE SURE TO ADD PEOPLE COLUMNS TO EXPANDED COLUMNS FIRST!
          teamIds: p.Team == null ? null : p.TeamId, // BE SURE TO ADD PEOPLE COLUMNS TO EXPANDED COLUMNS FIRST!

          filterFlags: [],
          
          projectID1: this.buildSmartText(p.ProjectID1, origProjectID1),
          projectID2: this.buildSmartText(p.ProjectID2, origProjectID2),

          timeTarget: targetInfo,
          projOptions: projOptions,
          ccEmail: p.CCEmail,
          ccList: p.CCList,

          //Task related fields:
          status: p.StatusTMT,
          dueDate: p.DueDateTMT,
          completedDate: p.CompletedDateTMT,
          completedBy: p.CompletedByTMT == null ? null : p.CompletedByTMT, // BE SURE TO ADD PEOPLE COLUMNS TO EXPANDED COLUMNS FIRST!
          completedById: p.CompletedByTMT == null ? null : p.CompletedByTMTId, // BE SURE TO ADD PEOPLE COLUMNS TO EXPANDED COLUMNS FIRST!

          history: p.HistoryTMT,
          //Values that relate to project list item
          // sourceProject: , //Add URL back to item
        };

        return project;

      });
      //console.log('trackMyProjectsInfo:', trackMyProjectsInfo);

      if (this.state.userLoadStatus === "Complete") {
        this.processProjects(trackMyProjectsInfo.projectData);

      } else {

        let loadData = this.state.loadData;
        loadData.projects = trackMyProjectsInfo.projectData;

        this.setState({  
          loadOrder: (this.state.loadOrder === "") ? 'Project' : this.state.loadOrder + ' > Project',
          loadData:loadData,
          projectsLoadStatus: "Pending",
          showProjectScreen: ProjectMode.False,
        });

        loadData = null;
      }

    }).catch((e) => {
      console.log('ERROR:  projectWeb.lists.getByTitle(useProjectList)',this._getProjectListTitle(), e);
      let projErrMessage = getHelpfullError(e);
      this.setState({  
        loadStatus: projErrMessage, 
        loadError: this.state.loadError + '.  ' + projErrMessage, 
        listError: true, projectsListError: true, 
        projectsLoadError: projErrMessage,
        showProjectScreen: ProjectMode.False,
      });
      this._processCatch(e);
    });


  /***
 *                         d888b  d88888b d888888b      d888888b d888888b .88b  d88. d88888b 
 *                        88' Y8b 88'     `~~88~~'      `~~88~~'   `88'   88'YbdP`88 88'     
 *                        88      88ooooo    88            88       88    88  88  88 88ooooo 
 *                        88  ooo 88~~~~~    88            88       88    88  88  88 88~~~~~ 
 *                        88. ~8~ 88.        88            88      .88.   88  88  88 88.     
 *                         Y888P  Y88888P    YP            YP    Y888888P YP  YP  YP Y88888P 
 *                                                                                           
 *                                                                                           
 */  

    trackTimeWeb.lists.getByTitle(useTrackMyTimeList).items
    .select(selectColsTrack).expand(expandTheseTrack).filter(trackTimeRestFilter).orderBy(trackTimeSort,false).top(timeItems).get()
    .then((response) => {

      console.log('useTrackMyTimeList', response);


      /**
       * This loop loosely increases performance by compounding number of entries.
        * End test performance loop
      */

      if (this.props.stressMultiplierTime > 1) {
        for (let i = 0; i < this.props.stressMultiplierTime; i++ ) {
          //trackMyProjectsInfo.timeTrackData = trackMyProjectsInfo.timeTrackData.concat(trackMyProjectsInfo.timeTrackData);
          response = response.concat(response);
        }
      }

      trackMyProjectsInfo.timeTrackData = response.map((item) => {
        //https://stackoverflow.com/questions/13142635/how-can-i-create-an-object-based-on-an-interface-file-definition-in-typescript
        
        let listCategory = "";
        if ( item.Category1 !== null && item.Category1 ) {
          listCategory += item.Category1.join(', ');
        }
        if ( item.Category2 !== null && item.Category2 ) {
          listCategory += item.Category2.join(', ');
        }

        let listProjects = "";
        if ( item.ProjectID1 !== null ) {
          listProjects += item.ProjectID1;
        }
        if ( item.ProjectID2 !== null ) {
          listProjects = listProjects !== "" ? listProjects += ", " : listProjects;
          listProjects += item.ProjectID2 + ' ';
        }   

        let keyChanges = [];
        let keyChange = 'No change';
        
        if ( item.KeyChanges == null || item.KeyChanges == '' ) {} else {
          keyChanges = item.KeyChanges.split('-');
          let keyChangesLC = item.KeyChanges.toLowerCase();
          if (keyChangesLC.indexOf('hourschanged') > -1 ){
            keyChange = "Hours changed";
          } else if (keyChangesLC.indexOf('nooriginal') > -1 ){
            keyChange = "No data";
          } else if (keyChangesLC.indexOf('startchanged') > -1 ){
            keyChange = "Start changed";
          } else if (keyChangesLC.indexOf('endchanged') > -1 ){
            keyChange = "End changed";
          }
        }


        let listComments = item.Comments ? item.Comments : "";

        //Split this out for when creating test data and user may not have title.
        let userInitials = item.User.Title == null ? 'TBD' : item.User.Title.split(" ").map((n)=>n[0]).join("");

        let timeEntry : ITimeEntry = {

            //Values that would come from Project item
          id: item.Id ,
          editLink: null , //Link to view/edit item link
          titleProject : item.Title ,
          comments: this.buildSmartText(item.Comments, item.Comments),
          
          //2020-05-13:  Replace Active with StatusTMT  when Status = 9 then active = null, Status = 8 then active = false else true
          active: this.convertStatusToActive(item.StatusNumber),

          category1 : item.Category1 ,
          category2 : item.Category2 ,

          leader : item.Leader ,  //Likely single person column
          team : item.Team ,  //Likely multi person column
          story: item.Story,
          chapter: item.Chapter,

          leaderId: item.LeaderId,
          teamIds: item.TeamId,

          filterFlags: [],

          projectID1 : this.buildSmartText(item.ProjectID1, item.ProjectID1) ,  //Example Project # - look for strings starting with * and ?
          projectID2 : this.buildSmartText(item.ProjectID2, item.ProjectID2) ,  //Example Cost Center # - look for strings starting with * and ?

          //Values that relate to project list item
          sourceProject : item.SourceProject , //Link back to the source project list item.
          sourceProjectRef : item.SourceProjectRef , //Link back to the source project list item.
          activity: item.Activity ,  //Link to the activity you worked on

          //Values specific to Time Entry
          user : item.User ,  //Single person column
          userId : item.UserId ,  //Single person column
          userTitle : item.User.Title ,  //Single person column
          startTime : item.StartTime , //Time stamp
          endTime : item.EndTime , // Time stamp
          duration : item.Hours , //Number  -- May not be needed based on current testing with start and end dates.
          age: getAge(item.EndTime,"days"),
          keyChange: keyChange,
          keyChanges: keyChanges,

          //Saves what entry option was used... Since Last, Slider, Manual
          entryType : item.EntryType ,
          deltaT : item.DeltaT , //Could be used to indicate how many hours entry was made (like now, or 10 2 days in the past)
          timeEntryTBD1 : '' ,
          timeEntryTBD2 : '' ,
          timeEntryTBD3 : '' ,

          //This block for use in the history list component
          //Getting initials using:  https://stackoverflow.com/a/45867959/4210807
          userInitials: userInitials,
          listCategory: listCategory,
          listTimeSpan: getTimeSpan(item.StartTime, item.EndTime),
          listProjects: listProjects,
          listTracking: '',
          listComments: listComments,

          //Other settings and information
          created: new Date(item.Created),
          modified: new Date(item.Modified),
          createdBy: item.Author.Title,
          modifiedBy: item.Editor.Title,

          createdByID: item.Author.ID,
          modifiedByID: item.Editor.ID,

          wasModified: item.Created === item.Modified ? false : true ,
          modifiedByUser: item.UserId === item.Editor.ID ? true : false,
          createdByUser: item.UserId === item.Author.ID ? true : false,

          location : item.Location,
          settings : item.Settings,

          ccEmail: item.CCEmail,
          ccList: item.CCList,

        };
        //this.saveMyTime(timeEntry,'master');
        return timeEntry;

      });
      
      if (this.state.userLoadStatus === "Complete") {
        this.processTimeEntries(trackMyProjectsInfo.timeTrackData);

      } else {

        let loadData = this.state.loadData;
        loadData.entries = trackMyProjectsInfo.timeTrackData;

        this.setState({  
          loadOrder: (this.state.loadOrder === "") ? 'Entries' : this.state.loadOrder + ' > Entries',
          loadData:loadData,
          timeTrackerLoadStatus: "Pending",
        });

        loadData = null;
      }

    }).catch((e) => {
      console.log('ERROR:  trackTimeWeb.lists.getByTitle(useTrackMyTimeList)',useTrackMyTimeList, e);
      let projTimeMessage = getHelpfullError(e);
      this.setState({  
        loadStatus: projTimeMessage, 
        loadError: this.state.loadError + '.  ' + projTimeMessage, 
        listError: true, timeTrackerListError: true, 
        timeTrackerLoadError: projTimeMessage,
        showProjectScreen: ProjectMode.False,
      });
      this._processCatch(e);
    });

    //return batch.execute().then(() => {

      //this.processResponse(trackMyProjectsInfo);
      //return trackMyProjectsInfo;
    //});

  }  


/***
 *          .o88b.  .d8b.  d888888b  .o88b. db   db 
 *         d8P  Y8 d8' `8b `~~88~~' d8P  Y8 88   88 
 *         8P      88ooo88    88    8P      88ooo88 
 *         8b      88~~~88    88    8b      88~~~88 
 *         Y8b  d8 88   88    88    Y8b  d8 88   88 
 *          `Y88P' YP   YP    YP     `Y88P' YP   YP 
 *                                                  
 *                                                  
 */

  private _processCatch(e) {
    console.log("Can't load data");
    //var m = e.status === 404 ? "Tile List not found: " + useTileList : "Other message";
    //alert(m);
    let errMessage = getHelpfullError(e);
    console.log(e);
    console.log(e.status);
    console.log(e.message);
    let sendMessage = e.status + " - " + e.message;
    //this.setState({  loadStatus: "Not sure what happened!", loadError: e.message, listError: true, });
    this.setState({  loadStatus: errMessage, loadError: errMessage, listError: true, });
  }


/***
 *         d8888b. d8888b.  .d88b.   .o88b. d88888b .d8888. .d8888.          
 *         88  `8D 88  `8D .8P  Y8. d8P  Y8 88'     88'  YP 88'  YP          
 *         88oodD' 88oobY' 88    88 8P      88ooooo `8bo.   `8bo.            
 *         88~~~   88`8b   88    88 8b      88~~~~~   `Y8b.   `Y8b.          
 *         88      88 `88. `8b  d8' Y8b  d8 88.     db   8D db   8D          
 *         88      88   YD  `Y88P'   `Y88P' Y88888P `8888Y' `8888Y'          
 *                                                                           
 *                                                                           
 *         d8888b. d8888b.  .d88b.     d88b d88888b  .o88b. d888888b .d8888. 
 *         88  `8D 88  `8D .8P  Y8.    `8P' 88'     d8P  Y8 `~~88~~' 88'  YP 
 *         88oodD' 88oobY' 88    88     88  88ooooo 8P         88    `8bo.   
 *         88~~~   88`8b   88    88     88  88~~~~~ 8b         88      `Y8b. 
 *         88      88 `88. `8b  d8' db. 88  88.     Y8b  d8    88    db   8D 
 *         88      88   YD  `Y88P'  Y8888P  Y88888P  `Y88P'    YP    `8888Y' 
 *                                                                           
 *                                                                           
 */

  private processProjects(projectData){
    //projectData
    //console.log('projectData:  ', projectData);

    /**
     * Things we need to do during intial state
     * Populate all these arrays:
     * 
          all: IProject[];
          master: IProject[]; //Projects coming from the Projects list
          masterPriority: IProject[]; //Projects visible based on settings
          
          current: IProject[]; //Makes up the choices
          lastFiltered: IProject[];
          lastProject: IProject[];
          newFiltered: IProject[];
            
      *   Put them into state.projects
      */
     let master: IProject[] = [];
     let masterKeys: string[] = [];

     let userId = this.state.currentUser.id;

     //console.log('processProjects: userId',userId, typeof userId);
     //console.log('projectData[1].leaderId:', projectData[1].leaderId, typeof projectData[1].leaderId);

     for (let i = 0; i < projectData.length; i++ ) {
      let countThese = "all";
      let fromProject = projectData[i];
      let yours, team, isActive :boolean = false;

      //Check if project is tagged to you
      if (fromProject.teamIds && fromProject.teamIds.indexOf(userId) > -1 ) { team = true; }
      if (fromProject.leaderId === userId ) { yours = true; }
      

      if ( fromProject.active === null ) { fromProject.filterFlags.push('closed') ; countThese = 'closed'; }
      else if ( fromProject.active === false ) { fromProject.filterFlags.push('parkingLot') ; countThese = 'parkingLot'; }
      else if ( fromProject.everyone ) { fromProject.filterFlags.push('everyone') ; countThese = 'everyone'; }
      else if ( yours ) { fromProject.filterFlags.push('your') ; countThese = 'your'; }
      else if ( team ) { fromProject.filterFlags.push('team') ; countThese = 'team'; }
      else { fromProject.filterFlags.push('otherPeople' ) ; countThese = 'otherPeople'; }
      fromProject.key = this.getProjectKey(fromProject);
      if ( masterKeys.indexOf(fromProject.key) < 0 ) { 
        //This is a new project, add
        master.push(fromProject);
        masterKeys.push(fromProject.key);
      }
    }

     let all: IProject[] = master.concat(this.state.projects.all);
     let stateProjects = this.state.projects;

     stateProjects.all = all;
     stateProjects.master = master;
     stateProjects.masterKeys = masterKeys;

     let filterThese = this.state.projectType ? stateProjects.user : stateProjects.master ;

     let setPivot = !this.state.projectType ? this.state.projectMasterPriorityChoice :this.state.projectUserPriorityChoice ;
     stateProjects.newFiltered = this.getTheseProjects(filterThese, [setPivot], 'asc', 'titleProject');
     stateProjects.lastFiltered = this.state.projectType === false ? master : stateProjects.user ;

     let masterPriority: IProject[] = [];

    //private processProjects
    this.setState({  
      loadOrder: (this.state.loadOrder === "") ? 'Process Projects' : this.state.loadOrder + ' > Process Projects',
      projects: stateProjects,
      projectsLoadStatus:"Complete",
      projectsLoadError: "",
      projectsListError: false,
      projectsItemsError: false,
      allLoaded: (this.state.userLoadStatus === 'Complete' && this.state.timeTrackerLoadStatus === 'Complete') ? true : false,
      selectedProject: null,
      selectedProjectIndex: null,
      selectedProjectIndexArr : [],
      dialogMode: TMTDialogMode.False,
      showProjectScreen: ProjectMode.False,
    });
  }

  private createNewProjectCounts() {
    function createMe(){
      let yourCounts = {
        total: 0,
        today: 0,
        week: 0,
        month: 0,
        quarter: 0,
        recent: 0,
      };
      return yourCounts;
    }
    let counts = {
      all: createMe(),
      team: createMe(),
      your: createMe(),
      otherPeople: createMe(),
    };

    return counts;

  }


/***
 *         d8888b. d8888b.  .d88b.   .o88b. d88888b .d8888. .d8888.      
 *         88  `8D 88  `8D .8P  Y8. d8P  Y8 88'     88'  YP 88'  YP      
 *         88oodD' 88oobY' 88    88 8P      88ooooo `8bo.   `8bo.        
 *         88~~~   88`8b   88    88 8b      88~~~~~   `Y8b.   `Y8b.      
 *         88      88 `88. `8b  d8' Y8b  d8 88.     db   8D db   8D      
 *         88      88   YD  `Y88P'   `Y88P' Y88888P `8888Y' `8888Y'      
 *                                                                       
 *                                                                       
 *         d888888b d888888b .88b  d88. d88888b                          
 *         `~~88~~'   `88'   88'YbdP`88 88'                              
 *            88       88    88  88  88 88ooooo                          
 *            88       88    88  88  88 88~~~~~                          
 *            88      .88.   88  88  88 88.                              
 *            YP    Y888888P YP  YP  YP Y88888P                          
 *                                                                       
 *                                                                       
 */

  private processTimeEntries(timeTrackData : ITimeEntry[]){
    //trackMyProjectsInfo
    //console.log('timeTrackData:  ', timeTrackData);
    
    /**
      * Things we need to do during intial state
      * Populate all these arrays:
      *    user: IProject[]; //Projects coming from TrackMyTime list
      *    userPriority: IProject[]; //Projects visible based on settings
      *   Put them into state.projects
    */

    let counts = this.createNewProjectCounts();
    let userKeys : string[] = [];
    let allEntries: ITimeEntry[] = timeTrackData;
    let yourEntries: ITimeEntry[] = [];
    let teamEntries: ITimeEntry[] = [];
    let everyoneEntries: ITimeEntry[] = [];
    let otherEntries: ITimeEntry[] = [];


    let sessionEntries: ITimeEntry[] = [];
    let todayEntries: ITimeEntry[] = [];
    let user: IProject[] = [];
    let userPriority: IProject[] = [];

    let stateProjects = this.state.projects;
    let stateEntries: IEntryInfo = this.state.entries;
    let dateRange: number[] = [];

    let userId = this.state.currentUser.id;
     //console.log('processTimeEntries: userId',userId, typeof userId);
     //console.log('timeTrackData[1].userId:', timeTrackData[1].userId, typeof timeTrackData[1].userId);

    let thisUserParam = this.props.urlVars['User'];
    let thisUser = this.state.currentUser.title;
    if (thisUser) {
      //alert("User found thisUser: " + JSON.stringify(thisUser) )
     }
    else if (thisUserParam) {
      //alert("User found thisUserParam: " + JSON.stringify(thisUserParam) );
    } else { //alert("NOT found: " );
    }

    let lastEndTime = makeTheTimeObject(new Date(2007,0,1).toUTCString());
    let firstStarTime = makeTheTimeObject(new Date(2030,0,1).toUTCString());
    //dateRange?: string[];


    dateRange.push(firstStarTime.milliseconds);
    dateRange.push(lastEndTime.milliseconds);

    let nowEndTime = makeTheTimeObject('');
    let firstItem = nowEndTime;
    //console.log(JSON.stringify(lastEndTime));
    //alert(lastEndTime);

    let recentDays = 4;

    for (let i = 0; i < timeTrackData.length; i++ ) {
      let thisEntry : ITimeEntry = timeTrackData[i];
      let countThese = "all";
      let fromProject = this.convertToProject(thisEntry);
      let yours, team, today, week, month, quarter, recent :boolean = false;
      let thisEndTime = makeTheTimeObject(thisEntry.endTime); 
      thisEntry.thisTimeObj = makeTheTimeObject(thisEntry.startTime); 
      //alert(thisEndTime);
      //Check if timeTrackData is tagged to you
      if (thisEntry.userId === userId ) { yours = true; } 
      if (yours) { 
        fromProject.filterFlags.push('your');
        thisEntry.filterFlags.push('your');
        countThese = 'your'; 
        //Checks for latest end time
        if ( thisEndTime.milliseconds > lastEndTime.milliseconds  ) {
          //Only update lastEndTime if it's in the past.
          if ( thisEndTime.milliseconds < nowEndTime.milliseconds) {
            lastEndTime = thisEndTime;
          }
        }
      }

      /**
       * Add logic for coreTime
       *       coreTime?: string;
       *       hoursEarly?: number;
       *       hoursLate?: number;
       */
      thisEntry.hoursEarly = 0;
      thisEntry.hoursLate = 0;
      thisEntry.hoursWeekEnd = 0;        
      thisEntry.hoursHoliday = 0;
      thisEntry.hoursNormal = 0;
      thisEntry.hoursUnknown = 0;

      let theseHours = Number(thisEntry.duration);

      //If Hours is to long ( > normal work duration ) set unknown... likely error or to complex to calculate.
      if ( theseHours > ( 18 - 8 )) {
        thisEntry.coreTime = 'Unknown';
        thisEntry.hoursUnknown = theseHours;

      //If StartTime is holiday, the entire entry is considered holiday.
      } else if ( thisEntry.thisTimeObj.coreTime === 'Holiday' ) {
        thisEntry.coreTime = 'Holiday';
        thisEntry.hoursHoliday = theseHours;

      //Else if StartTime is Weekend, then entire entry is considered weekend
      } else if ( thisEntry.thisTimeObj.coreTime === 'Weekend' ) {
        thisEntry.coreTime = 'Weekend';
        thisEntry.hoursWeekEnd = theseHours;

      //Else if Start and End are Normal, all hours are normal
      } else if ( thisEntry.thisTimeObj.coreTime === 'Normal' && thisEndTime.coreTime === 'Normal' ) {
        thisEntry.coreTime = 'Normal';
        thisEntry.hoursNormal = theseHours;

      //Else if StartTime is Late, then entire entry is considered Late
      } else if ( thisEntry.thisTimeObj.coreTime === 'Late' ) {
        thisEntry.coreTime = 'Late';
        thisEntry.hoursLate = theseHours;

      //Else if EndTime is Early, then entire entry is considered Early
      } else if ( thisEndTime.coreTime === 'Early' ) {
        thisEntry.coreTime = 'Early';
        thisEntry.hoursEarly = theseHours;

      //Else if Start is Early, then part of hours are considered Early
      } else if ( thisEntry.thisTimeObj.coreTime === 'Early' ) {
        thisEntry.coreTime = 'Early';
        thisEntry.hoursEarly = thisEntry.thisTimeObj.hoursEarly;
        thisEntry.hoursNormal = theseHours - thisEntry.hoursEarly;

      //Else if EndTime is Late, then part of hours are considered Late
      } else if ( thisEndTime.coreTime === 'Late' ) {
        thisEntry.coreTime = 'Late';
        thisEntry.hoursLate = thisEndTime.hoursLate;
        thisEntry.hoursNormal = theseHours - thisEntry.hoursLate;
        if (thisEntry.hoursNormal < 0 ) {
          console.log('found problem here');
        }
      }

      if ( thisEntry.thisTimeObj.milliseconds < dateRange[0] ) { dateRange[0] = thisEntry.thisTimeObj.milliseconds; }
      if ( thisEndTime.milliseconds > dateRange[1] ) { dateRange[1] = thisEndTime.milliseconds; }

      if ( thisEntry.thisTimeObj.milliseconds < firstItem.milliseconds ) { firstItem = thisEntry.thisTimeObj; }

      //Check if project is tagged to you
      if (fromProject.teamIds.indexOf(userId) > -1 ) { team = true; } 
      if (fromProject.leaderId === userId ) { team = true; } 
      

      if (!yours  && team) { 
        fromProject.filterFlags.push('team');
        thisEntry.filterFlags.push('team');
        countThese = 'team'; 
      }

      if (!yours && !team) { 
        fromProject.filterFlags.push('otherPeople');
        thisEntry.filterFlags.push('otherPeople');
        countThese = 'otherPeople';
      }


      //Build up options to search on
      thisEntry.searchStringPC = this.getEntrySearchString(thisEntry);
      thisEntry.searchString = thisEntry.searchStringPC.toLowerCase();

      let daysSince = thisEntry.age;
      counts[countThese].total ++;

      if ( daysSince === 0 ) { today = true;
        fromProject.filterFlags.push('today') ;
        thisEntry.filterFlags.push('today') ;
        thisEntry.timeGroup = '1. Ended Today';
        counts[countThese].today ++ ; }

      else if ( daysSince < 0 ) { today = true;
        fromProject.filterFlags.push('today') ;
        thisEntry.filterFlags.push('today') ;
        thisEntry.timeGroup = '0. These went Back to the Future :)';
          counts[countThese].today ++ ; }

      else if ( daysSince <= 1 ) { today = true;
        fromProject.filterFlags.push('today') ;
        thisEntry.filterFlags.push('today') ;
        thisEntry.timeGroup = '1. Ended Today';
        counts[countThese].today ++ ; }

      else if ( daysSince <= 7 ) { week = true;
        fromProject.filterFlags.push('week') ;
        thisEntry.filterFlags.push('week') ;
        thisEntry.timeGroup = '2. Ended Past Week';
        counts[countThese].week ++ ; }

      else if ( daysSince <= 31 ) { month = true;
        fromProject.filterFlags.push('month') ;
        thisEntry.filterFlags.push('month') ;
        thisEntry.timeGroup = '3. Ended Past Month';
        counts[countThese].month ++ ; }

      else if ( daysSince <= 91 ) { month = true;
        fromProject.filterFlags.push('quarter') ;
        thisEntry.filterFlags.push('quarter') ;
        thisEntry.timeGroup = '4. Ended Past Quarter';
        counts[countThese].quarter ++ ; }

      else if ( daysSince <= 365 ) { month = true;
        fromProject.filterFlags.push('quarter') ;
        thisEntry.filterFlags.push('quarter') ;
        thisEntry.timeGroup = '5. Ended Past Year';
        counts[countThese].quarter ++ ; }

      else if ( daysSince <= 730*4 ) { month = true;
        fromProject.filterFlags.push('quarter') ;
        thisEntry.filterFlags.push('quarter') ;
        thisEntry.timeGroup = '6. Ended a LONG time ago';
        counts[countThese].quarter ++ ; }

      else if ( daysSince <= recentDays ) { recent = true;
        fromProject.filterFlags.push('recent') ;
        thisEntry.filterFlags.push('recent') ;
        thisEntry.timeGroup = '5. Ended Who knows when :)';
        counts[countThese].recent ++ ;
       }
                  
      if (userKeys.indexOf(fromProject.key) < 0) { 
        //This is a new project, add
        user.push(fromProject);
        userKeys.push(fromProject.key);
      }
/*

      allEntries.push(thisEntry);
*/
      if (thisEntry.filterFlags.indexOf('today') > -1) { 
        todayEntries.push(thisEntry);
      }
      if (thisEntry.filterFlags.indexOf('your') > -1) { 
        yourEntries.push(thisEntry);
      }
      if (thisEntry.filterFlags.indexOf('team') > -1) { 
        teamEntries.push(thisEntry);
      }
      if (thisEntry.filterFlags.indexOf('everyone') > -1) { 
        everyoneEntries.push(thisEntry);
      }
      if (thisEntry.filterFlags.indexOf('otherPeople') > -1) { 
        everyoneEntries.push(thisEntry);
      } 


    }

    //console.log('nowEndTime', JSON.stringify(nowEndTime));
    if ( lastEndTime.milliseconds > nowEndTime.milliseconds  ) {
      lastEndTime = nowEndTime;
    }

   let all: IProject[] = this.state.projects.all.concat(user);
   stateProjects.all = all;
   stateProjects.user = user;

   let filterThese = this.state.projectType ? stateProjects.user : stateProjects.master ;
   let setPivot = !this.state.projectType ? this.state.projectMasterPriorityChoice :this.state.projectUserPriorityChoice ;
   stateProjects.newFiltered = this.getTheseProjects(filterThese, [setPivot], 'asc', 'titleProject');
   stateProjects.lastFiltered = stateProjects.newFiltered ;

   stateProjects.userKeys = userKeys;

       /* 2019-12-17: Testing here     2019-12-17: Testing here   */
    stateEntries.all = allEntries;
    stateEntries.user = yourEntries;
    stateEntries.your = yourEntries;
    stateEntries.team = teamEntries;
    stateEntries.everyone = everyoneEntries;
    stateEntries.other = otherEntries;  
    stateEntries.today = todayEntries;
    stateEntries.newFiltered = allEntries;
    stateEntries.lastFiltered = allEntries;  
    stateEntries.dateRange = dateRange;
    stateEntries.firstItem = firstItem;

    //Change from sinceLast if the time is longer than x- hours ago.
    let hoursSinceLastTime = this.state.currentTimePicker === 'sinceLast' && getTimeDelta( lastEndTime.theTime, new Date() , 'hours');
    console.log('currentTimePicker state:', this.state);
    console.log('currentTimePicker hoursSinceLastTime:', hoursSinceLastTime);

    let currentTimePicker = 
    ( hoursSinceLastTime >  2 ) 
    ?  'slider'
    : this.state.currentTimePicker ;

    let formEntry = this.state.formEntry;
    formEntry.entryType = currentTimePicker;

   this.setState({
    loadOrder: (this.state.loadOrder === "") ? 'Process Entries' : this.state.loadOrder + ' > Process Entries',
    projects: stateProjects,
    userCounts: counts,
    entries: stateEntries,
    currentTimePicker: currentTimePicker,
    lastEndTime: lastEndTime,
    allEntries: timeTrackData,
    filteredEntries: timeTrackData,
    timeTrackerLoadStatus:"Complete",
    timeTrackerLoadError: "",
    timeTrackerListError: false,
    timeTrackerItemsError: false,
    formEntry: formEntry,
    allLoaded: (this.state.userLoadStatus === 'Complete' && this.state.projectsLoadStatus === 'Complete') ? true : false,
   });

  }


  private getEntrySearchString(thisEntry: ITimeEntry){

          //Build up options to search on
          let searchStringPC = 
          ['id:' + thisEntry.id ,
          'day:' + thisEntry.thisTimeObj.dayYYYYMMDD,
          'user:' + thisEntry.userTitle ,
          'story:' + thisEntry.story ,
          'chapter:' + thisEntry.chapter ,
          'projects:' + thisEntry.listProjects ,
          'category:' + thisEntry.listCategory ,
          'entry:' + thisEntry.entryType ,
          'titleProject:' + thisEntry.titleProject ,
          'coreTime:' + thisEntry.coreTime ,
          'keyChanges:' + thisEntry.keyChanges.join(';') ,
          'comments:' + thisEntry.comments.value ,
          ].join(' | ');

          return searchStringPC;

  }

/***
 *         .d8888.  .d8b.  db    db d88888b      d888888b d888888b .88b  d88. d88888b 
 *         88'  YP d8' `8b 88    88 88'          `~~88~~'   `88'   88'YbdP`88 88'     
 *         `8bo.   88ooo88 Y8    8P 88ooooo         88       88    88  88  88 88ooooo 
 *           `Y8b. 88~~~88 `8b  d8' 88~~~~~         88       88    88  88  88 88~~~~~ 
 *         db   8D 88   88  `8bd8'  88.             88      .88.   88  88  88 88.     
 *         `8888Y' YP   YP    YP    Y88888P         YP    Y888888P YP  YP  YP Y88888P 
 *                                                                                    
 *                                                                                    
 */

  private saveMyTime (trackTimeItem: ISaveEntry , masterOrRemote : string) {
    //trackTimeItem = current this.state.formEntry


    let teamId = { results: [] };
    if (trackTimeItem.teamIds) { teamId = { results: trackTimeItem.teamIds } ; }

    let category1 = { results: [] };
    if (trackTimeItem.category1) { category1 = { results: trackTimeItem.category1 } ; }

    let category2 = { results: [] };
    if (trackTimeItem.category2) { category2 = { results: trackTimeItem.category2 } ; }

    let itemStartTime;
    let itemEndTime;

    if (this.state.currentTimePicker === 'sinceLast') {
      itemStartTime = new Date(this.state.lastEndTime.theTime).toLocaleString();
      itemEndTime = new Date().toLocaleString();

    } else if (this.state.currentTimePicker === 'slider') {
      itemStartTime = this.state.formEntry.startTime;
      itemEndTime = this.state.formEntry.endTime;

    } else if (this.state.currentTimePicker === 'manual') {
      console.log('saveMyTime start', this.state.formEntry.startTime);
      console.log('saveMyTime end', this.state.formEntry.endTime);
      itemStartTime = this.state.formEntry.startTime;
      itemEndTime = this.state.formEntry.endTime;   

    } else if (this.state.currentTimePicker === 'start') {

      itemStartTime = new Date().toLocaleString();
      itemEndTime = new Date().toLocaleString();   
      console.log('startMyTime start', itemStartTime);
      console.log('startMyTime end', itemEndTime);
    } else {
      
      itemStartTime = new Date(this.state.lastEndTime.theTime).toLocaleString();
      itemEndTime = new Date().toLocaleString();
    }

    let comments = trackTimeItem.comments ? trackTimeItem.comments.value : null;
    let projectID1 = trackTimeItem.projectID1 ? trackTimeItem.projectID1.value : null;
    let projectID2 = trackTimeItem.projectID2 ? trackTimeItem.projectID2.value : null;

    if (trackTimeItem.comments.defaultIsPrefix) {comments = trackTimeItem.comments.prefix + comments; }
    if (trackTimeItem.projectID1.defaultIsPrefix) {projectID1 = trackTimeItem.projectID1.prefix + projectID1; }
    if (trackTimeItem.projectID2.defaultIsPrefix) {projectID2 = trackTimeItem.projectID2.prefix + projectID2; }


    let Activity = {
      Description: trackTimeItem.activity.Description ?  trackTimeItem.activity.Description : null,
      Url: trackTimeItem.activity.Url ? trackTimeItem.activity.Url : null,
    };

    let OriginalHours = getTimeDelta(itemStartTime, itemEndTime, 'hours');
//    alert (OriginalHours);



    let saveThisItem = {
        //Values that would come from Project item
        //editLink : ILink, //Link to view/edit item link
        Title: trackTimeItem.titleProject,
        Comments: comments,
        Category1: category1,
        Category2: category2,
        LeaderId: trackTimeItem.leaderId,  //Likely single person column
        TeamId: teamId,  //Likely multi person column

        Story: trackTimeItem.story,
        Chapter: trackTimeItem.chapter,

        ProjectID1: projectID1,  //Example Project # - look for strings starting with * and ?
        ProjectID2: projectID2,  //Example Cost Center # - look for strings starting with * and ?

        //Values that relate to project list item
        SourceProject: trackTimeItem.sourceProject, //Link back to the source project list item.
        SourceProjectRef: trackTimeItem.sourceProjectRef, //Link back to the source project list item.
        Activity: Activity, //Link to the activity you worked on
        //CCList: trackTimeItem.ccList, //Link to CC List to copy item
        //CCEmail: trackTimeItem.ccEmail, //Email to CC List to copy item 
        
        //Values specific to Time Entry
        UserId: this.state.currentUser.Id,  //Single person column
        StartTime: itemStartTime, //Time stamp
        EndTime: itemEndTime, // Time stamp
        //Duration: trackTimeItem.duration, //Number  -- May not be needed based on current testing with start and end dates.
        OriginalStart: itemStartTime,
        OriginalEnd: itemEndTime,
        OriginalHours: OriginalHours,


        //Saves what entry option was used... Since Last, Slider, Manual
        EntryType: trackTimeItem.entryType,
        DeltaT: 999, //Could be used to indicate how many hours entry was made (like now, or 10 2 days in the past)
        //timeEntryTBD1: string,
        //timeEntryTBD2: string,
        //timeEntryTBD3: string,  

        //Other settings and information
        Location: trackTimeItem.location, // Location
        Settings: trackTimeItem.settings,

    };
/*
    const allKeys = Object.keys(saveThisItem);
    let saveThisItemNew = {}; 
    for (let key of allKeys){
      let thisElement = saveThisItem[key];
      if (saveThisItem[key]) { saveThisItemNew.push( {key : thisElement})}
    }
    */
     
    let useTrackMyTimeList: string = strings.DefaultTrackMyTimeListTitle;
    if ( this.props.timeTrackListTitle ) {
      useTrackMyTimeList = this.props.timeTrackListTitle;
    }
  
    let useTrackMyTimeWeb: string = this.state.timeTrackerListWeb;

    //console.log('this.props',this.props);
    //console.log('this.state',this.state);
    console.log('trackTimeItem',trackTimeItem);
    console.log('saveThisItem',saveThisItem);
    
    //Updated Jan 5, 2020 per https://pnp.github.io/pnpjs/getting-started/
    const trackTimeWeb = Web(useTrackMyTimeWeb);

    if (masterOrRemote === 'master'){
      trackTimeWeb.lists.getByTitle(useTrackMyTimeList).items.add( saveThisItem ).then((response) => {
        //Reload the page
        console.log('save response', response);

          this.addThisItemToState(trackTimeItem,masterOrRemote, response);
          alert('save successful');
        }).catch((e) => {
        //Throw Error
        this._processCatch(e);
      });
    } else if (masterOrRemote === 'remote'){
      trackTimeWeb.getList("/sites/Templates/Tmt/Lists/TrackMyTime/").items.add( saveThisItem ).then((response) => {
        //Reload the page
        //location.reload();
          alert('save successful');
        }).catch((e) => {
        //Throw Error
        this._processCatch(e);
      });

    }

  }

  /***
 *          .d8b.  d8888b. d8888b.      d888888b d888888b d88888b .88b  d88. 
 *         d8' `8b 88  `8D 88  `8D        `88'   `~~88~~' 88'     88'YbdP`88 
 *         88ooo88 88   88 88   88         88       88    88ooooo 88  88  88 
 *         88~~~88 88   88 88   88         88       88    88~~~~~ 88  88  88 
 *         88   88 88  .8D 88  .8D        .88.      88    88.     88  88  88 
 *         YP   YP Y8888D' Y8888D'      Y888888P    YP    Y88888P YP  YP  YP 
 *                                                                           
 *                                                                           
 *         d888888b  .d88b.       .d8888. d888888b  .d8b.  d888888b d88888b  
 *         `~~88~~' .8P  Y8.      88'  YP `~~88~~' d8' `8b `~~88~~' 88'      
 *            88    88    88      `8bo.      88    88ooo88    88    88ooooo  
 *            88    88    88        `Y8b.    88    88~~~88    88    88~~~~~  
 *            88    `8b  d8'      db   8D    88    88   88    88    88.      
 *            YP     `Y88P'       `8888Y'    YP    YP   YP    YP    Y88888P  
 *                                                                           
 *                                                                           
 */
  private addThisItemToState (trackTimeItem: ISaveEntry , masterOrRemote : string, response) {

    if (masterOrRemote === 'master') {
      console.log('trackTimeItem', trackTimeItem);
      let created = new Date();

      let listCategory = "";
      if ( trackTimeItem.category1 !== null && trackTimeItem.category1 ) {
        listCategory += trackTimeItem.category1.join(', ');
      }
      if ( trackTimeItem.category2 !== null && trackTimeItem.category2 ) {
        listCategory += trackTimeItem.category2.join(', ');
      }
      let listTimeSpan = getTimeSpan(response.data.StartTime, response.data.EndTime);
      let listComments = trackTimeItem.comments ? trackTimeItem.comments.value : "";
      let listProjects = "";
      if ( trackTimeItem.projectID1 !== null && trackTimeItem.projectID1.value ) {
        listProjects += trackTimeItem.projectID1.value + ' ';
      }
      if ( trackTimeItem.projectID2 !== null && trackTimeItem.projectID2.value ) {
        listProjects += trackTimeItem.projectID2.value + ' ';
      }   

      
      let hoursEarly = 0;
      let hoursLate = 0;
      let hoursWeekEnd = 0;        
      let hoursHoliday = 0;
      let hoursNormal = 0;
      let hoursUnknown = 0;
      let coreTime = '';

      let theseHours = Number(response.data.OriginalHours);
      let thisTimeObj = makeTheTimeObject(trackTimeItem.startTime); 
      let thisEndTime = makeTheTimeObject(trackTimeItem.endTime); 

      //If Hours is to long ( > normal work duration ) set unknown... likely error or to complex to calculate.
      if ( theseHours > ( 18 - 8 )) {
        coreTime = 'Unknown';
        hoursUnknown = theseHours;

      //If StartTime is holiday, the entire entry is considered holiday.
      } else if ( thisTimeObj.coreTime === 'Holiday' ) {
        coreTime = 'Holiday';
        hoursHoliday = theseHours;

      //Else if StartTime is Weekend, then entire entry is considered weekend
      } else if ( thisTimeObj.coreTime === 'Weekend' ) {
        coreTime = 'Weekend';
        hoursWeekEnd = theseHours;

      //Else if Start and End are Normal, all hours are normal
      } else if ( thisTimeObj.coreTime === 'Normal' && thisEndTime.coreTime === 'Normal' ) {
        coreTime = 'Normal';
        hoursNormal = theseHours;

      //Else if StartTime is Late, then entire entry is considered Late
      } else if ( thisTimeObj.coreTime === 'Late' ) {
        coreTime = 'Late';
        hoursLate = theseHours;

      //Else if EndTime is Early, then entire entry is considered Early
      } else if ( thisEndTime.coreTime === 'Early' ) {
        coreTime = 'Early';
        hoursEarly = theseHours;

      //Else if Start is Early, then part of hours are considered Early
      } else if ( thisTimeObj.coreTime === 'Early' ) {
        coreTime = 'Early';
        hoursEarly = thisTimeObj.hoursEarly;
        hoursNormal = theseHours - hoursEarly;

      //Else if EndTime is Late, then part of hours are considered Late
      } else if ( thisEndTime.coreTime === 'Late' ) {
        coreTime = 'Late';
        hoursLate = thisEndTime.hoursLate;
        hoursNormal = theseHours - hoursLate;
        if (hoursNormal < 0 ) {
          console.log('found problem here');
        }
      }

      let newEntry : ITimeEntry = {...trackTimeItem,
        user: this.state.currentUser,
        userInitials: "You!",
        userId: response.data.UserId,
        userTitle: response.data.UserTitle,
        filterFlags: ["your","session"],
        timeGroup: "0. This browser session",
        duration: theseHours.toFixed(),
        age: getAge(trackTimeItem.endTime,"days"),
        category1: trackTimeItem.category1 == null || trackTimeItem.category1.length === 0 ? null : trackTimeItem.category1,
        category2: trackTimeItem.category2 == null || trackTimeItem.category2.length === 0 ? null : trackTimeItem.category2,
        teamIds: trackTimeItem.teamIds == null || trackTimeItem.teamIds.length === 0 ? null : trackTimeItem.teamIds,
        deltaT: response.data.DeltaT,
        created: created,
        modified: created,
        createdBy: this.state.currentUser.Id,
        modifiedBy: this.state.currentUser.Id,
        keyChange: '',
        keyChanges: [],
        listCategory: listCategory,
        listComments: listComments,
        listTimeSpan: listTimeSpan,
        listProjects: listProjects,
        id: response.data.Id,
        entryType: response.data.EntryType,
        comments: this.buildSmartText(response.data.Comments, response.data.Comments),
        projectID1 : this.buildSmartText(response.data.ProjectID1, response.data.ProjectID1) ,  //Example Project # - look for strings starting with * and ?
        projectID2 : this.buildSmartText(response.data.ProjectID2, response.data.ProjectID2) ,  //Example Cost Center # - look for strings starting with * and ?
        thisTimeObj: makeTheTimeObject(response.data.StartTime, response.data.StartTime),
      
        hoursEarly : hoursEarly,
        hoursLate : hoursLate,
        hoursWeekEnd : hoursWeekEnd,
        hoursHoliday : hoursHoliday,
        hoursNormal : hoursNormal,
        hoursUnknown : hoursUnknown,
        coreTime : coreTime,

      };

      //2020-04-07:  Add search string to state entries so it can be filtered
      newEntry.searchStringPC = this.getEntrySearchString(newEntry);
      newEntry.searchString = newEntry.searchStringPC.toLowerCase();

      let entries = this.state.entries;

      let thisEntry: ITimeEntry[] = [];
      thisEntry.push(newEntry);
      entries.all = thisEntry.concat(entries.all);
      entries.lastFiltered = thisEntry.concat(entries.lastFiltered);
      entries.user = thisEntry.concat(entries.user);
      entries.session = thisEntry.concat(entries.session);      
      entries.newFiltered = thisEntry.concat(entries.newFiltered);   

      let filteredEntries:  ITimeEntry[] = [];
      filteredEntries.push(newEntry);
      filteredEntries = filteredEntries.concat(this.state.filteredEntries);
      console.log( 'newEntry', newEntry);
      let lastEndTime = makeTheTimeObject(newEntry.endTime); 

      /**
       * 2020-02-13:  Added this to update formEntry time to "Now" if save was successful.
       * Before this, if you used slider for instance, it would keep the times the same.
       * This may lead a person to put in 2 entries for the same itme.
       */
      let formEntry = this.state.formEntry;
      let now = new Date();
      formEntry.startTime = now.toLocaleString();
      formEntry.endTime = now.toLocaleString();

      this.setState({
        entries:entries,
        filteredEntries:filteredEntries,
        lastEndTime: lastEndTime,
        formEntry: formEntry,
      });
    } else {
      //Currently do nothing
    }
  }


  /**
   * Copied from Pivot-Tiles
   * @param thisProps 
   * @param findMe 
   * @param findOp 
   */
  private getKeysLike(thisProps,findMe,findOp){
    //Sample call:  getKeysLike(this.props,"col","begins")
    //console.log('FoundProps that ' + findOp + ' with ' + findMe);
    //console.log(thisProps);
    const allKeys = Object.keys(thisProps);
    let foundKeys = [];
    const lFind = findMe.length;

    findMe = findMe.toLowerCase();
    findOp = findOp.toLowerCase();

    if (findOp==="begins") {
      foundKeys = allKeys.filter(k => k.toLowerCase().indexOf(findMe) === 0);
    } else if (findOp === "ends") {
      foundKeys = allKeys.filter(k => k.toLowerCase().indexOf(findMe) === ( k.length - lFind));
    } else {
      foundKeys = allKeys.filter(k => k.toLowerCase().indexOf(findMe) > -1);
    }

    let foundProps = [];
    for (let thisProp of foundKeys) {
      if (thisProp && thisProp !== "" ) { foundProps.push(thisProps[thisProp]) ; }
    }

    return foundProps;
  }

  /***
 *          d888b  d88888b d8b   db d88888b d8888b.  .d8b.  db                           
 *         88' Y8b 88'     888o  88 88'     88  `8D d8' `8b 88                           
 *         88      88ooooo 88V8o 88 88ooooo 88oobY' 88ooo88 88                           
 *         88  ooo 88~~~~~ 88 V8o88 88~~~~~ 88`8b   88~~~88 88                           
 *         88. ~8~ 88.     88  V888 88.     88 `88. 88   88 88booo.                      
 *          Y888P  Y88888P VP   V8P Y88888P 88   YD YP   YP Y88888P                      
 *                                                                                       
 *                                                                                       
 *         d88888b db    db  .o88b. d8b   db d888888b d888888b  .d88b.  d8b   db .d8888. 
 *         88'     88    88 d8P  Y8 888o  88 `~~88~~'   `88'   .8P  Y8. 888o  88 88'  YP 
 *         88ooo   88    88 8P      88V8o 88    88       88    88    88 88V8o 88 `8bo.   
 *         88~~~   88    88 8b      88 V8o88    88       88    88    88 88 V8o88   `Y8b. 
 *         88      88b  d88 Y8b  d8 88  V888    88      .88.   `8b  d8' 88  V888 db   8D 
 *         YP      ~Y8888P'  `Y88P' VP   V8P    YP    Y888888P  `Y88P'  VP   V8P `8888Y' 
 *                                                                                       
 *                                                                                       
 */

  /**
   * Copied from Pivot-Tiles
   * @param lookupColumns 
   */
  private getSelectColumns(lookupColumns){

    let baseSelectColumns = [];

    for (let thisColumn of lookupColumns) {
      // Only look at columns with / in the name
      if (thisColumn && thisColumn.indexOf("/") > -1 ) {
        let isLookup = thisColumn.indexOf("/");
        if(isLookup) {
          baseSelectColumns.push(thisColumn);
        }
      }
    }
    return baseSelectColumns;
  }

  /**
   * Copied from Pivot-Tiles
   * @param lookupColumns 
   */
  private getExpandColumns(lookupColumns){

    let baseExpandColumns = [];

    for (let thisColumn of lookupColumns) {
      // Only look at columns with / in the name
      if (thisColumn && thisColumn.indexOf("/") > -1 ) {
        let splitCol = thisColumn.split("/");
        let leftSide = splitCol[0];
        if(baseExpandColumns.indexOf(leftSide) < 0) {
          baseExpandColumns.push(leftSide);
        }
      }
    }
    return baseExpandColumns;
  }

}