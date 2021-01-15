import { DisplayMode } from "@microsoft/sp-core-library";

export interface IReactAccordionProps {
  items: Array<any>;
  updateKey: string;
  dangerouslyExpandIndex: number;
  accordianTitleProp: string;
  accordianContentProp: string;
  accordionTitle: string;
  allowZeroExpanded: boolean;
  allowMultipleExpanded: boolean;
}
