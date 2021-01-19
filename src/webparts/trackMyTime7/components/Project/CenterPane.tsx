import * as React from 'react';

import * as strings from 'TrackMyTime7WebPartStrings';

//import * as links from './AllLinks';

import { ChartControl, ChartType } from '@pnp/spfx-controls-react/lib/ChartControl';
import { CompoundButton, Stack, IStackTokens, elementContains, Link, ILinkProps, DefaultButton, arraysEqual } from 'office-ui-fabric-react';
import { IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';

import { ITrackMyTime7Props } from '../ITrackMyTime7Props';
import { ITrackMyTime7State, IProjectOptions } from '../ITrackMyTime7State';

import { ColoredLine, ProjectTitleElement, MyIcon } from '../../../../services/drawServices';

import { createIconButton } from "../createButtons/IconButton";

import styles from '../createButtons/CreateButtons.module.scss';
import ReactAccordion from '../AccordionReact/ReactAccordion';

//import styles from './InfoPane.module.scss';

//import * as choiceBuilders from '../fields/choiceFieldBuilder';

//import { Toggle } from 'office-ui-fabric-react/lib/Toggle';


export const defCenterIconStyle = {
    name: null,
    color: 'green',
    size: 72,
    weight: null,
};

export const defSmallCenterIconStyle = {
    name: null,
    color: 'green',
    size: 36,
    weight: null,
};

export interface ICenterPaneProps {
    showCenter: boolean;
    allLoaded: boolean;
    projectIndex: number;
    parentProps: ITrackMyTime7Props;
    parentState: ITrackMyTime7State;
    _onActivityClick: any;

}

export interface ICenterPaneState {

}

export default class CenterPane extends React.Component<ICenterPaneProps, ICenterPaneState> {


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

public constructor(props:ICenterPaneProps){
    super(props);
    this.state = { 

    };

    // because our event handler needs access to the component, bind 
    //  the component to the function so it can get access to the
    //  components properties (this.props)... otherwise "this" is undefined
    // this.onLinkClick = this.onLinkClick.bind(this);

    
  }


  public componentDidMount() {
    
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

    public render(): React.ReactElement<ICenterPaneProps> {
        //console.log('centerPanes.tsx', this.props, this.state);

        //This checks for case where your projects are based on Time items, not the project list.
        //Time items do not have projOptions prop so it will cause a crash error.
        // parentState.projectType === false for a real project and true if it's based on Time items
        let validProject = this.props.parentState.projectType !== false ? null :
            this.props.parentState.projects.newFiltered[this.props.projectIndex];

        let selectedProject = this.props.parentState.selectedProject;
        let updateKey : string = 'ttpbm79';

        let hasProject = selectedProject !== null && selectedProject !== undefined ? true : false;
        let dangerouslyExpandIndex = null;

        if ( this.props.allLoaded && this.props.showCenter && this.props.projectIndex > -1  && validProject != null ) {

            let projOptions = validProject.projOptions;

            let ActivityLinkElement = projOptions.showLink == false ? null : this.ActivityLink(projOptions, this.props._onActivityClick);
            if ( projOptions.activity.length === 0 ) { dangerouslyExpandIndex = 0; }

            let thisProjectElement : any[] = [];
            let thisProjectElementHeader : any = null;

            if ( this.props.parentProps.centerPaneFields.length > 0 && hasProject === true ) {

                updateKey = selectedProject.titleProject;
                let warnLabelStyle: any = {fontWeight: 'bolder', paddingRight: '5px' };
                let warnDivMargin: any = { marginBottom: '15px' };

                if ( selectedProject.dueInfo.isLate === true ) {
                    thisProjectElementHeader = <div><div><span style={ warnLabelStyle } >WARNING:</span> { selectedProject.dueInfo.warnLabel.replace('Warning:', '') }</div>
                            <div style={ warnDivMargin }><span style={{fontWeight: 'bolder' }} >Due Date:</span>{ selectedProject.dueInfo.detailLabel.replace('Due Date:', '') }</div></div> ;

                } else if ( selectedProject.dueInfo.isDue === true ) {
                    thisProjectElementHeader = <div><div><span style={ warnLabelStyle } >WARNING</span> { selectedProject.dueInfo.warnLabel.replace('Warning:', '') } </div>
                            <div style={ warnDivMargin }><span style={ warnLabelStyle } >Due Date:</span>{ selectedProject.dueInfo.detailLabel.replace('Due Date:', '') }</div></div> ;
                }

                thisProjectElement = this.buildPropPairs( selectedProject, thisProjectElement, ['lastUsed.theTime'] , [] ,false ) ;

                this.props.parentProps.centerPaneFields.map( field => {
                    //description: 'coma separted: title,projectID,category,story,task,team',

                    if ( field === 'story' ){  
                        thisProjectElement = this.buildPropPairs( selectedProject, thisProjectElement, ['story','chapter'] , [] , false ) ; }

                    if ( field === 'projectid' ){ 
                        thisProjectElement = this.buildPropPairs( selectedProject, thisProjectElement, ['projectID1','projectID2'] , [] , false ) ; }

                    if ( field === 'category' ){  
                        thisProjectElement = this.buildPropPairs( selectedProject, thisProjectElement, ['category1','category2'] , [] , false ) ; }

                    if ( field === 'task' ){
                        thisProjectElement = this.buildPropPairs( selectedProject, thisProjectElement, ['status','dueDate'] , [] , false ) ;
                        thisProjectElement = this.buildPropPairs( selectedProject, thisProjectElement, ['completedBy.Title','completedDate'] , [] , false ) ; }

                    if ( field === 'hours' ){
                        if ( selectedProject.yourHours === selectedProject.allHours ) {
                            thisProjectElement = this.buildPropPairs( selectedProject, thisProjectElement, ['yourHours' ] , ['Today ~ Week ~ All'] , false ) ;
                        } else {
                            thisProjectElement = this.buildPropPairs( selectedProject, thisProjectElement, ['yourHours', 'allHours'] , ['Today ~ Week ~ All','Today ~ Week ~ All'] , false ) ;
                        }
                    }
                    if ( field === 'counts' ){
                        if ( selectedProject.yourCounts === selectedProject.allCounts ) {
                            thisProjectElement = this.buildPropPairs( selectedProject, thisProjectElement, ['yourCounts' ] , ['Today ~ Week ~ All'] , false ) ;
                        } else {
                            thisProjectElement = this.buildPropPairs( selectedProject, thisProjectElement, ['yourCounts', 'allCounts'] , ['Today ~ Week ~ All','Today ~ Week ~ All'] , false ) ;
                        }
                    }
                    if ( field === 'ids' ){
                        if ( selectedProject.yourIds === selectedProject.allIds ) {
                            thisProjectElement = this.buildPropPairs( selectedProject, thisProjectElement, ['yourIds' ] , ['Today ~ Week ~ All'] , false, 30 ) ;

                        } else {
                            thisProjectElement = this.buildPropPairs( selectedProject, thisProjectElement, ['yourIds', 'allIds'] , ['Today ~ Week ~ All','Today ~ Week ~ All'] , false, 30 ) ;
                        }
                    }
                    if ( field === 'team' ){ 
                        thisProjectElement = this.buildPropPairs( selectedProject, thisProjectElement, ['leader.Title'] , [] , false ) ;

                        let selectedTeam : string[] = selectedProject.team && selectedProject.team.length > 0 ? 
                            selectedProject.team.map( member => { return member.Title; } ) : [];
                        let selectedTeamTitles : string[] = [];

                        if ( selectedTeam.length > 0 ) {

                            selectedProject.team.map( member => {
                                selectedTeamTitles.push( member.Title );
                            });
                            thisProjectElement.push( <div style={{fontSize: 'x-small'}} title={ 'Team' }> { 'Team' } </div> );
                            thisProjectElement.push( < div style={{marginBottom: '13px'}} title='Team Members'> { selectedTeamTitles.join( ', ' ) } </div> );
                        }
                    }
                });
            }

            const stackButtonTokensFields: IStackTokens = { childrenGap: 0 };

            let projectItemElement = <Stack padding={20} horizontal={false} horizontalAlign={"space-between"} tokens={stackButtonTokensFields}> {/* Stack for Projects and body */}
                    { thisProjectElementHeader }
                    { thisProjectElement }
                </Stack>;

            let backgroundColor = selectedProject.dueInfo.isLate === true ? '#fec4c4' : selectedProject.dueInfo.isDue === true ? 'Khaki' : null;
            let accordionItems = [];
            accordionItems[0] = 
                {   title: updateKey,
                    hoverTitle: selectedProject ? selectedProject.titleProject + ' (' + selectedProject.id +' )' : '',
                    buttonStyle: backgroundColor ? { backgroundColor: backgroundColor } : null,
                    element: projectItemElement };

            console.log('Making Center Pane:' , accordionItems );

            let projectAccordion = thisProjectElement.length > 0 ?
                <ReactAccordion 
                    dangerouslyExpandIndex = { dangerouslyExpandIndex }
                    updateKey = { updateKey }
                    items={ accordionItems }
                    accordionTitle={''}
                    accordianTitleHover={ 'hoverTitle' }
                    accordianTitleProp={'title'}
                    accordianContentProp={'element'}
                    buttonStyle={ 'buttonStyle' }
                    allowMultipleExpanded={ false }
                    allowZeroExpanded={ true }
                ></ReactAccordion> : null ;

            const stackButtonTokensBody: IStackTokens = { childrenGap: 40 };

            let centerStack = [projectAccordion, ActivityLinkElement ];
            //<div className={  }>
            return (
                <div style={{ paddingTop: '20px' }}>
                    <Stack padding={ 5 } horizontal={false} horizontalAlign={"space-between"} tokens={stackButtonTokensBody}> {/* Stack for Projects and body */}
                        { centerStack }
                    </Stack>
                    <ColoredLine color="gray" height="1"/>
                </div>
            );
            
        } else {
            //console.log('centerPanes.tsx return null');
            return ( null );
        }

    }   //End Public Render

    private buildPropPairs( item: any, elementArray: any[], addFields: string[],  valueTitles: string[],showEmpty: boolean, maxSize: number = 50 ) {

        let scHeading = [];
        let scValue = [];
        let scValTitle = [];

        addFields.map( (field, index) => { 
            let fieldVal = '';
            if ( field.indexOf('.') > 0 ) { 
                //First check if primary property exists before checking for subproperty
                fieldVal = item[ field.split('.')[0] ] ? item[ field.split('.')[0] ][ field.split('.')[1] ] : '';
            } else { 
                fieldVal = item[field] ;
                if ( field.toLowerCase().indexOf('date') > -1 ) {
                    fieldVal = fieldVal != null ? new Date(fieldVal).toLocaleDateString() : fieldVal;
                }
            }
            field = field.replace('.', ' ');

            if ( fieldVal && fieldVal.length > 0 || showEmpty === true ) {
                //Credit for TitleCase https://stackoverflow.com/a/196991
                let fieldValue = fieldVal.length > 0 ? fieldVal : 'Empty' ;
                scHeading.push( field.charAt(0).toUpperCase() + field.substr(1) );
                scValue.push( fieldValue );
                scValTitle.push( valueTitles[index] );
            }
        });

        let headingLabel = scHeading.join(' | ');
        let valueLabel = scValue.join(' | ');
        let valueTitle = scValTitle.join(' | ');

        if ( scValue.length > 0 ) {
            elementArray.push( <div style={{fontSize: 'x-small'}} title={ headingLabel }> { headingLabel } </div> );

            if ( valueLabel.length > maxSize ) {
                //set default message, maybe add button to see full list.
                elementArray.push( <div style={{marginBottom: '13px'}} title= { valueLabel }> { 'There are to many to list :)' } </div>);
            } else {
                elementArray.push( <div style={{marginBottom: '13px'}} title= { valueTitle }> { valueLabel } </div>);
            }

        }

        return elementArray;

    }

    private ActivityLink(item: IProjectOptions, _onActivityClick: any) {

        const stackActivityLink: IStackTokens = { childrenGap: 10 };

        let typeSize = item.type.length == 0 ? 20 : Math.min(32, 200 / item.type.length);
        let actSize = item.activity.length == 0 ? 20 : Math.min(32, 200 / item.activity.length);

        const elementType: any = React.createElement("span", { style: {fontSize: typeSize, whiteSpace: 'nowrap'} }, item.type);

        let activityIDs = item.activity.split(';');
        let icon = null;
        let elementActivity: any = null;
        let activityIconElement = null;
        if ( activityIDs == null || activityIDs.length === 1 ) {
            icon =  item.showLink === true ? this.ActivityButton(item, _onActivityClick, item.activity, 72):  MyIcon(item.icon, defCenterIconStyle);
            elementActivity = React.createElement("span", { style: {fontSize: actSize, whiteSpace: 'nowrap'} }, item.activity);
            activityIconElement = <Stack padding={10} horizontal={false} horizontalAlign={"center"} tokens={stackActivityLink}>
                <div> { elementActivity } </div> { icon }
                </Stack>;

        } else if ( activityIDs.length > 2 ) {
            //Adjust actSize based on number of Icons
            actSize = Math.min(32, 200 / (item.activity.length / activityIDs.length));
            activityIconElement = activityIDs.map( activityIDsZZZ => {

                const thisButtonStyles = {root: {
                    padding:'10px !important', 
                    //height: rootSize, width: rootSize, id: 'ZZZZZ1234',
                    fontSize: 24, height: 40, minWidth: 200,
                    whiteSpace: 'nowrap',
                    }};//color: 'green' works here,

                let itemID = item.title + '|Splitme|' + activityIDsZZZ;
                return <div className= {styles.buttonsBig} id={ itemID }>
                    <DefaultButton 
                        //href={ url }
                        styles={ thisButtonStyles  }
                        text= { activityIDsZZZ } 
                        onClick={ _onActivityClick } 
                     /></div>;

            } );
            activityIconElement = <div> { activityIconElement } </div>;

        } else {
            //Adjust actSize based on number of Icons
            actSize = Math.min(32, 200 / (item.activity.length / activityIDs.length));
            activityIconElement = activityIDs.map( activityIDsZZZ => {
                icon =  item.showLink === true ? this.ActivityButton(item, _onActivityClick, activityIDsZZZ, 50):  MyIcon(item.icon, defSmallCenterIconStyle);
                elementActivity = React.createElement("span", { style: {fontSize: actSize, whiteSpace: 'nowrap'} }, activityIDsZZZ);
                return <Stack padding={0} horizontal={true} horizontalAlign={"start"} verticalAlign={"center"} tokens={stackActivityLink}>
                         { icon } { elementActivity }
                    </Stack>;
            } );

        }

        let fullElement: any = <div>
            <Stack padding={10} horizontal={false} horizontalAlign={"center"} tokens={stackActivityLink}> {/* Stack for Projects and body */}
                <div> { elementType } </div>
                { activityIconElement }
            </Stack>
        </div>;

        return fullElement;
    }

    private ActivityButton( item: IProjectOptions, _onActivityClick: any , itemID: string, size: number){

        let rootSize = size;
        let iconSize = size === 72 ? 56 : size === 50? 40 : 50;

        const activityButtonStyles = {
            root: {padding:'10px !important', height: rootSize, width: rootSize, id: 'ZZZZZ1234'},//color: 'green' works here
            icon: { 
            fontSize: item.icon.size ? item.icon.size : iconSize,
            fontWeight: item.font.weight ? item.font.weight : "normal",
            margin: '0px 2px',
            color: item.font.color ? item.font.color :'#00457e', //This will set icon color
        },
        };

        itemID = item.title + '|Splitme|' + itemID;
        //console.log('ActivityButton item:', item);
        let activityButton = createIconButton(item.icon.name, item.title, _onActivityClick, itemID, activityButtonStyles, false );

        return activityButton;
    }

/***
 *         db    db d8888b.       .o88b. db   db  .d88b.  d888888b  .o88b. d88888b 
 *         88    88 88  `8D      d8P  Y8 88   88 .8P  Y8.   `88'   d8P  Y8 88'     
 *         88    88 88oodD'      8P      88ooo88 88    88    88    8P      88ooooo 
 *         88    88 88~~~        8b      88~~~88 88    88    88    8b      88~~~~~ 
 *         88b  d88 88           Y8b  d8 88   88 `8b  d8'   .88.   Y8b  d8 88.     
 *         ~Y8888P' 88            `Y88P' YP   YP  `Y88P'  Y888888P  `Y88P' Y88888P 
 *                                                                                 
 *                                                                                 
 */

private _updateChoice(ev: React.FormEvent<HTMLInputElement>, option: IChoiceGroupOption){

    this.setState({ 

     });
  }

}

