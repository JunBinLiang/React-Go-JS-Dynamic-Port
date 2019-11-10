/*
*  Copyright (C) 1998-2019 by Northwoods Software Corporation. All Rights Reserved.
*/

import * as go from 'gojs';
import { produce } from 'immer';
import * as React from 'react';

import { DiagramWrapper } from './components/Diagram';
import { SelectionInspector } from './components/SelectionInspector';


import './App.css';

interface AppState
{
  counterId:any,
  nodeDataArray: Array<go.ObjectData>;
  linkDataArray: Array<go.ObjectData>;
  modelData: go.ObjectData;
  selectedData: go.ObjectData | null;
  skipsDiagramUpdate: boolean;
}

class App extends React.Component<{}, AppState> {
  // Maps to store key -> arr index for quick lookups
  private mapNodeKeyIdx: Map<go.Key, number>;
  private mapLinkKeyIdx: Map<go.Key, number>;

  constructor(props: object) {
    super(props);
    this.state =
    {
      counterId:0,
      nodeDataArray: [
        // define the component data
        //{ key: 0, text1: 'Alpha', color: 'lightblue', loc: '0 0', "leftArray":[ {"portId":"a"},{"portId":"b"},{"portId":"c"} ],"topArray":[ {"portId":"a1"},{"portId":"b2"},{"portId":"c3"} ] },
        { key: 0, text1: 'Beta', color: 'orange', loc: '150 0',"leftArray":[],"rightArray":[],"topArray":[],"bottomArray":[] },
        { key: 1, text1: 'Beta', color: 'orange', loc: '150 0',"leftArray":[],"rightArray":[],"topArray":[],"bottomArray":[] },
        { key: 2, text1: 'Beta', color: 'orange', loc: '150 0',"leftArray":[],"rightArray":[],"topArray":[],"bottomArray":[] },
        { key: 3, text1: 'Beta', color: 'orange', loc: '150 0',"leftArray":[],"rightArray":[],"topArray":[],"bottomArray":[] }
      ],
      linkDataArray: [  // define the link data
        //{ key: -1, from: 0, to: 1 },
        //{ key: -2, from: 0, to: 2, fromPort: "A", toPort: "Out"},
        //{ key: -3, from: 1, to: 1 },
        //{ key: -4, from: 2, to: 3 },
        //{ key: -5, from: 3, to: 0 }
      ],
      modelData: {
        canRelink: true
      },
      selectedData: null,
      skipsDiagramUpdate: false
    };

    // init maps
    this.mapNodeKeyIdx = new Map<go.Key, number>();
    this.mapLinkKeyIdx = new Map<go.Key, number>();

    this.refreshNodeIndex(this.state.nodeDataArray);  //array data to map
    this.refreshLinkIndex(this.state.linkDataArray);


    // bind handler methods
    this.handleDiagramEvent = this.handleDiagramEvent.bind(this);   //3 possibiliby :1. click component 2.Click Link 3. clikck empty
    this.handleModelChange = this.handleModelChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleRelinkChange = this.handleRelinkChange.bind(this);
    this.handleClick=this.handleClick.bind(this);
  }



//Dynamic port behavior, written by JunBin
 public handleClick(pos:any){
   //console.log("click",pos);
   const selectedData = this.state.selectedData;
   if(selectedData==null){
     return;
   }
   var countId=this.state.counterId;

   var key=selectedData.key;
   var newnodeDataArray=[];
   for(var i=0;i<this.state.nodeDataArray.length;i++){
     newnodeDataArray.push({...this.state.nodeDataArray[i],leftArray:[...this.state.nodeDataArray[i]['leftArray']],rightArray:[...this.state.nodeDataArray[i]['rightArray']],topArray:[...this.state.nodeDataArray[i]['topArray']],bottomArray:[...this.state.nodeDataArray[i]['bottomArray']]})
   }


    // console.log(newnodeDataArray);
   //console.log("key",key);
   //console.log("arr",  newnodeDataArray[0]['rightArray']);

   for(var i=0;i<this.state.nodeDataArray.length;i++)
   {
     if(i==key){
       var newport={"portId":""+countId};
       if(pos=="leftArray"){
         newnodeDataArray[i]['leftArray'].push(newport);
       }
       if(pos=="rightArray"){
         newnodeDataArray[i]['rightArray'].push(newport);
       }
       if(pos=="topArray"){
         newnodeDataArray[i]['topArray'].push(newport);
       }
       if(pos=="bottomArray"){
         newnodeDataArray[i]['bottomArray'].push(newport);
       }

     }
   }
   this.setState({ counterId: countId+1, nodeDataArray:newnodeDataArray});

 }





  /**
   * Update map of node keys to their index in the array.
   */
  private refreshNodeIndex(nodeArr: Array<go.ObjectData>) {
    this.mapNodeKeyIdx.clear();
    nodeArr.forEach((n: go.ObjectData, idx: number) => {
      //console.log(n) :    object : { key: 0, text: 'Alpha', color: 'lightblue', loc: '0 0' },
      //console.log(idx);   0 1 2 3
      this.mapNodeKeyIdx.set(n.key, idx);
    });
  }

  /**
   * Update map of link keys to their index in the array.
   */
  private refreshLinkIndex(linkArr: Array<go.ObjectData>) {
    this.mapLinkKeyIdx.clear();
    linkArr.forEach((l: go.ObjectData, idx: number) => {
      this.mapLinkKeyIdx.set(l.key, idx);
    });
  }

  /**
   * Handle any relevant DiagramEvents, in this case just selection changes.
   * On ChangedSelection, find the corresponding data and set the selectedData state.
   * @param e a GoJS DiagramEvent
   */


  public handleDiagramEvent(e: go.DiagramEvent) {
    const name = e.name;
    switch (name) {
      case 'ChangedSelection': {
        const sel = e.subject.first();
        this.setState(
          produce((draft: AppState) => {
            // produce : immer  draft:data about the thing you trigger
            if (sel) {
              if (sel instanceof go.Node) {
                const idx = this.mapNodeKeyIdx.get(sel.key);
                if (idx !== undefined && idx >= 0) {
                  const nd = draft.nodeDataArray[idx];
                  draft.selectedData = nd;
                }
              } else if (sel instanceof go.Link) {
                const idx = this.mapLinkKeyIdx.get(sel.key);
                if (idx !== undefined && idx >= 0) {
                  const ld = draft.linkDataArray[idx];
                  draft.selectedData = ld;
                }
              }
            } else {
              draft.selectedData = null;
            }
            //console.log(draft);
          })
        );
        break;
      }
      default: break;
    }
  }

  /**
   * Handle GoJS model changes, which output an object of data changes via Model.toIncrementalData.
   * This method iterates over those changes and updates state to keep in sync with the GoJS model.
   * @param obj a JSON-formatted string
   */
  public handleModelChange(obj: go.IncrementalData) {
    const insertedNodeKeys = obj.insertedNodeKeys;
    const modifiedNodeData = obj.modifiedNodeData;
    const removedNodeKeys = obj.removedNodeKeys;
    const insertedLinkKeys = obj.insertedLinkKeys;
    const modifiedLinkData = obj.modifiedLinkData;
    const removedLinkKeys = obj.removedLinkKeys;
    const modifiedModelData = obj.modelData;

    // maintain maps of modified data so insertions don't need slow lookups
    const modifiedNodeMap = new Map<go.Key, go.ObjectData>();
    const modifiedLinkMap = new Map<go.Key, go.ObjectData>();
    this.setState(
      produce((draft: AppState) => {
        let narr = draft.nodeDataArray;
        if (modifiedNodeData) {
          modifiedNodeData.forEach((nd: go.ObjectData) => {
            modifiedNodeMap.set(nd.key, nd);
            const idx = this.mapNodeKeyIdx.get(nd.key);
            if (idx !== undefined && idx >= 0) {
              narr[idx] = nd;
              if (draft.selectedData && draft.selectedData.key === nd.key) {
                draft.selectedData = nd;
              }
            }
          });
        }
        if (insertedNodeKeys) {
          insertedNodeKeys.forEach((key: go.Key) => {
            const nd = modifiedNodeMap.get(key);
            const idx = this.mapNodeKeyIdx.get(key);
            if (nd && idx === undefined) {
              this.mapNodeKeyIdx.set(nd.key, narr.length);
              narr.push(nd);
            }
          });
        }
        if (removedNodeKeys) {
          narr = narr.filter((nd: go.ObjectData) => {
            if (removedNodeKeys.includes(nd.key)) {
              return false;
            }
            return true;
          });
          draft.nodeDataArray = narr;
          this.refreshNodeIndex(narr);
        }

        let larr = draft.linkDataArray;
        if (modifiedLinkData) {
          modifiedLinkData.forEach((ld: go.ObjectData) => {
            modifiedLinkMap.set(ld.key, ld);
            const idx = this.mapLinkKeyIdx.get(ld.key);
            if (idx !== undefined && idx >= 0) {
              larr[idx] = ld;
              if (draft.selectedData && draft.selectedData.key === ld.key) {
                draft.selectedData = ld;
              }
            }
          });
        }
        if (insertedLinkKeys) {
          insertedLinkKeys.forEach((key: go.Key) => {
            const ld = modifiedLinkMap.get(key);
            const idx = this.mapLinkKeyIdx.get(key);
            if (ld && idx === undefined) {
              this.mapLinkKeyIdx.set(ld.key, larr.length);
              larr.push(ld);
            }
          });
        }
        if (removedLinkKeys) {
          larr = larr.filter((ld: go.ObjectData) => {
            if (removedLinkKeys.includes(ld.key)) {
              return false;
            }
            return true;
          });
          draft.linkDataArray = larr;
          this.refreshLinkIndex(larr);
        }
        // handle model data changes, for now just replacing with the supplied object
        if (modifiedModelData) {
          draft.modelData = modifiedModelData;
        }
        draft.skipsDiagramUpdate = true;  // the GoJS model already knows about these updates
      })
    );
  }

  /**
   * Handle inspector changes, and on input field blurs, update node/link data state.
   * @param path the path to the property being modified
   * @param value the new value of that property
   * @param isBlur whether the input event was a blur, indicating the edit is complete
   */

  public handleInputChange(path: string, value: string, isBlur: boolean) {
    this.setState(
      produce((draft: AppState) => {
        const data = draft.selectedData as go.ObjectData;  // only reached if selectedData isn't null
        data[path] = value;
        if (isBlur) {
          const key = data.key;
          if (key < 0) {  // negative keys are links
            const idx = this.mapLinkKeyIdx.get(key);
            if (idx !== undefined && idx >= 0) {
              draft.linkDataArray[idx] = data;
              draft.skipsDiagramUpdate = false;
            }
          } else {
            const idx = this.mapNodeKeyIdx.get(key);
            if (idx !== undefined && idx >= 0) {
              draft.nodeDataArray[idx] = data;
              draft.skipsDiagramUpdate = false;
            }
          }
        }
      })
    );
  }

  /**
   * Handle changes to the checkbox on whether to allow relinking.
   * @param e a change event from the checkbox
   */
  public handleRelinkChange(e: any) {

    const target = e.target;
    const value = target.checked;
    this.setState({ modelData: { canRelink: value }, skipsDiagramUpdate: false });
  }

  public render() {
    //console.log(this.state);
    const selectedData = this.state.selectedData;
    let inspector;
    if (selectedData !== null) {
      /*inspector = <SelectionInspector
                    selectedData={this.state.selectedData}
                    onInputChange={this.handleInputChange}
                  />;
                  */
      inspector="Can Add Port"
    }
    return (
      <div>
        <p>
          User Must Click the component first, then they can add port by clicking the 4 buttons below
        </p>
        <DiagramWrapper
          nodeDataArray={this.state.nodeDataArray}
          linkDataArray={this.state.linkDataArray}
          modelData={this.state.modelData}
          skipsDiagramUpdate={this.state.skipsDiagramUpdate}
          onDiagramEvent={this.handleDiagramEvent}
          onModelChange={this.handleModelChange}
        />
        <label>
          Allow Relinking?
          <input
            type='checkbox'
            id='relink'
            checked={this.state.modelData.canRelink}
            onChange={this.handleRelinkChange} />
        </label>
		      <button onClick={()=>{this.handleClick("topArray")}}>Top </button>
          <button onClick={()=>{this.handleClick("bottomArray")}}>Bottom </button>
          <button onClick={()=>{this.handleClick("leftArray")}}>Left </button>
          <button onClick={()=>{this.handleClick("rightArray")}}>Right </button>
          <br/>
        <h3>{inspector}</h3>
      </div>
    );
  }
}

export default App;
