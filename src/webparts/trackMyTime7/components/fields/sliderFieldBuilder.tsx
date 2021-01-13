

import * as React from 'react';

import {IProject, ISmartText, ITimeEntry, IProjectTarget, IProjects, IProjectInfo, IEntryInfo, IEntries, ITrackMyTime7State, ISaveEntry} from '../ITrackMyTime7State';

import { IUser, ILink, IChartSeries, ICharNote,  } from '../../../../services/IReUsableInterfaces';

import { ITrackMyTime7Props } from '../ITrackMyTime7Props';
import * as strings from 'TrackMyTime7WebPartStrings';

import { Slider, ISliderProps } from 'office-ui-fabric-react/lib/Slider';

import styles from '../TrackMyTime7.module.scss';


export function createSlider(parentProps:ITrackMyTime7Props , parentState: ITrackMyTime7State, _onChange){


  if ( parentState.currentTimePicker !== 'slider') { return ""; }
  let maxTime = parentProps.timeSliderMax;
  return (
    <div style={{minWidth: 400, }}>
      <Slider 
      label={ ((parentState.timeSliderValue < 0)  ? "Start time is in the past" : "End time is Back to the future" ) }
      min={ -1 * maxTime } 
      max={ maxTime } 
      step={ parentProps.timeSliderInc } 
      defaultValue={ 0 } 
      valueFormat={value => `${value} mins`}
      showValue 
      originFromZero
      onChange={_onChange}
     />

    </div>

  );

}

/*
function _onChange(ev: React.FormEvent<HTMLInputElement>, option: IChoiceGroupOption): void {
  console.dir(option);
}
*/