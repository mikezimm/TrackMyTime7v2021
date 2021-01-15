import * as React from "react";
import styles from "./ReactAccordion.module.scss";
import { IReactAccordionProps } from "./IReactAccordionProps";
import { sp } from "@pnp/sp/presets/all";
import { Placeholder } from "@pnp/spfx-controls-react/lib/Placeholder";
import { WebPartTitle } from "@pnp/spfx-controls-react/lib/WebPartTitle";
import "./reactAccordion.css";

import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from "react-accessible-accordion";

export interface IReactAccordionState {

//  choices: Array<any>;
  allowMultipleExpanded: boolean;
  allowZeroExpanded: boolean;
}

export default class ReactAccordion extends React.Component<
  IReactAccordionProps,
  IReactAccordionState
> {
  constructor(props: IReactAccordionProps) {
    super(props);

    this.state = {
//      choices: new Array<any>(),
      allowMultipleExpanded: this.props.allowMultipleExpanded,
      allowZeroExpanded: this.props.allowZeroExpanded,
    };

  }

  public componentDidUpdate(prevProps: IReactAccordionProps): void {
    if (prevProps.updateKey !== this.props.updateKey) {

    }

    if (
      prevProps.allowMultipleExpanded !== this.props.allowMultipleExpanded ||
      prevProps.allowZeroExpanded !== this.props.allowZeroExpanded
    ) {
      this.setState({
        allowMultipleExpanded: this.props.allowMultipleExpanded,
        allowZeroExpanded: this.props.allowZeroExpanded,
      });
    }
  }

  public render(): React.ReactElement<IReactAccordionProps> {
    console.log('ReactAccordion props:', this.props );
    const hasItems: boolean =
     this.props.items.length > 0 ? true : false ;
    const { allowMultipleExpanded, allowZeroExpanded } = this.state;
    let returnThis = hasItems === false ? null : 
      <div className={styles.reactAccordion}>
          <Accordion
            allowZeroExpanded={allowZeroExpanded}
            allowMultipleExpanded={allowMultipleExpanded}
          >
            {this.props.items.map((item: any, index ) => {
              return (
                <AccordionItem
                  dangerouslySetExpanded={ this.props.dangerouslyExpandIndex === index ? true : null }>
                  <AccordionItemHeading>
                    <AccordionItemButton
                      title={item[this.props.accordianTitleProp]}
                    >
                      {  item[this.props.accordianTitleProp]  }
                      </AccordionItemButton>
                      </AccordionItemHeading>
                      <AccordionItemPanel>
                        {  item[this.props.accordianContentProp] }
                      </AccordionItemPanel>
                </AccordionItem>
              );
            })}
          </Accordion>
    </div>;

    return returnThis;
  }
}

/*

                    <AccordionItemHeading>
                      <AccordionItemButton
                        //title={item[this.props.accordianTitleProp]}
                      >
                        {  item[this.props.accordianTitleProp]  }
                        </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                          {  item[this.props.accordianContentProp] }
                        </AccordionItemPanel>

  */