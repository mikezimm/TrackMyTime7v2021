import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'TrackMyTime7WebPartStrings';
import TrackMyTime7 from './components/TrackMyTime7';
import { ITrackMyTime7Props } from './components/ITrackMyTime7Props';

import PnPControls from './components/PnPControls';
import { IPnPControlsProps } from './components/IPnPControlsProps';

import { PropertyFieldListPicker, PropertyFieldListPickerOrderBy } from '@pnp/spfx-property-controls/lib/PropertyFieldListPicker';
import { PropertyFieldTermPicker } from '@pnp/spfx-property-controls/lib/PropertyFieldTermPicker';

import { IPickerTerms } from "@pnp/spfx-property-controls/lib/PropertyFieldTermPicker";

export interface ITrackMyTime7WebPartProps {
  lists: string | string[]; // Stores the list ID(s)
  terms: IPickerTerms ; // Keeps hold of the selected terms
  description: string;
}

export default class TrackMyTime7WebPart extends BaseClientSideWebPart<ITrackMyTime7WebPartProps> {

  public render(): void {
    const element: React.ReactElement<IPnPControlsProps> = React.createElement(
        PnPControls,
        {
          context: this.context,
          description: this.properties.description,
          list: this.properties.lists || "",
          terms: this.properties.terms || null
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
                }),
                PropertyFieldListPicker('lists', {
                  label: 'Select a list',
                  selectedList: this.properties.lists,
                  includeHidden: false,
                  orderBy: PropertyFieldListPickerOrderBy.Title,
                  disabled: false,
                  baseTemplate: 101,
                  onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                  properties: this.properties,
                  context: this.context,
                  onGetErrorMessage: null,
                  deferredValidationTime: 0,
                  key: 'listPickerFieldId'
                }),
                PropertyFieldTermPicker('terms', {
                  label: 'Select a term',
                  panelTitle: 'Select a term',
                  initialValues: this.properties.terms,
                  allowMultipleSelections: false,
                  excludeSystemGroup: false,
                  onPropertyChange: this.onPropertyPaneFieldChanged,
                  properties: this.properties,
                  context: this.context,
                  onGetErrorMessage: null,
                  deferredValidationTime: 0,
                  key: 'termSetsPickerFieldId'
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
