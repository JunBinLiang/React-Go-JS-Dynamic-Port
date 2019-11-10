/*
*  Copyright (C) 1998-2019 by Northwoods Software Corporation. All Rights Reserved.
*/

import * as go from 'gojs';
import { ReactDiagram } from 'gojs-react';
import * as React from 'react';

import { GuidedDraggingTool } from '../GuidedDraggingTool';

import './Diagram.css';

interface DiagramProps {
  nodeDataArray: Array<go.ObjectData>;
  linkDataArray: Array<go.ObjectData>;
  modelData: go.ObjectData;
  skipsDiagramUpdate: boolean;
  onDiagramEvent: (e: go.DiagramEvent) => void;
  onModelChange: (e: go.IncrementalData) => void;
}

export class DiagramWrapper extends React.Component<DiagramProps, {}> {
  /**
   * Ref to keep a reference to the Diagram component, which provides access to the GoJS diagram via getDiagram().
   */
  private diagramRef: React.RefObject<ReactDiagram>;

  /** @internal */
  constructor(props: DiagramProps) {
    super(props);
    this.diagramRef = React.createRef();
  }

  /**
   * Get the diagram reference and add any desired diagram listeners.
   * Typically the same function will be used for each listener, with the function using a switch statement to handle the events.
   */
  public componentDidMount() {
    if (!this.diagramRef.current) return;
    const diagram = this.diagramRef.current.getDiagram();
    if (diagram instanceof go.Diagram) {
      diagram.addDiagramListener('ChangedSelection', this.props.onDiagramEvent);
    }
  }

  /**
   * Get the diagram reference and remove listeners that were added during mounting.
   */
  public componentWillUnmount() {
    if (!this.diagramRef.current) return;
    const diagram = this.diagramRef.current.getDiagram();
    if (diagram instanceof go.Diagram) {
      diagram.removeDiagramListener('ChangedSelection', this.props.onDiagramEvent);
    }
  }

  /**
   * Diagram initialization method, which is passed to the ReactDiagram component.
   * This method is responsible for making the diagram and initializing the model, any templates,
   * and maybe doing other initialization tasks like customizing tools.
   * The model's data should not be set here, as the ReactDiagram component handles that.
   */
  private initDiagram(): go.Diagram {
    const $ = go.GraphObject.make;
    const diagram =
      $(go.Diagram,
        {
          'undoManager.isEnabled': true,  // enable undo & redo
          'clickCreatingTool.archetypeNodeData': { text: 'new node', color: 'lightblue' },
          draggingTool: new GuidedDraggingTool(),  // defined in GuidedDraggingTool.ts
          'draggingTool.horizontalGuidelineColor': 'blue',
          'draggingTool.verticalGuidelineColor': 'blue',
          'draggingTool.centerGuidelineColor': 'green',
          'draggingTool.guidelineWidth': 1,
          model: $(go.GraphLinksModel,
            {


              linkFromPortIdProperty: "fromPort",  // required information:
              linkToPortIdProperty: "toPort",

              linkKeyProperty: 'key',  // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
              // positive keys for nodes
              makeUniqueKeyFunction: (m: go.Model, data: any) => {
                let k = data.key || 1;
                while (m.findNodeDataForKey(k)) k++;
                data.key = k;
                return k;
              },
              // negative keys for links
              makeUniqueLinkKeyFunction: (m: go.GraphLinksModel, data: any) => {
                let k = data.key || -1;
                while (m.findLinkDataForKey(k)) k--;
                data.key = k;
                return k;
              }
            })
        });

    // define a simple Node template
    /*
    diagram.nodeTemplate =
      $(go.Node, 'Auto',  // the Shape will go around the TextBlock
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Shape, 'RoundedRectangle',
          {
            name: 'SHAPE', fill: 'white', strokeWidth: 0,
            // set the port properties:
            portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer'
          },
          // Shape.fill is bound to Node.data.color
          new go.Binding('fill', 'color')),
        $(go.TextBlock,
          { margin: 8, editable: true, font: '400 .875rem Roboto, sans-serif' },  // some room around the text
          new go.Binding('text').makeTwoWay()
        )
      );

*/





//  port using
//  toLinkable:draw
//  fromLinkable: accept


/*
diagram.nodeTemplate =
$(go.Node, "Auto",
  $(go.Shape, "RoundedRectangle", { fill: "lightgray" },  new go.Binding('fill', 'color')),
  $(go.Panel, "Table",
    $(go.RowColumnDefinition,
      { column: 0, alignment: go.Spot.Left}),
    $(go.RowColumnDefinition,
      { column: 2, alignment: go.Spot.Right }),
    $(go.TextBlock,  // the node title
      { column: 0, row: 0, columnSpan: 3, alignment: go.Spot.Center,
        font: "bold 10pt sans-serif", margin: new go.Margin(4, 2) },
        new go.Binding("text", "text")),
    $(go.Panel, "Horizontal",
      { column: 0, row: 1 },

      $(go.Shape,  // the "A" port
        { width: 6, height: 6, portId: "A", toSpot: go.Spot.Left,
          toLinkable: true,fromLinkable: true, toMaxLinks: 1 }),  // allow user-drawn links from here
      $(go.TextBlock, "1")  // "A" port label
    ),

    $(go.Panel, "Vertical",
      new go.Binding("itemArray", "leftArray"),
      {
        row: 1, column: 0,
        itemTemplate:
          $(go.Panel,
            {
              _side: "left",  // internal property to make it easier to tell which side it's on
              fromSpot: go.Spot.Left, toSpot: go.Spot.Left,
              fromLinkable: true, toLinkable: true, cursor: "pointer",
              //contextMenu: portMenu
            },
            new go.Binding("portId", "portId"),
            $(go.Shape, "Rectangle",
              {
                stroke: null, strokeWidth: 0,
                width: 6, height: 6,
                margin: new go.Margin(1, 0)
              },
              new go.Binding("fill", "portColor"))
          )  // end itemTemplate
      }),



    $(go.Panel, "Horizontal",
      { column: 2, row: 1, rowSpan: 2 },
      $(go.TextBlock, "A"),  // "Out" port label
      $(go.Shape,  // the "Out" port
        { width: 6, height: 6, portId: "Out", fromSpot: go.Spot.Right,
          toLinkable: true,fromLinkable: true })  // allow user-drawn links to here
    )
  )
);
*/



//dynamic port
diagram.nodeTemplate =
$(go.Node, "Auto",
  $(go.Shape, "RoundedRectangle", { fill: "lightgray" },  new go.Binding('fill', 'color')),
  $(go.Panel, "Table",
    $(go.RowColumnDefinition,
      { column: 0, alignment: go.Spot.Left}),
    $(go.RowColumnDefinition,
      { column: 4, alignment: go.Spot.Right }),
    $(go.TextBlock,  // the node title
      { column: 0, row: 0, columnSpan: 3, alignment: go.Spot.Center,
        font: "bold 10pt sans-serif", margin: new go.Margin(4, 2) },
        new go.Binding("text", "text")),


        $(go.Panel, "Vertical",
          new go.Binding("itemArray", "rightArray"),
          {
            row: 1, column: 4,
            itemTemplate:
              $(go.Panel,
                {
                  _side: "right",  // internal property to make it easier to tell which side it's on
                  fromSpot: go.Spot.Left, toSpot: go.Spot.Left,
                  fromLinkable: true, toLinkable: true, cursor: "pointer",
                  //contextMenu: portMenu
                },
                new go.Binding("portId", "portId"),
                $(go.Shape, "Rectangle",
                  {
                    stroke: null, strokeWidth: 0,
                    width: 10, height: 10,
                    margin: new go.Margin(2, 0)
                  },
                  new go.Binding("fill", "portColor"))
              )  // end itemTemplate
          }),

    $(go.Panel, "Vertical",
      new go.Binding("itemArray", "leftArray"),
      {
        row: 1, column: 0,
        itemTemplate:
          $(go.Panel,
            {
              _side: "left",  // internal property to make it easier to tell which side it's on
              fromSpot: go.Spot.Left, toSpot: go.Spot.Left,
              fromLinkable: true, toLinkable: true, cursor: "pointer",
              //contextMenu: portMenu
            },
            new go.Binding("portId", "portId"),
            $(go.Shape, "Rectangle",
              {
                stroke: null, strokeWidth: 0,
                width: 10, height: 10,
                margin: new go.Margin(2, 0)
              },
              new go.Binding("fill", "portColor"))
          )  // end itemTemplate
      }),


      $(go.Panel, "Horizontal",
        new go.Binding("itemArray", "topArray"),
        {
          row: 0, column: 1,
          itemTemplate:
            $(go.Panel,
              {
                _side: "top",  // internal property to make it easier to tell which side it's on
                fromSpot: go.Spot.Left, toSpot: go.Spot.Left,
                fromLinkable: true, toLinkable: true, cursor: "pointer",
                //contextMenu: portMenu
              },
              new go.Binding("portId", "portId"),
              $(go.Shape, "Rectangle",
                {
                  stroke: null, strokeWidth: 0,
                  width: 10, height: 10,
                  margin: new go.Margin(0, 2)
                },
                new go.Binding("fill", "portColor"))
            )  // end itemTemplate
        }),


        $(go.Panel, "Horizontal",
          new go.Binding("itemArray", "bottomArray"),
          {
            row: 2, column: 1,
            itemTemplate:
              $(go.Panel,
                {
                  _side: "bottom",  // internal property to make it easier to tell which side it's on
                  fromSpot: go.Spot.Left, toSpot: go.Spot.Left,
                  fromLinkable: true, toLinkable: true, cursor: "pointer",
                  //contextMenu: portMenu
                },
                new go.Binding("portId", "portId"),
                $(go.Shape, "Rectangle",
                  {
                    stroke: null, strokeWidth: 0,
                    width: 10, height: 10,
                    margin: new go.Margin(0, 2)
                  },
                  new go.Binding("fill", "portColor"))
              )  // end itemTemplate
          }),



  )
);




    // relinking depends on modelData
    diagram.linkTemplate =
      $(go.Link,
        new go.Binding('relinkableFrom', 'canRelink').ofModel(),
        new go.Binding('relinkableTo', 'canRelink').ofModel(),
        $(go.Shape),
        $(go.Shape, { toArrow: 'Standard' })
      );

    return diagram;
  }

  public render() {
    
    return (
      <ReactDiagram
        ref={this.diagramRef}
        divClassName='diagram-component'
        initDiagram={this.initDiagram}
        nodeDataArray={this.props.nodeDataArray}
        linkDataArray={this.props.linkDataArray}
        modelData={this.props.modelData}
        onModelChange={this.props.onModelChange}
        skipsDiagramUpdate={this.props.skipsDiagramUpdate}
      />
    );
  }
}
