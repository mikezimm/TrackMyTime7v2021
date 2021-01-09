//import React from "react";  //This was how it was in Hugo's version  https://github.com/pnp/sp-dev-fx-webparts/blob/99f859c1ec34029887fd8063cd3848cdfbc7a173/samples/react-manage-profile-card-properties/src/Entities/IListItem.ts
import * as React from "react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import {

  IReadonlyTheme
} from "@microsoft/sp-component-base";
import { MSGraphClient } from "@microsoft/sp-http";
import { IListItem } from "../Entities/IListItem";

export interface IAppContextProps {
  title: string;
  webpartContext: WebPartContext;
  themeVariant: IReadonlyTheme;
  msGraphClient: MSGraphClient;
  organizationId: string;
  listItems: IListItem[];
}

export const AppContext = React.createContext<IAppContextProps>(undefined);