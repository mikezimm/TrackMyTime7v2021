import { DisplayMode } from "@microsoft/sp-core-library";

export interface IReactAccordionProps {
  items: Array<any>;
  updateKey: string;
  dangerouslyExpandIndex: number;
  accordianTitleHover: string;  //The element 'title'... ie hover text
  accordianTitleProp: string;
  accordianContentProp: string;
  accordionTitle: string;
  buttonStyle?: string; //item prop for css style like:  "{ backgroundColor: 'green' }" but object key for style
  allowZeroExpanded: boolean;
  allowMultipleExpanded: boolean;
}
