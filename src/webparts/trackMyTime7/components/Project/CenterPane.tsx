import * as React from 'react';

import * as strings from 'TrackMyTime7WebPartStrings';

//import * as links from './AllLinks';

import { ChartControl, ChartType } from '@pnp/spfx-controls-react/lib/ChartControl';
import { CompoundButton, Stack, IStackTokens, elementContains, Link, ILinkProps, DefaultButton } from 'office-ui-fabric-react';
import { IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';

import { ITrackMyTime7Props } from '../ITrackMyTime7Props';
import { ITrackMyTime7State, IProjectOptions } from '../ITrackMyTime7State';

import { ColoredLine, ProjectTitleElement, MyIcon } from '../../../../services/drawServices';

import { createIconButton } from "../createButtons/IconButton";

import styles from '../createButtons/CreateButtons.module.scss';

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
        let hasProject = selectedProject !== null && selectedProject !== undefined ? true : false;

        if ( this.props.allLoaded && this.props.showCenter && this.props.projectIndex > -1  && validProject != null ) {

            let projOptions = validProject.projOptions;

            let ActivityLinkElement = projOptions.showLink == false ? null : this.ActivityLink(projOptions, this.props._onActivityClick);

            let thisProjectElement : any[] = [];

            if ( this.props.parentProps.centerPaneFields.length > 0 && hasProject === true ) {


                this.props.parentProps.centerPaneFields.map( field => {
                    //description: 'coma separted: title,projectID,category,story,task,team',
                    if ( field === 'title' ){   thisProjectElement.push( <div title='Selected Project'> { this.props.parentState.selectedProject.titleProject } </div>);  }

                    if ( field === 'projectid' ){   thisProjectElement.push( 
                        <div title='ProjectID1 and Project ID2'> { this.props.parentState.selectedProject.projectID1.projListValue + ' : ' + this.props.parentState.selectedProject.projectID2.projListValue } </div>);  }

                    if ( field === 'category' ){   thisProjectElement.push( 
                        <div title='Category1 and Category2'> { this.props.parentState.selectedProject.category1 + ' : ' + this.props.parentState.selectedProject.category2 } </div>);  }

                    if ( field === 'story' ){   thisProjectElement.push( 
                        <div title='Story and Chapter'> { this.props.parentState.selectedProject.story + ' : ' + this.props.parentState.selectedProject.chapter } </div>);  }

                    if ( field === 'task' ){   thisProjectElement.push( 
                        <div title='Task Status and Due Date'> { this.props.parentState.selectedProject.status + ' : Due ' + this.props.parentState.selectedProject.dueDate } </div>);  }

                    if ( field === 'team' ){   
                        let selectedLeader = selectedProject.leader ? selectedProject.leader.Title : null;
                        let selectedTeam : string[] = selectedProject.team && selectedProject.team.length > 0 ? 
                            selectedProject.team.map( member => { return member.Title; } ) : [];
                        let selectedTeamTitles : string[] = [];

                        if ( selectedLeader ) { thisProjectElement.push( < div title='Leader'> { selectedLeader } </div> ); }
                        if ( selectedTeam.length > 0 ) {
                        
                            selectedProject.team.map( member => {
                                selectedTeamTitles.push( member.Title );
                            });

                            thisProjectElement.push( < div title='Team Members'> { selectedTeamTitles.join( ',' ) } </div> );
                        }
                    }

                });

            }

            const stackButtonTokensBody: IStackTokens = { childrenGap: 40 };
            const stackButtonTokensFields: IStackTokens = { childrenGap: 10 };
            //<div className={  }>
            return (
                <div>
                    <Stack padding={20} horizontal={false} horizontalAlign={"space-between"} tokens={stackButtonTokensBody}> {/* Stack for Projects and body */}
                        { ActivityLinkElement }
                    </Stack>
                    { thisProjectElement.length === 0 ? null :
                        <Stack padding={20} horizontal={false} horizontalAlign={"space-between"} tokens={stackButtonTokensFields}> {/* Stack for Projects and body */}
                            { thisProjectElement }
                        </Stack>

                    }
                    <ColoredLine color="gray" height="1"/>
                </div>
            );
            
        } else {
            //console.log('centerPanes.tsx return null');
            return ( null );
        }

    }   //End Public Render

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

