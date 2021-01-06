import * as React from 'react';
import styles from './TrackMyTimeV7.module.scss';
import { ITrackMyTimeV7Props } from './ITrackMyTimeV7Props';
import { escape } from '@microsoft/sp-lodash-subset';

export default class TrackMyTimeV7 extends React.Component<ITrackMyTimeV7Props, {}> {
  public render(): React.ReactElement<ITrackMyTimeV7Props> {
    return (
      <div className={ styles.trackMyTimeV7 }>
        <div className={ styles.container }>
          <div className={ styles.row }>
            <div className={ styles.column }>
              <span className={ styles.title }>Welcome to SharePoint!</span>
              <p className={ styles.subTitle }>Customize SharePoint experiences using Web Parts.</p>
              <p className={ styles.description }>{escape(this.props.description)}</p>
              <a href="https://aka.ms/spfx" className={ styles.button }>
                <span className={ styles.label }>Learn more</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
