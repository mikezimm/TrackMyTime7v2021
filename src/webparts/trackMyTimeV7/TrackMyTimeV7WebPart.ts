import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'TrackMyTimeV7WebPartStrings';
import TrackMyTimeV7 from './components/TrackMyTimeV7';
import { ITrackMyTimeV7Props } from './components/ITrackMyTimeV7Props';

export interface ITrackMyTimeV7WebPartProps {
  description: string;
}

export default class TrackMyTimeV7WebPart extends BaseClientSideWebPart<ITrackMyTimeV7WebPartProps> {

  public render(): void {
    const element: React.ReactElement<ITrackMyTimeV7Props> = React.createElement(
      TrackMyTimeV7,
      {
        description: this.properties.description
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
